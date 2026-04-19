// src/config.js - Carica e valida env vars, espone oggetto config
import dotenv from 'dotenv';

dotenv.config();

function req(name, fallback) {
  const v = process.env[name];
  if (v === undefined || v === '') {
    if (fallback !== undefined) return fallback;
    throw new Error(`Variabile d'ambiente mancante: ${name}`);
  }
  return v;
}

function int(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const n = parseInt(raw, 10);
  if (Number.isNaN(n)) throw new Error(`Env ${name} non e' un intero valido`);
  return n;
}

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: int('PORT', 4100),
  databaseUrl: req('DATABASE_URL', 'postgres://localhost:5432/trade_signal'),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    defaultChatId: process.env.TELEGRAM_CHAT_ID || '',
    enabled: !!process.env.TELEGRAM_BOT_TOKEN
  },
  scanCron: process.env.SCAN_INTERVAL_CRON || '*/5 * * * *',
  binance: {
    baseUrl: process.env.BINANCE_BASE_URL || 'https://api.binance.com'
  }
};

export function validateConfig() {
  const warnings = [];
  if (!config.telegram.botToken) {
    warnings.push('TELEGRAM_BOT_TOKEN non impostato: notifiche disattivate');
  }
  if (!config.databaseUrl.startsWith('postgres')) {
    warnings.push('DATABASE_URL non sembra una connection string PostgreSQL');
  }
  return warnings;
}

export default config;
