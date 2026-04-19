// src/routes/scan.js - Trigger manuale ciclo scan
// POST /api/scan/run
import { Router } from 'express';
import { triggerScan, isRunning } from '../scheduler/cron.js';

const router = Router();

/**
 * POST /api/scan/run
 * Risposta: { ok, emitted, running }
 */
router.post('/run', async (_req, res) => {
  try {
    if (isRunning()) {
      return res.status(409).json({ error: 'Scan gia\' in corso', running: true });
    }
    const emitted = await triggerScan();
    res.json({ ok: true, emitted, running: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/scan/status
 */
router.get('/status', (_req, res) => {
  res.json({ running: isRunning() });
});

export default router;
