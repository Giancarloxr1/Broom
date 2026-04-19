// src/routes/indicators.js - Config indicatori per asset
// GET    /api/indicators                → config globali
// GET    /api/indicators/:assetId       → config per asset
// PUT    /api/indicators/:assetId       { configs: [{name, params, enabled}] }
// GET    /api/indicators/registry       → indicatori disponibili + default
import { Router } from 'express';
import { query } from '../db/pool.js';
import { REGISTRY, DEFAULT_PARAMS } from '../indicators/index.js';

const router = Router();

/**
 * GET /api/indicators/registry
 * Risposta: { indicators: ['ema','rsi',...], defaults: {ema:{period:20}, ...} }
 */
router.get('/registry', (_req, res) => {
  res.json({
    indicators: Object.keys(REGISTRY),
    defaults: DEFAULT_PARAMS
  });
});

/**
 * GET /api/indicators
 * Risposta: config globali (asset_id IS NULL).
 */
router.get('/', async (_req, res) => {
  try {
    const { rows } = await query(
      `SELECT id, asset_id, indicator_name, params, enabled
       FROM indicator_configs WHERE asset_id IS NULL
       ORDER BY indicator_name`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/indicators/:assetId
 */
router.get('/:assetId', async (req, res) => {
  try {
    const assetId = Number(req.params.assetId);
    if (!Number.isFinite(assetId)) return res.status(400).json({ error: 'assetId invalido' });
    const { rows } = await query(
      `SELECT id, asset_id, indicator_name, params, enabled
       FROM indicator_configs WHERE asset_id = $1
       ORDER BY indicator_name`,
      [assetId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/indicators/:assetId
 * Body: { configs: [{name, params, enabled}] }
 */
router.put('/:assetId', async (req, res) => {
  try {
    const assetId = Number(req.params.assetId);
    if (!Number.isFinite(assetId)) return res.status(400).json({ error: 'assetId invalido' });
    const configs = Array.isArray(req.body?.configs) ? req.body.configs : null;
    if (!configs) return res.status(400).json({ error: 'configs array obbligatorio' });
    for (const c of configs) {
      if (!c.name || !REGISTRY[c.name]) {
        return res.status(400).json({ error: `Indicatore sconosciuto: ${c.name}` });
      }
      await query(
        `INSERT INTO indicator_configs (asset_id, indicator_name, params, enabled)
         VALUES ($1, $2, $3::jsonb, $4)
         ON CONFLICT (asset_id, indicator_name) DO UPDATE SET
           params = EXCLUDED.params, enabled = EXCLUDED.enabled`,
        [assetId, c.name, JSON.stringify(c.params || {}), c.enabled !== false]
      );
    }
    const { rows } = await query(
      `SELECT * FROM indicator_configs WHERE asset_id = $1`, [assetId]
    );
    res.json(rows);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
