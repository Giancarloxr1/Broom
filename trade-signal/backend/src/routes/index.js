// src/routes/index.js - Registrazione route API
import { Router } from 'express';
import watchlist from './watchlist.js';
import indicators from './indicators.js';
import rules from './rules.js';
import signals from './signals.js';
import candles from './candles.js';
import settings from './settings.js';
import portfolio from './portfolio.js';
import trades from './trades.js';
import smart from './smart.js';
import scan from './scan.js';

const router = Router();

router.use('/watchlist', watchlist);
router.use('/indicators', indicators);
router.use('/rules', rules);
router.use('/signals', signals);
router.use('/candles', candles);
router.use('/settings', settings);
router.use('/portfolio', portfolio);
router.use('/trades', trades);
router.use('/smart', smart);
router.use('/scan', scan);

router.get('/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));

export default router;
