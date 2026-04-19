// src/indicators/volume.js - Volume e media volume (SMA)
import { sma } from './ema.js';

export function volumeSma(candles, period = 20) {
  const vols = candles.map(c => Number(c.volume) || 0);
  return sma(vols, period);
}

export function calculate(candles, params = {}) {
  const period = Number(params.period) || 20;
  const vols = candles.map(c => Number(c.volume) || 0);
  const avg = sma(vols, period);
  // ratio vol/avg: indicativo
  const ratio = vols.map((v, i) => (avg[i] && avg[i] > 0 ? v / avg[i] : null));
  return {
    name: 'volume',
    period,
    values: avg,
    raw: vols,
    ratio
  };
}

export default { calculate, volumeSma };
