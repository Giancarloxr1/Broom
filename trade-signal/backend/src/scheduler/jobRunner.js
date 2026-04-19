// src/scheduler/jobRunner.js - Esecuzione ciclo scan: per ogni asset+TF
import { query } from '../db/pool.js';
import { getKlines } from '../binance/client.js';
import { computeAll, DEFAULT_PARAMS } from '../indicators/index.js';
import { ema } from '../indicators/ema.js';
import { evaluateRule } from '../engine/evaluator.js';
import { scoreAt, decide, combineTf } from '../engine/smartScorer.js';
import { canEmit, canEmitSmart } from '../engine/cooldown.js';
import { buildSnapshot, persistSignal } from '../engine/signalBuilder.js';
import { sendAlert, setLastScanAt } from '../telegram/bot.js';
import { tfToBinance } from '../utils/timeframes.js';
import { logger } from '../utils/logger.js';

const CANDLE_LIMIT = 500;
const SMART_COOLDOWN_MIN = 60;

async function loadActiveAssets() {
  const { rows } = await query(
    `SELECT id, symbol, display_name FROM assets WHERE active = TRUE ORDER BY id`
  );
  return rows;
}

async function loadActiveRules() {
  const { rows } = await query(
    `SELECT id, name, type, dsl, timeframes, confluence_mode, cooldown_minutes
     FROM rules WHERE enabled = TRUE`
  );
  return rows;
}

async function loadIndicatorConfigs(assetId) {
  const { rows } = await query(
    `SELECT indicator_name, params, enabled FROM indicator_configs
     WHERE asset_id = $1 OR asset_id IS NULL`,
    [assetId]
  );
  if (rows.length === 0) {
    // default: tutti attivi con DEFAULT_PARAMS
    return Object.keys(DEFAULT_PARAMS).map(name => ({
      name, params: DEFAULT_PARAMS[name], enabled: true
    }));
  }
  return rows
    .filter(r => r.enabled)
    .map(r => ({
      name: r.indicator_name,
      params: r.params || DEFAULT_PARAMS[r.indicator_name] || {}
    }));
}

async function loadSmartWeights() {
  const { rows } = await query(
    `SELECT indicator_name, weight, enabled, threshold_buy,
            threshold_sell, tf_confluence_count
     FROM indicator_weights`
  );
  return rows.map(r => ({
    indicator_name: r.indicator_name,
    weight: Number(r.weight),
    enabled: r.enabled,
    threshold_buy: Number(r.threshold_buy),
    threshold_sell: Number(r.threshold_sell),
    tf_confluence_count: r.tf_confluence_count
  }));
}

async function upsertCandles(assetId, tf, candles) {
  if (candles.length === 0) return;
  // Upsert in batch con unnest
  const openTimes = candles.map(c => c.openTime);
  const closeTimes = candles.map(c => c.closeTime);
  const opens = candles.map(c => c.open);
  const highs = candles.map(c => c.high);
  const lows = candles.map(c => c.low);
  const closes = candles.map(c => c.close);
  const vols = candles.map(c => c.volume);
  await query(
    `INSERT INTO candles_cache
      (asset_id, timeframe, open_time, close_time, open, high, low, close, volume)
     SELECT $1, $2, o, ct, op, h, l, c, v FROM UNNEST(
       $3::bigint[], $4::bigint[], $5::numeric[], $6::numeric[],
       $7::numeric[], $8::numeric[], $9::numeric[]
     ) AS t(o, ct, op, h, l, c, v)
     ON CONFLICT (asset_id, timeframe, open_time) DO UPDATE SET
       close_time = EXCLUDED.close_time,
       open = EXCLUDED.open,
       high = EXCLUDED.high,
       low = EXCLUDED.low,
       close = EXCLUDED.close,
       volume = EXCLUDED.volume`,
    [assetId, tf, openTimes, closeTimes, opens, highs, lows, closes, vols]
  );
}

function collectTimeframes(rules, smartTfs) {
  const set = new Set(smartTfs);
  for (const r of rules) {
    for (const tf of r.timeframes || []) set.add(tf);
  }
  if (set.size === 0) ['1h', '4h', '1d'].forEach(t => set.add(t));
  return [...set];
}

function computeExtraEma(candles) {
  const closes = candles.map(c => Number(c.close));
  return {
    ema20: ema(closes, 20),
    ema50: ema(closes, 50),
    ema200: ema(closes, 200)
  };
}

async function evaluateManualRule(rule, perTf, asset) {
  const results = [];
  for (const { tf, candles, indicators, extraEma } of perTf) {
    if (!rule.timeframes.includes(tf)) continue;
    const { matched, idx } = evaluateRule(rule.dsl, {
      candles, indicators, extraEma
    });
    results.push({ tf, matched, idx, candles, indicators });
  }
  if (results.length === 0) return null;
  const matchedCount = results.filter(r => r.matched).length;
  const mode = rule.confluence_mode || 'all_tf';
  let ok = false;
  if (mode === 'any_tf') ok = matchedCount > 0;
  else if (mode === 'all_tf') ok = matchedCount === results.length;
  else ok = matchedCount >= 1;
  if (!ok) return null;
  // emetti sul primo TF matched (quello piu' corto di solito)
  const hit = results.find(r => r.matched);
  const allowed = await canEmit({
    ruleId: rule.id, assetId: asset.id, cooldownMinutes: rule.cooldown_minutes
  });
  if (!allowed) return null;
  const price = Number(hit.candles[hit.idx].close);
  const snapshot = buildSnapshot(hit.indicators, hit.idx);
  const signal = await persistSignal({
    assetId: asset.id,
    ruleId: rule.id,
    source: 'manual',
    type: rule.type,
    timeframe: hit.tf,
    price,
    score: null,
    snapshot
  });
  return signal;
}

async function evaluateSmartMode(weights, perTf, asset) {
  if (!weights || weights.length === 0) return null;
  const active = weights.filter(w => w.enabled);
  if (active.length === 0) return null;
  const tBuy = Number(active[0].threshold_buy);
  const tSell = Number(active[0].threshold_sell);
  const required = Number(active[0].tf_confluence_count) || 1;

  const perTfSignals = [];
  for (const { tf, candles, indicators } of perTf) {
    const idx = candles.length - 1;
    const { score, votes } = scoreAt(indicators, weights, candles, idx);
    const sig = decide(score, tBuy, tSell);
    perTfSignals.push({ tf, signal: sig, score, votes, idx, candles, indicators });
  }
  const finalSig = combineTf(perTfSignals, required);
  if (!finalSig) return null;
  const hit = perTfSignals.find(p => p.signal === finalSig) || perTfSignals[0];
  const allowed = await canEmitSmart({
    assetId: asset.id, source: 'smart', cooldownMinutes: SMART_COOLDOWN_MIN
  });
  if (!allowed) return null;
  const price = Number(hit.candles[hit.idx].close);
  const snapshot = buildSnapshot(hit.indicators, hit.idx);
  // inietta voti nel snapshot per il formatter
  for (const [n, v] of Object.entries(hit.votes)) {
    if (snapshot[n]) snapshot[n].vote = v;
  }
  return persistSignal({
    assetId: asset.id,
    ruleId: null,
    source: 'smart',
    type: finalSig,
    timeframe: hit.tf,
    price,
    score: hit.score,
    snapshot
  });
}

export async function runScanCycle() {
  setLastScanAt(new Date());
  const assets = await loadActiveAssets();
  if (assets.length === 0) { logger.info('Nessun asset attivo, scan saltato'); return; }
  const rules = await loadActiveRules();
  const weights = await loadSmartWeights();
  const smartTfs = ['1h', '4h', '1d'];
  const timeframes = collectTimeframes(rules, smartTfs);
  let emitted = 0;

  for (const asset of assets) {
    const configs = await loadIndicatorConfigs(asset.id);
    const perTf = [];
    for (const tf of timeframes) {
      try {
        const candles = await getKlines(asset.symbol, tfToBinance(tf), CANDLE_LIMIT);
        await upsertCandles(asset.id, tf, candles).catch(e =>
          logger.warn(`upsert candles error ${asset.symbol} ${tf}: ${e.message}`));
        const indicators = computeAll(candles, configs);
        const extraEma = computeExtraEma(candles);
        perTf.push({ tf, candles, indicators, extraEma });
      } catch (err) {
        logger.error(`scan ${asset.symbol} ${tf}: ${err.message}`);
      }
    }
    // regole manuali
    for (const rule of rules) {
      try {
        const sig = await evaluateManualRule(rule, perTf, asset);
        if (sig) { emitted++; await sendAlert(sig, asset); }
      } catch (err) { logger.error(`rule ${rule.id} ${asset.symbol}: ${err.message}`); }
    }
    // smart mode
    try {
      const sig = await evaluateSmartMode(weights, perTf, asset);
      if (sig) { emitted++; await sendAlert(sig, asset); }
    } catch (err) { logger.error(`smart ${asset.symbol}: ${err.message}`); }
  }
  logger.info(`Scan completato: ${emitted} segnali emessi su ${assets.length} asset`);
  return emitted;
}

export default { runScanCycle };
