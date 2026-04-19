// src/routes/signals.js - Storico segnali
// GET /api/signals?limit=50&assetId=&type=&source=
import { Router } from 'express';
import { query } from '../db/pool.js';

const router = Router();

/**
 * GET /api/signals
 * Query: limit, assetId, type (BUY|SELL), source (manual|smart)
 */
router.get('/', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 500);
    const clauses = [];
    const vals = [];
    let i = 1;
    if (req.query.assetId) {
      clauses.push(`s.asset_id = $${i++}`); vals.push(Number(req.query.assetId));
    }
    if (req.query.type) {
      clauses.push(`s.type = $${i++}`); vals.push(String(req.query.type).toUpperCase());
    }
    if (req.query.source) {
      clauses.push(`s.source = $${i++}`); vals.push(String(req.query.source));
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    vals.push(limit);
    const { rows } = await query(
      `SELECT s.*, a.symbol, a.display_name, r.name AS rule_name
       FROM signals s
       JOIN assets a ON a.id = s.asset_id
       LEFT JOIN rules r ON r.id = s.rule_id
       ${where}
       ORDER BY s.created_at DESC
       LIMIT $${i}`,
      vals
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/signals/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'id invalido' });
    const { rows } = await query(
      `SELECT s.*, a.symbol, a.display_name, r.name AS rule_name
       FROM signals s
       JOIN assets a ON a.id = s.asset_id
       LEFT JOIN rules r ON r.id = s.rule_id
       WHERE s.id = $1`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Segnale non trovato' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
