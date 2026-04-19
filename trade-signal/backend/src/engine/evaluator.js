// src/engine/evaluator.js - Valuta DSL regole su indicatori+candele
// DSL esempio:
// { "all": [ { "indicator": "rsi", "field": "values", "op": "<", "value": 30 },
//            { "indicator": "price", "op": ">", "ref": "ema200" } ] }
// Nodi logici: { all: [...] } | { any: [...] } | foglia
// Operatori: <, <=, >, >=, ==, crossUp, crossDown
// Referenze supportate: numero, 'price', 'ema20'/'ema50'/'ema200', altri indicatori

const LEAF_OPS = new Set(['<', '<=', '>', '>=', '==', 'crossUp', 'crossDown']);

/**
 * Valuta un nodo DSL.
 * @param {object} node
 * @param {object} ctx { candles, indicators, idx }
 * @returns {boolean}
 */
export function evaluateNode(node, ctx) {
  if (!node || typeof node !== 'object') return false;
  if (Array.isArray(node.all)) {
    return node.all.every(child => evaluateNode(child, ctx));
  }
  if (Array.isArray(node.any)) {
    return node.any.some(child => evaluateNode(child, ctx));
  }
  return evaluateLeaf(node, ctx);
}

function getSeries(node, ctx) {
  // 'price' → array close
  if (node.indicator === 'price') {
    return ctx.candles.map(c => Number(c.close));
  }
  const ind = ctx.indicators?.[node.indicator];
  if (!ind) return null;
  // Campo 'field' (default: 'values'). Alcuni indicatori hanno field alternativi.
  const field = node.field || 'values';
  const series = ind[field];
  if (!Array.isArray(series)) return null;
  return series;
}

function resolveRef(ref, ctx, idx) {
  if (ref == null) return null;
  if (typeof ref === 'number') return ref;
  if (typeof ref !== 'string') return null;
  // 'price' → close corrente
  if (ref === 'price') return Number(ctx.candles[idx].close);
  // emaN pattern
  const emaMatch = ref.match(/^ema(\d+)$/);
  if (emaMatch) {
    const period = Number(emaMatch[1]);
    const emaInd = ctx.indicators?.ema;
    // Se la config ema ha periodo diverso, prova ema.values (stesso periodo usato)
    if (emaInd && emaInd.period === period && Array.isArray(emaInd.values)) {
      return emaInd.values[idx];
    }
    // Fallback: cerca in ctx.extraEma se fornito
    if (ctx.extraEma && Array.isArray(ctx.extraEma[`ema${period}`])) {
      return ctx.extraEma[`ema${period}`][idx];
    }
    return null;
  }
  // Riferimento indicatore: "indicatore.campo"
  const parts = ref.split('.');
  if (parts.length === 2) {
    const ind = ctx.indicators?.[parts[0]];
    if (ind && Array.isArray(ind[parts[1]])) return ind[parts[1]][idx];
  }
  return null;
}

function evaluateLeaf(node, ctx) {
  if (!LEAF_OPS.has(node.op)) return false;
  const series = getSeries(node, ctx);
  if (!series) return false;
  const idx = ctx.idx;
  const cur = series[idx];
  if (cur == null || Number.isNaN(cur)) return false;

  // Cross operators richiedono valore precedente
  if (node.op === 'crossUp' || node.op === 'crossDown') {
    if (idx < 1) return false;
    const prev = series[idx - 1];
    if (prev == null) return false;
    const target = resolveRef(node.ref != null ? node.ref : node.value, ctx, idx);
    const targetPrev = resolveRef(
      node.ref != null ? node.ref : node.value, ctx, idx - 1
    );
    if (target == null || targetPrev == null) return false;
    if (node.op === 'crossUp') {
      return prev <= targetPrev && cur > target;
    }
    return prev >= targetPrev && cur < target;
  }

  const rhs = resolveRef(node.ref != null ? node.ref : node.value, ctx, idx);
  if (rhs == null || Number.isNaN(rhs)) return false;

  switch (node.op) {
    case '<':  return cur < rhs;
    case '<=': return cur <= rhs;
    case '>':  return cur > rhs;
    case '>=': return cur >= rhs;
    case '==': return cur === rhs;
    default:   return false;
  }
}

/**
 * Valuta una regola (DSL) su un contesto. idx default: ultima candela.
 * @returns {{matched: boolean, idx: number}}
 */
export function evaluateRule(dsl, ctx) {
  const idx = ctx.idx != null ? ctx.idx : ctx.candles.length - 1;
  const matched = evaluateNode(dsl, { ...ctx, idx });
  return { matched, idx };
}

export default { evaluateNode, evaluateRule };
