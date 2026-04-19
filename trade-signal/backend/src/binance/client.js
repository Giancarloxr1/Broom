// src/binance/client.js - Client REST Binance (dati pubblici)
import axios from 'axios';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';

const http = axios.create({
  baseURL: config.binance.baseUrl,
  timeout: 15000,
  headers: { 'User-Agent': 'TradeSignal/0.1' }
});

/**
 * Scarica candele (klines) da Binance.
 * @param {string} symbol es. "BTCUSDT"
 * @param {string} interval es. "1h"
 * @param {number} limit 1..1000
 * @param {object} [opts] { startTime, endTime } in ms
 * @returns {Promise<Array>} array di candele normalizzate
 */
export async function getKlines(symbol, interval, limit = 500, opts = {}) {
  const params = { symbol, interval, limit: Math.min(Math.max(limit, 1), 1000) };
  if (opts.startTime) params.startTime = opts.startTime;
  if (opts.endTime) params.endTime = opts.endTime;
  try {
    const { data } = await http.get('/api/v3/klines', { params });
    return data.map(mapKline);
  } catch (err) {
    const msg = err.response?.data?.msg || err.message;
    logger.error(`Binance klines error (${symbol} ${interval}):`, msg);
    throw new Error(`Binance API error: ${msg}`);
  }
}

function mapKline(raw) {
  // Binance kline array:
  // [ openTime, open, high, low, close, volume, closeTime, quoteAssetVolume, ... ]
  return {
    openTime: Number(raw[0]),
    open: Number(raw[1]),
    high: Number(raw[2]),
    low: Number(raw[3]),
    close: Number(raw[4]),
    volume: Number(raw[5]),
    closeTime: Number(raw[6])
  };
}

/**
 * Scarica N candele storiche in chunk (max 1000 per chiamata).
 * Utile per backtest su periodi estesi.
 */
export async function getKlinesChunked(symbol, interval, totalCount) {
  const all = [];
  let endTime = Date.now();
  while (all.length < totalCount) {
    const remaining = totalCount - all.length;
    const limit = Math.min(remaining, 1000);
    const batch = await getKlines(symbol, interval, limit, { endTime });
    if (!batch.length) break;
    all.unshift(...batch);
    endTime = batch[0].openTime - 1;
    if (batch.length < limit) break;
  }
  return all;
}

export async function pingBinance() {
  try {
    await http.get('/api/v3/ping');
    return true;
  } catch {
    return false;
  }
}

export default { getKlines, getKlinesChunked, pingBinance };
