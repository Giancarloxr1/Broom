// src/routes/portfolio.js - Portafoglio singleton
// GET /api/portfolio
// PUT /api/portfolio  { initial_capital?, current_capital?, currency? }
// GET /api/portfolio/stats
import { Router } from 'express';
import { getPortfolio, updatePortfolio, listTrades } from '../portfolio/service.js';
import { aggregateStats } from '../portfolio/pnl.js';

const router = Router();

/**
 * GET /api/portfolio
 */
router.get('/', async (_req, res) => {
  try {
    const p = await getPortfolio();
    res.json(p || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/portfolio
 */
router.put('/', async (req, res) => {
  try {
    const { initial_capital, current_capital, currency } = req.body || {};
    const fields = { initial_capital, current_capital, currency };
    const p = await updatePortfolio(fields);
    res.json(p);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/portfolio/stats
 * Risposta: { portfolio, stats: { closedCount, openCount, pnlSum, wins, losses, hitRate } }
 */
router.get('/stats', async (_req, res) => {
  try {
    const [p, trades] = await Promise.all([
      getPortfolio(),
      listTrades({})
    ]);
    res.json({ portfolio: p, stats: aggregateStats(trades) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
