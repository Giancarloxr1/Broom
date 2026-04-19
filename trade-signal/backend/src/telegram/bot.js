// src/telegram/bot.js - Bot Telegram in polling mode
import TelegramBot from 'node-telegram-bot-api';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';
import { query } from '../db/pool.js';
import { formatAlert, formatStatus } from './formatter.js';
import { markTelegramSent } from '../engine/signalBuilder.js';

let bot = null;
let lastScanAt = null;

async function getChatId() {
  const { rows } = await query(
    `SELECT value FROM settings WHERE key = 'telegram_chat_id'`
  );
  const raw = rows[0]?.value;
  const val = typeof raw === 'string' ? raw : (raw ?? '');
  return String(val) || config.telegram.defaultChatId || '';
}

async function isNotifEnabled() {
  const { rows } = await query(
    `SELECT value FROM settings WHERE key = 'telegram_enabled'`
  );
  return rows[0]?.value === true || rows[0]?.value === 'true';
}

async function countSignalsToday() {
  const { rows } = await query(
    `SELECT COUNT(*)::int AS n FROM signals WHERE created_at >= DATE_TRUNC('day', NOW())`
  );
  return rows[0]?.n || 0;
}

export function setLastScanAt(d = new Date()) {
  lastScanAt = d;
}

export async function startBot() {
  if (!config.telegram.botToken) {
    logger.warn('TELEGRAM_BOT_TOKEN non impostato: bot Telegram non avviato');
    return null;
  }
  if (bot) return bot;
  bot = new TelegramBot(config.telegram.botToken, { polling: true });

  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(
      chatId,
      `Ciao! Questo e' il bot Trade Signal.\nIl tuo chat_id e': ${chatId}\n` +
      `Incollalo nelle Settings della PWA per abilitare le notifiche.`
    );
  });

  bot.onText(/\/status/, async (msg) => {
    try {
      const today = await countSignalsToday();
      bot.sendMessage(msg.chat.id, formatStatus({ lastScanAt, todaySignals: today }));
    } catch (err) {
      bot.sendMessage(msg.chat.id, `Errore: ${err.message}`);
    }
  });

  bot.onText(/\/test/, async (msg) => {
    bot.sendMessage(msg.chat.id, 'Messaggio di test — il bot funziona correttamente.');
  });

  bot.on('polling_error', (err) => {
    logger.error('Telegram polling error:', err.message || err);
  });

  logger.info('Telegram bot avviato (polling)');
  return bot;
}

export async function sendAlert(signal, asset) {
  if (!bot) return false;
  try {
    if (!(await isNotifEnabled())) return false;
    const chatId = await getChatId();
    if (!chatId) return false;
    const text = formatAlert(signal, asset);
    await bot.sendMessage(chatId, text);
    await markTelegramSent(signal.id);
    return true;
  } catch (err) {
    logger.error('Telegram sendAlert error:', err.message);
    return false;
  }
}

export async function sendTestMessage(chatId) {
  if (!bot) throw new Error('Bot Telegram non inizializzato');
  const target = chatId || (await getChatId());
  if (!target) throw new Error('Nessun chat_id configurato');
  await bot.sendMessage(target, 'Messaggio di test da Trade Signal.');
  return true;
}

export function getBot() { return bot; }

export default { startBot, sendAlert, sendTestMessage, setLastScanAt, getBot };
