// src/indicators/adx.js - ADX + +DI/-DI con smoothing Wilder
import { trueRange } from './atr.js';

function wilderSmooth(values, period) {
  const n = values.length;
  const out = new Array(n).fill(null);
  if (n < period) return out;
  let sum = 0;
  for (let i = 0; i < period; i++) sum += Number(values[i]) || 0;
  out[period - 1] = sum;
  for (let i = period; i < n; i++) {
    // Wilder: smoothed[i] = smoothed[i-1] - (smoothed[i-1]/period) + values[i]
    out[i] = out[i - 1] - out[i - 1] / period + (Number(values[i]) || 0);
  }
  return out;
}

export function adx(candles, period = 14) {
  const n = candles.length;
  const plusDI = new Array(n).fill(null);
  const minusDI = new Array(n).fill(null);
  const adxArr = new Array(n).fill(null);
  if (n < period * 2) return { adx: adxArr, plusDI, minusDI };

  const tr = trueRange(candles);
  const plusDM = new Array(n).fill(0);
  const minusDM = new Array(n).fill(0);

  for (let i = 1; i < n; i++) {
    const upMove = Number(candles[i].high) - Number(candles[i - 1].high);
    const downMove = Number(candles[i - 1].low) - Number(candles[i].low);
    plusDM[i] = upMove > downMove && upMove > 0 ? upMove : 0;
    minusDM[i] = downMove > upMove && downMove > 0 ? downMove : 0;
  }

  const smTR = wilderSmooth(tr, period);
  const smPlus = wilderSmooth(plusDM, period);
  const smMinus = wilderSmooth(minusDM, period);

  const dx = new Array(n).fill(null);
  for (let i = 0; i < n; i++) {
    if (smTR[i] == null || smTR[i] === 0) continue;
    plusDI[i] = 100 * (smPlus[i] / smTR[i]);
    minusDI[i] = 100 * (smMinus[i] / smTR[i]);
    const sum = plusDI[i] + minusDI[i];
    if (sum === 0) { dx[i] = 0; continue; }
    dx[i] = 100 * Math.abs(plusDI[i] - minusDI[i]) / sum;
  }

  // ADX = Wilder smoothing del DX con stesso periodo
  const firstDx = dx.findIndex(v => v != null);
  if (firstDx < 0) return { adx: adxArr, plusDI, minusDI };
  // Prima ADX = media DX su 'period' valori
  const startAdx = firstDx + period - 1;
  if (startAdx < n) {
    let sumDx = 0;
    let count = 0;
    for (let i = firstDx; i <= startAdx; i++) {
      if (dx[i] != null) { sumDx += dx[i]; count++; }
    }
    if (count > 0) {
      adxArr[startAdx] = sumDx / count;
      for (let i = startAdx + 1; i < n; i++) {
        if (dx[i] == null) continue;
        adxArr[i] = (adxArr[i - 1] * (period - 1) + dx[i]) / period;
      }
    }
  }
  return { adx: adxArr, plusDI, minusDI };
}

export function calculate(candles, params = {}) {
  const period = Number(params.period) || 14;
  const { adx: adxArr, plusDI, minusDI } = adx(candles, period);
  return {
    name: 'adx',
    period,
    values: adxArr,
    plusDI,
    minusDI
  };
}

export default { calculate, adx };
