// src/routes/rules.js - CRUD regole manuali segnali
// GET    /api/rules
// POST   /api/rules              { name, type, dsl, timeframes, confluence_mode?, cooldown_minutes?, enabled? }
// PUT    /api/rules/:id
// DELETE /api/rules/:id
import { Router } from 'express';
import { query } from '../db/pool.js';

const router = Router();

const VALID_TYPES = ['BUY', 'SELL'];
const VALID_MODES = ['all_tf', 'any_tf', 'n_of_m'];

function validateRuleBody(body, partial = false) {
  const errs = [];
  if (!partial && !body.name) errs.push('name obbligatorio');
  if (!partial && !VALID_TYPES.includes(body.type)) errs.push('type deve essere BUY o SELL');
  if (!partial && (!body.dsl || typeof body.dsl !== 'object')) errs.push('dsl obbligatorio');
  if (body.timeframes && !Array.isArray(body.timeframes)) errs.push('timeframes deve essere array');
  if (body.confluence_mode && !VALID_MODES.includes(body.confluence_mode)) {
    errs.push('confluence_mode non valido');
  }
  return errs;
}

/**
 * GET /api/rules
 */
router.get('/', async (_req, res) => {
  try {
    const { rows } = await query(`SELECT * FROM rules ORDER BY id DESC`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/rules
 */
router.post('/', async (req, res) => {
  try {
    const errs = validateRuleBody(req.body || {});
    if (errs.length) return res.status(400).json({ error: errs.join('; ') });
    const {
      name, type, dsl,
      timeframes = ['1h'],
      confluence_mode = 'all_tf',
      cooldown_minutes = 60,
      enabled = true
    } = req.body;
    const { rows } = await query(
      `INSERT INTO rules (name, type, dsl, timeframes, confluence_mode, cooldown_minutes, enabled)
       VALUES ($1, $2, $3::jsonb, $4, $5, $6, $7) RETURNING *`,
      [name, type, JSON.stringify(dsl), timeframes, confluence_mode, cooldown_minutes, enabled]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * PUT /api/rules/:id
 */
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'id invalido' });
    const errs = validateRuleBody(req.body || {}, true);
    if (errs.length) return res.status(400).json({ error: errs.join('; ') });
    const fields = [];
    const vals = [];
    let i = 1;
    const b = req.body;
    if (b.name != null)      { fields.push(`name = $${i++}`); vals.push(b.name); }
    if (b.type != null)      { fields.push(`type = $${i++}`); vals.push(b.type); }
    if (b.dsl != null)       { fields.push(`dsl = $${i++}::jsonb`); vals.push(JSON.stringify(b.dsl)); }
    if (b.timeframes)        { fields.push(`timeframes = $${i++}`); vals.push(b.timeframes); }
    if (b.confluence_mode)   { fields.push(`confluence_mode = $${i++}`); vals.push(b.confluence_mode); }
    if (b.cooldown_minutes != null) { fields.push(`cooldown_minutes = $${i++}`); vals.push(b.cooldown_minutes); }
    if (typeof b.enabled === 'boolean') { fields.push(`enabled = $${i++}`); vals.push(b.enabled); }
    fields.push(`updated_at = NOW()`);
    vals.push(id);
    if (fields.length === 1) return res.status(400).json({ error: 'Nessun campo' });
    const { rows } = await query(
      `UPDATE rules SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`, vals
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Regola non trovata' });
    res.json(rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * DELETE /api/rules/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'id invalido' });
    await query(`DELETE FROM rules WHERE id = $1`, [id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
