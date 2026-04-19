// src/indicators/bollinger.js - Bollinger Bands
import { sma } from './ema.js';

export function bollinger(closes, period = 20, mult = 2) {
  const n = closes.length;
  const middle = sma(closes, period);
  const upper = new Array(n).fill(null);
  const lower = new Array(n).fill(null);
  for (let i = period - 1; i < n; i++) {
    const mean = middle[i];
    if (mean == null) continue;
    let sumSq = 0;
    for (let j = i - period + 1; j <= i; j++) {
      const d = closes[j] - mean;
      sumSq += d * d;
    }
    const std = Math.sqrt(sumSq / period);
    upper[i] = mean + mult * std;
    lower[i] = mean - mult * std;
  }
  return { upper, middle, lower };
}

export function calculate(candles, params = {}) {
  const period = Number(params.period) || 20;
  const mult = Number(params.mult) || 2;
  const closes = candles.map(c => Number(c.close));
  const { upper, middle, lower } = bollinger(closes, period, mult);
  return {
    name: 'bollinger',
    params: { period, mult },
    upper,
    middle,
    lower,
    values: middle
  };
}

export default { calculate, bollinger };
