// src/indicators/vwap.js - VWAP cumulativo

export function vwap(candles) {
  const n = candles.length;
  const out = new Array(n).fill(null);
  let cumPV = 0;
  let cumV = 0;
  for (let i = 0; i < n; i++) {
    const h = Number(candles[i].high);
    const l = Number(candles[i].low);
    const c = Number(candles[i].close);
    const v = Number(candles[i].volume) || 0;
    const typical = (h + l + c) / 3;
    cumPV += typical * v;
    cumV += v;
    out[i] = cumV > 0 ? cumPV / cumV : null;
  }
  return out;
}

export function vwapRolling(candles, period = 20) {
  const n = candles.length;
  const out = new Array(n).fill(null);
  if (period <= 0 || n === 0) return out;
  for (let i = 0; i < n; i++) {
    const start = Math.max(0, i - period + 1);
    let sumPV = 0;
    let sumV = 0;
    for (let j = start; j <= i; j++) {
      const h = Number(candles[j].high);
      const l = Number(candles[j].low);
      const c = Number(candles[j].close);
      const v = Number(candles[j].volume) || 0;
      sumPV += ((h + l + c) / 3) * v;
      sumV += v;
    }
    out[i] = sumV > 0 ? sumPV / sumV : null;
  }
  return out;
}

export function calculate(candles, params = {}) {
  const mode = params.mode === 'rolling' ? 'rolling' : 'cumulative';
  const period = Number(params.period) || 20;
  const values = mode === 'rolling'
    ? vwapRolling(candles, period)
    : vwap(candles);
  return { name: 'vwap', mode, period, values };
}

export default { calculate, vwap, vwapRolling };
