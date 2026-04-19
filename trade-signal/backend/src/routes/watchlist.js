// src/routes/watchlist.js - CRUD asset monitorati
// GET    /api/watchlist            → lista asset
// POST   /api/watchlist            { symbol, display_name? }
// DELETE /api/watchlist/:id        → rimuove asset
// PATCH  /api/watchlist/:id        { active?, display_name? }
import { Router } from 'express';
import { query } from '../db/pool.js';
import { assertValidSymbol } from '../binance/symbols.js';

const router = Router();

/**
 * GET /api/watchlist
 * Risposta: [{ id, symbol, display_name, active, created_at }]
 */
router.get('/', async (_req, res) => {
  try {
    const { rows } = await query(
      `SELECT id, symbol, display_name, active, created_at
       FROM assets ORDER BY id`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/watchlist
 * Body: { symbol: "BTCUSDT", display_name?: "Bitcoin" }
 * Risposta: asset creato
 */
router.post('/', async (req, res) => {
  try {
    const raw = req.body?.symbol;
    if (!raw) return res.status(400).json({ error: 'symbol obbligatorio' });
    const symbol = assertValidSymbol(raw);
    const display = req.body?.display_name || symbol;
    const { rows } = await query(
      `INSERT INTO assets (symbol, display_name, active)
       VALUES ($1, $2, TRUE)
       ON CONFLICT (symbol) DO UPDATE SET active = TRUE
       RETURNING *`,
      [symbol, display]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * PATCH /api/watchlist/:id
 * Body: { active?, display_name? }
 */
router.patch('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'id invalido' });
    const fields = [];
    const vals = [];
    let i = 1;
    if (typeof req.body?.active === 'boolean') {
      fields.push(`active = $${i++}`); vals.push(req.body.active);
    }
    if (typeof req.body?.display_name === 'string') {
      fields.push(`display_name = $${i++}`); vals.push(req.body.display_name);
    }
    if (fields.length === 0) return res.status(400).json({ error: 'Nessun campo da aggiornare' });
    vals.push(id);
    const { rows } = await query(
      `UPDATE assets SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`, vals
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Asset non trovato' });
    res.json(rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * DELETE /api/watchlist/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'id invalido' });
    await query(`DELETE FROM assets WHERE id = $1`, [id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
