// src/indicators/ema.js - EMA e SMA classiche
// Output: array stessa lunghezza di candles (null per periodi insufficienti)

export function sma(values, period) {
  const out = new Array(values.length).fill(null);
  if (period <= 0) return out;
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= period) sum -= values[i - period];
    if (i >= period - 1) out[i] = sum / period;
  }
  return out;
}

export function ema(values, period) {
  const out = new Array(values.length).fill(null);
  if (period <= 0 || values.length < period) return out;
  const k = 2 / (period + 1);
  // Seed EMA with SMA del primo periodo
  let seed = 0;
  for (let i = 0; i < period; i++) seed += values[i];
  seed /= period;
  out[period - 1] = seed;
  let prev = seed;
  for (let i = period; i < values.length; i++) {
    const v = values[i] * k + prev * (1 - k);
    out[i] = v;
    prev = v;
  }
  return out;
}

/**
 * Calcolo standard per l'indicatore EMA.
 * params: { period?: number, type?: 'ema'|'sma' }
 * Restituisce { values, period, type } dove values ha la lunghezza di candles.
 */
export function calculate(candles, params = {}) {
  const period = Number(params.period) || 20;
  const type = params.type === 'sma' ? 'sma' : 'ema';
  const closes = candles.map(c => Number(c.close));
  const values = type === 'sma' ? sma(closes, period) : ema(closes, period);
  return { name: 'ema', type, period, values };
}

/**
 * Helper: calcola tre EMA comuni (20/50/200) in un colpo.
 */
export function calcMulti(candles, periods = [20, 50, 200]) {
  const closes = candles.map(c => Number(c.close));
  const out = {};
  for (const p of periods) out[`ema${p}`] = ema(closes, p);
  return out;
}

export default { calculate, ema, sma, calcMulti };
