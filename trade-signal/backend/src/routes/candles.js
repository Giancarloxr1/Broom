// src/routes/candles.js - Proxy candele per frontend + indicatori opzionali
// GET /api/candles?symbol=BTCUSDT&interval=1h&limit=500&withIndicators=true
import { Router } from 'express';
import { getKlines } from '../binance/client.js';
import { assertValidSymbol } from '../binance/symbols.js';
import { isValidTimeframe, tfToBinance } from '../utils/timeframes.js';
import { computeAll, DEFAULT_PARAMS, REGISTRY } from '../indicators/index.js';

const router = Router();

/**
 * GET /api/candles
 * Query: symbol (obbligatorio), interval (1h/4h/1d/1w), limit (1..1000)
 * Risposta: { symbol, interval, candles: [...], indicators? }
 */
router.get('/', async (req, res) => {
  try {
    const symbol = assertValidSymbol(req.query.symbol || '');
    const interval = String(req.query.interval || '1h');
    if (!isValidTimeframe(interval)) {
      return res.status(400).json({ error: `Timeframe non supportato: ${interval}` });
    }
    const limit = Math.min(Math.max(Number(req.query.limit) || 500, 1), 1000);
    const candles = await getKlines(symbol, tfToBinance(interval), limit);
    const resp = { symbol, interval, count: candles.length, candles };
    if (req.query.withIndicators === 'true' || req.query.withIndicators === '1') {
      const names = (req.query.indicators
        ? String(req.query.indicators).split(',').filter(Boolean)
        : Object.keys(REGISTRY));
      const configs = names
        .filter(n => REGISTRY[n])
        .map(n => ({ name: n, params: DEFAULT_PARAMS[n] || {} }));
      resp.indicators = computeAll(candles, configs);
    }
    res.json(resp);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
