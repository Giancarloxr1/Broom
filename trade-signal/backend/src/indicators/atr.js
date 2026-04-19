// src/indicators/atr.js - ATR (Wilder)

export function trueRange(candles) {
  const n = candles.length;
  const tr = new Array(n).fill(null);
  for (let i = 0; i < n; i++) {
    const h = Number(candles[i].high);
    const l = Number(candles[i].low);
    if (i === 0) {
      tr[i] = h - l;
      continue;
    }
    const prevClose = Number(candles[i - 1].close);
    tr[i] = Math.max(
      h - l,
      Math.abs(h - prevClose),
      Math.abs(l - prevClose)
    );
  }
  return tr;
}

export function atrWilder(candles, period = 14) {
  const n = candles.length;
  const out = new Array(n).fill(null);
  const tr = trueRange(candles);
  if (n < period) return out;
  let sum = 0;
  for (let i = 0; i < period; i++) sum += tr[i];
  let prev = sum / period;
  out[period - 1] = prev;
  for (let i = period; i < n; i++) {
    prev = (prev * (period - 1) + tr[i]) / period;
    out[i] = prev;
  }
  return out;
}

export function calculate(candles, params = {}) {
  const period = Number(params.period) || 14;
  const values = atrWilder(candles, period);
  return { name: 'atr', period, values };
}

export default { calculate, atrWilder, trueRange };
