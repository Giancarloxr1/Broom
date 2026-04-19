// src/db/migrate.js - Esegue schema.sql e inserisce seed di base
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPool, closePool, query } from './pool.js';
import { logger } from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DEFAULT_INDICATORS = [
  'ema', 'rsi', 'macd', 'bollinger',
  'adx', 'atr', 'vwap', 'stochRsi', 'volume'
];

async function runSchema() {
  const sqlPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  await getPool().query(sql);
  logger.info('Schema SQL eseguito.');
}

async function seedPortfolio() {
  await query(
    `INSERT INTO portfolio (id, initial_capital, current_capital, currency)
     VALUES (1, 0, 0, 'EUR')
     ON CONFLICT (id) DO NOTHING`
  );
}

async function seedSettings() {
  const rows = [
    ['telegram_enabled', 'false'],
    ['telegram_chat_id', '""'],
    ['scan_interval_cron', '"*/5 * * * *"'],
    ['default_timeframes', '["1h","4h","1d"]']
  ];
  for (const [k, v] of rows) {
    await query(
      `INSERT INTO settings (key, value) VALUES ($1, $2::jsonb)
       ON CONFLICT (key) DO NOTHING`,
      [k, v]
    );
  }
}

async function seedIndicatorWeights() {
  for (const name of DEFAULT_INDICATORS) {
    await query(
      `INSERT INTO indicator_weights
         (indicator_name, weight, enabled, threshold_buy, threshold_sell, tf_confluence_count)
       VALUES ($1, 1.0, TRUE, 0.6, 0.6, 2)
       ON CONFLICT (indicator_name) DO NOTHING`,
      [name]
    );
  }
}

async function seedDefaultAssets() {
  const defaults = [
    { symbol: 'BTCUSDT', name: 'Bitcoin' },
    { symbol: 'ETHUSDT', name: 'Ethereum' },
    { symbol: 'SOLUSDT', name: 'Solana' },
    { symbol: 'BNBUSDT', name: 'BNB' }
  ];
  for (const a of defaults) {
    await query(
      `INSERT INTO assets (symbol, display_name, active)
       VALUES ($1, $2, TRUE)
       ON CONFLICT (symbol) DO NOTHING`,
      [a.symbol, a.name]
    );
  }
}

export async function runMigration() {
  await runSchema();
  await seedPortfolio();
  await seedSettings();
  await seedIndicatorWeights();
  await seedDefaultAssets();
  logger.info('Migrazione completata.');
}

async function main() {
  try {
    await runMigration();
    process.exit(0);
  } catch (err) {
    logger.error('Migrazione fallita:', err.message);
    console.error(err);
    process.exit(1);
  } finally {
    await closePool().catch(() => {});
  }
}

// Esecuzione CLI diretta
const isMain = process.argv[1] && process.argv[1].endsWith('migrate.js');
if (isMain) {
  main();
}

export default runMigration;
