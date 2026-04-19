// src/binance/symbols.js - Validazione simboli e lista default
const SYMBOL_REGEX = /^[A-Z0-9]{2,20}$/;

export const DEFAULT_SYMBOLS = [
  { symbol: 'BTCUSDT', display_name: 'Bitcoin' },
  { symbol: 'ETHUSDT', display_name: 'Ethereum' },
  { symbol: 'SOLUSDT', display_name: 'Solana' },
  { symbol: 'BNBUSDT', display_name: 'BNB' }
];

/**
 * Valida il formato del simbolo (non verifica esistenza su Binance,
 * la verifica di esistenza avviene al primo fetch klines).
 */
export function isValidSymbol(s) {
  if (typeof s !== 'string') return false;
  return SYMBOL_REGEX.test(s);
}

export function normalizeSymbol(s) {
  if (typeof s !== 'string') return '';
  return s.trim().toUpperCase();
}

export function assertValidSymbol(s) {
  const norm = normalizeSymbol(s);
  if (!isValidSymbol(norm)) {
    throw new Error(`Simbolo non valido: ${s}`);
  }
  return norm;
}

export default { isValidSymbol, normalizeSymbol, assertValidSymbol, DEFAULT_SYMBOLS };
