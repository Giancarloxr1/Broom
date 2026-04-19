// src/engine/confluence.js - Applica DSL a piu' TF con modalita' di confluenza
import { evaluateRule } from './evaluator.js';

/**
 * @param {object} dsl nodo DSL
 * @param {Array<{tf, candles, indicators}>} perTf
 * @param {string} mode 'all_tf' | 'any_tf' | 'n_of_m'
 * @param {number} [n] richiesti per 'n_of_m'
 * @returns {{matched: boolean, detail: Array<{tf, matched}>}}
 */
export function evaluateConfluence(dsl, perTf, mode = 'all_tf', n = 2) {
  const detail = [];
  for (const entry of perTf) {
    const { matched } = evaluateRule(dsl, {
      candles: entry.candles,
      indicators: entry.indicators,
      extraEma: entry.extraEma
    });
    detail.push({ tf: entry.tf, matched });
  }
  const matchedCount = detail.filter(d => d.matched).length;
  let matched = false;
  switch (mode) {
    case 'any_tf':
      matched = matchedCount > 0;
      break;
    case 'n_of_m':
      matched = matchedCount >= Math.min(n, perTf.length);
      break;
    case 'all_tf':
    default:
      matched = perTf.length > 0 && matchedCount === perTf.length;
      break;
  }
  return { matched, detail, matchedCount };
}

export default { evaluateConfluence };
