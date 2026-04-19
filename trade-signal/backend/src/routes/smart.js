// src/routes/smart.js - Smart Mode config + backtest
// GET  /api/smart/config
// PUT  /api/smart/config           { weights:[{indicator_name,weight,enabled}], threshold_buy?, threshold_sell?, tf_confluence_count? }
// POST /api/smart/backtest         { symbol, timeframe, months? }
// GET  /api/smart/backtests        (lista storico)
// POST /api/smart/apply-backtest/:runId
import { Router } from 'express';
import { query } from '../db/pool.js';
import { assertValidSymbol } from '../binance/symbols.js';
import { isValidTimeframe } from '../utils/timeframes.js';
import { runBacktest, persistBacktest, applyBestConfig } from '../engine/backtester.js';

const router = Router();

async function loadWeights() {
  const { rows } = await query(
    `SELECT indicator_name, weight, enabled, threshold_buy,
            threshold_sell, tf_confluence_count
     FROM indicator_weights ORDER BY indicator_name`
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

/**
 * GET /api/smart/config
 */
router.get('/config', async (_req, res) => {
  try { res.json(await loadWeights()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * PUT /api/smart/config
 * Body: { weights:[{indicator_name,weight,enabled}], threshold_buy?, threshold_sell?, tf_confluence_count? }
 */
router.put('/config', async (req, res) => {
  try {
    const b = req.body || {};
    const weights = Array.isArray(b.weights) ? b.weights : [];
    for (const w of weights) {
      if (!w.indicator_name) continue;
      const upd = [];
      const vals = [w.indicator_name];
      let i = 2;
      if (w.weight != null) { upd.push(`weight = $${i++}`); vals.push(Number(w.weight)); }
      if (typeof w.enabled === 'boolean') { upd.push(`enabled = $${i++}`); vals.push(w.enabled); }
      if (b.threshold_buy != null) { upd.push(`threshold_buy = $${i++}`); vals.push(Number(b.threshold_buy)); }
      if (b.threshold_sell != null) { upd.push(`threshold_sell = $${i++}`); vals.push(Number(b.threshold_sell)); }
      if (b.tf_confluence_count != null) {
        upd.push(`tf_confluence_count = $${i++}`); vals.push(Number(b.tf_confluence_count));
      }
      if (upd.length === 0) continue;
      upd.push(`updated_at = NOW()`);
      await query(
        `UPDATE indicator_weights SET ${upd.join(', ')} WHERE indicator_name = $1`,
        vals
      );
    }
    res.json(await loadWeights());
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/smart/backtest
 * Body: { symbol, timeframe, months? }
 * Risposta: backtest row (best_config suggerita).
 */
router.post('/backtest', async (req, res) => {
  try {
    const b = req.body || {};
    const symbol = assertValidSymbol(b.symbol || '');
    const timeframe = String(b.timeframe || '1h');
    if (!isValidTimeframe(timeframe)) {
      return res.status(400).json({ error: `Timeframe non supportato: ${timeframe}` });
    }
    const months = Math.min(Math.max(Number(b.months) || 3, 1), 12);
    const weights = await loadWeights();
    const w0 = weights[0] || { threshold_buy: 0.6, threshold_sell: 0.6 };
    const result = await runBacktest({
      symbol, timeframe, months,
      weights,
      thresholdBuy: w0.threshold_buy,
      thresholdSell: w0.threshold_sell
    });
    const row = await persistBacktest({ symbol, timeframe, months }, result);
    res.json(row);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/smart/backtests
 */
router.get('/backtests', async (_req, res) => {
  try {
    const { rows } = await query(
      `SELECT id, run_at, params, score, best_config, stats
       FROM smart_backtests ORDER BY run_at DESC LIMIT 50`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/smart/apply-backtest/:runId
 */
router.post('/apply-backtest/:runId', async (req, res) => {
  try {
    const runId = Number(req.params.runId);
    if (!Number.isFinite(runId)) return res.status(400).json({ error: 'runId invalido' });
    const best = await applyBestConfig(runId);
    res.json({ ok: true, applied: best });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
