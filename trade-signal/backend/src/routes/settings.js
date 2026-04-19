// src/routes/settings.js - Impostazioni key/value
// GET /api/settings
// PUT /api/settings  { key: value, ... }
// POST /api/settings/telegram/test
import { Router } from 'express';
import { query } from '../db/pool.js';
import { sendTestMessage } from '../telegram/bot.js';

const router = Router();

const ALLOWED_KEYS = new Set([
  'telegram_enabled',
  'telegram_chat_id',
  'scan_interval_cron',
  'default_timeframes'
]);

/**
 * GET /api/settings
 * Risposta: { [key]: value }
 */
router.get('/', async (_req, res) => {
  try {
    const { rows } = await query(`SELECT key, value FROM settings`);
    const out = {};
    for (const r of rows) out[r.key] = r.value;
    res.json(out);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/settings
 * Body: oggetto con chiavi dentro ALLOWED_KEYS
 */
router.put('/', async (req, res) => {
  try {
    const body = req.body || {};
    const keys = Object.keys(body);
    if (keys.length === 0) return res.status(400).json({ error: 'Corpo vuoto' });
    for (const k of keys) {
      if (!ALLOWED_KEYS.has(k)) {
        return res.status(400).json({ error: `Chiave non permessa: ${k}` });
      }
      await query(
        `INSERT INTO settings (key, value) VALUES ($1, $2::jsonb)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
        [k, JSON.stringify(body[k])]
      );
    }
    const { rows } = await query(`SELECT key, value FROM settings`);
    const out = {};
    for (const r of rows) out[r.key] = r.value;
    res.json(out);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/settings/telegram/test
 * Invia messaggio di test al chat_id corrente.
 */
router.post('/telegram/test', async (req, res) => {
  try {
    const chatId = req.body?.chat_id;
    await sendTestMessage(chatId);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
