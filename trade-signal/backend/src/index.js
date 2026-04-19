// src/index.js - Entry HTTP server Trade Signal
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config, validateConfig } from './config.js';
import routes from './routes/index.js';
import { logger } from './utils/logger.js';
import { getPool, closePool, query } from './db/pool.js';
import runMigration from './db/migrate.js';
import { startScheduler, stopScheduler } from './scheduler/cron.js';
import { startBot } from './telegram/bot.js';

async function ensureSchema() {
  try {
    const { rows } = await query(
      `SELECT to_regclass('public.assets') AS t`
    );
    if (!rows[0]?.t) {
      logger.warn('Tabelle mancanti, eseguo migrate automatico...');
      await runMigration();
    }
  } catch (err) {
    logger.warn(`Controllo schema non riuscito: ${err.message}. Provo migrate...`);
    try { await runMigration(); } catch (e) {
      logger.error('Migrate fallito:', e.message);
      throw e;
    }
  }
}

function createApp() {
  const app = express();
  app.use(cors({ origin: config.corsOrigin, credentials: false }));
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));
  app.use('/api', routes);
  app.get('/', (_req, res) => res.json({ name: 'Trade Signal API', status: 'ok' }));
  // Error handler
  app.use((err, _req, res, _next) => {
    logger.error('Unhandled:', err.message);
    res.status(500).json({ error: err.message || 'Errore interno' });
  });
  return app;
}

async function main() {
  for (const w of validateConfig()) logger.warn(w);
  // init DB pool
  getPool();
  await ensureSchema();
  // start Telegram (se token presente)
  await startBot().catch(e => logger.error('Telegram start error:', e.message));
  // start scheduler
  startScheduler();
  // start HTTP
  const app = createApp();
  const server = app.listen(config.port, () => {
    logger.info(`Trade Signal backend in ascolto su :${config.port} (env=${config.env})`);
  });
  const shutdown = async (sig) => {
    logger.info(`Ricevuto ${sig}, shutdown...`);
    stopScheduler();
    server.close(() => logger.info('HTTP chiuso'));
    await closePool().catch(() => {});
    process.exit(0);
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch(err => {
  logger.error('Avvio fallito:', err.message);
  console.error(err);
  process.exit(1);
});
