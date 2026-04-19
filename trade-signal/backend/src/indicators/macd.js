// src/indicators/macd.js - MACD (line, signal, histogram)
import { ema } from './ema.js';

export function macd(closes, fast = 12, slow = 26, signalP = 9) {
  const n = closes.length;
  const emaFast = ema(closes, fast);
  const emaSlow = ema(closes, slow);
  const line = new Array(n).fill(null);
  for (let i = 0; i < n; i++) {
    if (emaFast[i] != null && emaSlow[i] != null) {
      line[i] = emaFast[i] - emaSlow[i];
    }
  }
  // Signal line: EMA della MACD line, calcolata solo sui valori disponibili
  const firstIdx = line.findIndex(v => v != null);
  const signal = new Array(n).fill(null);
  const hist = new Array(n).fill(null);
  if (firstIdx >= 0) {
    const sub = line.slice(firstIdx).map(v => v);
    const sig = ema(sub, signalP);
    for (let i = 0; i < sig.length; i++) {
      const targetIdx = firstIdx + i;
      signal[targetIdx] = sig[i];
      if (sig[i] != null && line[targetIdx] != null) {
        hist[targetIdx] = line[targetIdx] - sig[i];
      }
    }
  }
  return { line, signal, hist };
}

export function calculate(candles, params = {}) {
  const fast = Number(params.fast) || 12;
  const slow = Number(params.slow) || 26;
  const signalP = Number(params.signal) || 9;
  const closes = candles.map(c => Number(c.close));
  const { line, signal, hist } = macd(closes, fast, slow, signalP);
  return {
    name: 'macd',
    params: { fast, slow, signal: signalP },
    line,
    signal,
    hist,
    // Uniforma a "values" che e' il campo piu' rappresentativo (hist)
    values: hist
  };
}

export default { calculate, macd };
