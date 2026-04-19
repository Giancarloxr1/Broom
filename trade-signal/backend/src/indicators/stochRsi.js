// src/indicators/stochRsi.js - Stochastic RSI (K, D)
import { rsiWilder } from './rsi.js';
import { sma } from './ema.js';

export function stochRsi(closes, rsiPeriod = 14, stochPeriod = 14, kSmooth = 3, dSmooth = 3) {
  const n = closes.length;
  const rsi = rsiWilder(closes, rsiPeriod);
  const stoch = new Array(n).fill(null);
  for (let i = 0; i < n; i++) {
    if (rsi[i] == null) continue;
    const start = i - stochPeriod + 1;
    if (start < 0) continue;
    let minV = Infinity;
    let maxV = -Infinity;
    let ok = true;
    for (let j = start; j <= i; j++) {
      const v = rsi[j];
      if (v == null) { ok = false; break; }
      if (v < minV) minV = v;
      if (v > maxV) maxV = v;
    }
    if (!ok) continue;
    const range = maxV - minV;
    stoch[i] = range === 0 ? 0 : ((rsi[i] - minV) / range) * 100;
  }
  // K = SMA(stoch, kSmooth), D = SMA(K, dSmooth)
  const kArr = smaNullable(stoch, kSmooth);
  const dArr = smaNullable(kArr, dSmooth);
  return { k: kArr, d: dArr };
}

function smaNullable(values, period) {
  const n = values.length;
  const out = new Array(n).fill(null);
  for (let i = 0; i < n; i++) {
    const start = i - period + 1;
    if (start < 0) continue;
    let sum = 0;
    let ok = true;
    for (let j = start; j <= i; j++) {
      if (values[j] == null) { ok = false; break; }
      sum += values[j];
    }
    if (ok) out[i] = sum / period;
  }
  return out;
}

export function calculate(candles, params = {}) {
  const rsiPeriod = Number(params.rsiPeriod) || 14;
  const stochPeriod = Number(params.stochPeriod) || 14;
  const kSmooth = Number(params.kSmooth) || 3;
  const dSmooth = Number(params.dSmooth) || 3;
  const closes = candles.map(c => Number(c.close));
  const { k, d } = stochRsi(closes, rsiPeriod, stochPeriod, kSmooth, dSmooth);
  return {
    name: 'stochRsi',
    params: { rsiPeriod, stochPeriod, kSmooth, dSmooth },
    k,
    d,
    values: k
  };
}

export default { calculate, stochRsi };
