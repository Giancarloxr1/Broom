// src/engine/backtester.js - Backtest Smart Mode su dati storici Binance.
// Dato symbol+TF+mesi, scarica candele, calcola score Smart per ogni candela
// e verifica se il segnale e' stato seguito da movimento coerente nelle N candele successive.
import { getKlinesChunked } from '../binance/client.js';
import { computeAll } from '../indicators/index.js';
import { scoreAt, decide } from './smartScorer.js';
import { tfMs } from '../utils/timeframes.js';
import { query } from '../db/pool.js';
import { logger } from '../utils/logger.js';

const DEFAULT_LOOKAHEAD = 5;
const DEFAULT_MONTHS = 3;

function approxCandlesForMonths(tf, months) {
  const ms = tfMs(tf);
  const total = months * 30 * 24 * 60 * 60 * 1000;
  return Math.min(Math.ceil(total / ms), 5000);
}

function buildConfigs(weights) {
  // Usa tutti gli indicatori attivi con i default params
  return weights
    .filter(w => w.enabled)
    .map(w => ({ name: w.indicator_name, params: {} }));
}

function movementHit(candles, idx, lookahead, signal) {
  const end = Math.min(candles.length - 1, idx + lookahead);
  if (end <= idx) return null;
  const entry = Number(candles[idx].close);
  let best = 0;
  for (let j = idx + 1; j <= end; j++) {
    const pct = (Number(candles[j].close) - entry) / entry;
    if (signal === 'BUY' && pct > best) best = pct;
    if (signal === 'SELL' && -pct > best) best = -pct;
  }
  // Hit se movimento favorevole > 0.5%
  return best >= 0.005;
}

export async function runBacktest({
  symbol,
  timeframe,
  months = DEFAULT_MONTHS,
  weights,
  thresholdBuy = 0.6,
  thresholdSell = 0.6,
  lookahead = DEFAULT_LOOKAHEAD
}) {
  if (!weights || weights.length === 0) {
    throw new Error('Pesi Smart Mode mancanti per il backtest');
  }
  const count = approxCandlesForMonths(timeframe, months);
  logger.info(`Backtest ${symbol} ${timeframe}: scarico ${count} candele (~${months} mesi)`);
  const candles = await getKlinesChunked(symbol, timeframe, count);
  if (candles.length < 100) {
    throw new Error(`Candele insufficienti per backtest: ${candles.length}`);
  }
  const configs = buildConfigs(weights);
  const indicators = computeAll(candles, configs);

  const stats = {
    totalCandles: candles.length,
    signals: 0,
    buys: 0,
    sells: 0,
    hits: 0,
    misses: 0,
    perIndicator: {}
  };
  // Per ogni indicatore attivo conta quante volte il suo voto concorde con il risultato.
  for (const w of weights) {
    if (!w.enabled) continue;
    stats.perIndicator[w.indicator_name] = { align: 0, disalign: 0, neutral: 0 };
  }

  const minIdx = 50; // buffer indicatori
  const endIdx = candles.length - lookahead - 1;
  for (let i = minIdx; i <= endIdx; i++) {
    const { score, votes } = scoreAt(indicators, weights, candles, i);
    const sig = decide(score, thresholdBuy, thresholdSell);
    if (!sig) continue;
    stats.signals++;
    if (sig === 'BUY') stats.buys++;
    else stats.sells++;
    const hit = movementHit(candles, i, lookahead, sig);
    if (hit) stats.hits++;
    else stats.misses++;
    // Tracking per-indicatore
    const expected = sig === 'BUY' ? 1 : -1;
    for (const [name, v] of Object.entries(votes)) {
      const slot = stats.perIndicator[name];
      if (!slot) continue;
      if (v === 0) slot.neutral++;
      else if ((v > 0) === (expected > 0)) slot.align++;
      else slot.disalign++;
    }
  }

  stats.hitRate = stats.signals > 0 ? stats.hits / stats.signals : 0;

  // Suggerimento pesi: proporzionale al rapporto align / (align+disalign)
  const suggested = weights.map(w => {
    const slot = stats.perIndicator[w.indicator_name];
    if (!slot) return { ...w };
    const tot = slot.align + slot.disalign;
    const accuracy = tot > 0 ? slot.align / tot : 0.5;
    // Mappa accuracy [0..1] → peso [0.2..2.0] (centrato a 1.0 con accuracy 0.5)
    const newWeight = Math.max(0.2, Math.min(2.0, accuracy * 2));
    return {
      indicator_name: w.indicator_name,
      weight: Number(newWeight.toFixed(3)),
      enabled: accuracy >= 0.35,
      threshold_buy: Number(thresholdBuy),
      threshold_sell: Number(thresholdSell),
      tf_confluence_count: w.tf_confluence_count
    };
  });

  return {
    stats,
    score: stats.hitRate,
    bestConfig: { weights: suggested, thresholdBuy, thresholdSell, lookahead }
  };
}

export async function persistBacktest(params, result) {
  const { rows } = await query(
    `INSERT INTO smart_backtests (params, score, best_config, stats)
     VALUES ($1::jsonb, $2, $3::jsonb, $4::jsonb)
     RETURNING *`,
    [
      JSON.stringify(params),
      result.score,
      JSON.stringify(result.bestConfig),
      JSON.stringify(result.stats)
    ]
  );
  return rows[0];
}

export async function applyBestConfig(runId) {
  const { rows } = await query(
    `SELECT best_config FROM smart_backtests WHERE id = $1`,
    [runId]
  );
  if (rows.length === 0) throw new Error('Backtest non trovato');
  const best = rows[0].best_config;
  if (!best || !Array.isArray(best.weights)) {
    throw new Error('Config consigliata non disponibile');
  }
  for (const w of best.weights) {
    await query(
      `UPDATE indicator_weights SET
         weight = $2,
         enabled = $3,
         threshold_buy = $4,
         threshold_sell = $5,
         updated_at = NOW()
       WHERE indicator_name = $1`,
      [
        w.indicator_name,
        w.weight,
        w.enabled,
        w.threshold_buy,
        w.threshold_sell
      ]
    );
  }
  return best;
}

export default { runBacktest, persistBacktest, applyBestConfig };
