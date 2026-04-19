// src/utils/timeframes.js - Mapping timeframe supportati
export const TIMEFRAMES = {
  '1h': { binance: '1h', ms: 60 * 60 * 1000, label: '1 ora' },
  '4h': { binance: '4h', ms: 4 * 60 * 60 * 1000, label: '4 ore' },
  '1d': { binance: '1d', ms: 24 * 60 * 60 * 1000, label: '1 giorno' },
  '1w': { binance: '1w', ms: 7 * 24 * 60 * 60 * 1000, label: '1 settimana' }
};

export const TF_LIST = Object.keys(TIMEFRAMES);

export function isValidTimeframe(tf) {
  return Object.prototype.hasOwnProperty.call(TIMEFRAMES, tf);
}

export function tfToBinance(tf) {
  const entry = TIMEFRAMES[tf];
  if (!entry) throw new Error(`Timeframe non supportato: ${tf}`);
  return entry.binance;
}

export function tfMs(tf) {
  const entry = TIMEFRAMES[tf];
  if (!entry) throw new Error(`Timeframe non supportato: ${tf}`);
  return entry.ms;
}

export default TIMEFRAMES;
