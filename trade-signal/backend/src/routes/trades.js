// src/routes/trades.js - CRUD trade + apertura/chiusura + P/L
// GET    /api/trades?status=&assetId=
// GET    /api/trades/:id
// POST   /api/trades               { asset_id, side, quantity, entry_price, entry_time?, signal_id?, note? }
// PUT    /api/trades/:id           { quantity?, entry_price?, note?, signal_id? }
// PUT    /api/trades/:id/close     { exit_price, exit_time? }
// DELETE /api/trades/:id
import { Router } from 'express';
import {
  listTrades,
  getTrade,
  openTrade,
  updateTrade,
  closeTrade,
  deleteTrade
} from '../portfolio/service.js';

const router = Router();

/**
 * GET /api/trades?status=OPEN|CLOSED&assetId=<n>
 */
router.get('/', async (req, res) => {
  try {
    const status = req.query.status ? String(req.query.status).toUpperCase() : undefined;
    if (status && !['OPEN', 'CLOSED'].includes(status)) {
      return res.status(400).json({ error: 'status invalido' });
    }
    const assetId = req.query.assetId ? Number(req.query.assetId) : undefined;
    const rows = await listTrades({ status, assetId });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/trades/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'id invalido' });
    const t = await getTrade(id);
    if (!t) return res.status(404).json({ error: 'Trade non trovato' });
    res.json(t);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/trades
 */
router.post('/', async (req, res) => {
  try {
    const b = req.body || {};
    if (!b.asset_id) return res.status(400).json({ error: 'asset_id obbligatorio' });
    if (!['LONG', 'SHORT'].includes(b.side)) {
      return res.status(400).json({ error: 'side deve essere LONG o SHORT' });
    }
    if (!Number.isFinite(Number(b.quantity)) || Number(b.quantity) <= 0) {
      return res.status(400).json({ error: 'quantity deve essere > 0' });
    }
    if (!Number.isFinite(Number(b.entry_price)) || Number(b.entry_price) <= 0) {
      return res.status(400).json({ error: 'entry_price invalido' });
    }
    const t = await openTrade({
      asset_id: Number(b.asset_id),
      side: b.side,
      quantity: b.quantity,
      entry_price: b.entry_price,
      entry_time: b.entry_time,
      signal_id: b.signal_id,
      note: b.note
    });
    res.status(201).json(t);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * PUT /api/trades/:id
 * Modifica solo trade OPEN (side, quantity, entry_price, note, signal_id).
 */
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'id invalido' });
    const t = await updateTrade(id, req.body || {});
    if (!t) return res.status(404).json({ error: 'Trade non trovato o gia\' chiuso' });
    res.json(t);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * PUT /api/trades/:id/close
 */
router.put('/:id/close', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'id invalido' });
    const { exit_price, exit_time } = req.body || {};
    if (!Number.isFinite(Number(exit_price)) || Number(exit_price) <= 0) {
      return res.status(400).json({ error: 'exit_price invalido' });
    }
    const t = await closeTrade(id, { exit_price, exit_time });
    res.json(t);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * DELETE /api/trades/:id  (solo se OPEN)
 */
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'id invalido' });
    await deleteTrade(id);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
