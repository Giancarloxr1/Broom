// src/indicators/index.js - Registry e helper computeAll
import ema from './ema.js';
import rsi from './rsi.js';
import macd from './macd.js';
import bollinger from './bollinger.js';
import adx from './adx.js';
import atr from './atr.js';
import vwap from './vwap.js';
import stochRsi from './stochRsi.js';
import volume from './volume.js';

export const REGISTRY = {
  ema,
  rsi,
  macd,
  bollinger,
  adx,
  atr,
  vwap,
  stochRsi,
  volume
};

export const DEFAULT_PARAMS = {
  ema: { period: 20 },
  rsi: { period: 14 },
  macd: { fast: 12, slow: 26, signal: 9 },
  bollinger: { period: 20, mult: 2 },
  adx: { period: 14 },
  atr: { period: 14 },
  vwap: { mode: 'cumulative' },
  stochRsi: { rsiPeriod: 14, stochPeriod: 14, kSmooth: 3, dSmooth: 3 },
  volume: { period: 20 }
};

/**
 * Calcola tutti gli indicatori richiesti sulle candele.
 * @param {Array} candles
 * @param {Array<{name:string, params:object}>} configs
 * @returns {Object} mappa { [name]: output }
 */
export function computeAll(candles, configs = []) {
  const out = {};
  for (const cfg of configs) {
    const name = cfg.name;
    const mod = REGISTRY[name];
    if (!mod || typeof mod.calculate !== 'function') continue;
    const params = { ...(DEFAULT_PARAMS[name] || {}), ...(cfg.params || {}) };
    try {
      out[name] = mod.calculate(candles, params);
    } catch (err) {
      out[name] = { name, error: err.message };
    }
  }
  return out;
}

/**
 * Calcola tutti gli indicatori default.
 */
export function computeDefaults(candles) {
  const configs = Object.keys(REGISTRY).map(name => ({
    name,
    params: DEFAULT_PARAMS[name] || {}
  }));
  return computeAll(candles, configs);
}

export default { REGISTRY, DEFAULT_PARAMS, computeAll, computeDefaults };
