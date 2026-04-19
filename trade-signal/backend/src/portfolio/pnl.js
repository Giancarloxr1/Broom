// src/portfolio/pnl.js - Calcoli P/L per trade

/**
 * Calcola P/L di un trade chiuso.
 * LONG: pnl = (exit - entry) * qty
 * SHORT: pnl = (entry - exit) * qty
 * pnl_pct = pnl / (entry * qty) * 100
 */
export function computePnl({ side, quantity, entry_price, exit_price }) {
  const qty = Number(quantity);
  const entry = Number(entry_price);
  const exit = Number(exit_price);
  if (!Number.isFinite(qty) || !Number.isFinite(entry) || !Number.isFinite(exit)) {
    return { pnl_abs: null, pnl_pct: null };
  }
  if (qty <= 0 || entry <= 0) {
    return { pnl_abs: null, pnl_pct: null };
  }
  let pnl;
  if (side === 'LONG') pnl = (exit - entry) * qty;
  else if (side === 'SHORT') pnl = (entry - exit) * qty;
  else return { pnl_abs: null, pnl_pct: null };
  const notional = entry * qty;
  const pct = notional > 0 ? (pnl / notional) * 100 : 0;
  return {
    pnl_abs: round(pnl, 6),
    pnl_pct: round(pct, 6)
  };
}

/**
 * Calcola P/L teorico di un trade aperto usando un prezzo corrente.
 */
export function computeUnrealized({ side, quantity, entry_price, mark_price }) {
  return computePnl({
    side,
    quantity,
    entry_price,
    exit_price: mark_price
  });
}

/**
 * Aggrega lista di trade chiusi → statistiche portafoglio.
 */
export function aggregateStats(trades) {
  const closed = trades.filter(t => t.status === 'CLOSED');
  const sum = closed.reduce((acc, t) => acc + (Number(t.pnl_abs) || 0), 0);
  const wins = closed.filter(t => Number(t.pnl_abs) > 0).length;
  const losses = closed.filter(t => Number(t.pnl_abs) < 0).length;
  const hitRate = closed.length > 0 ? wins / closed.length : 0;
  return {
    closedCount: closed.length,
    openCount: trades.length - closed.length,
    pnlSum: round(sum, 4),
    wins,
    losses,
    hitRate: round(hitRate, 4)
  };
}

function round(v, decimals = 6) {
  const f = Math.pow(10, decimals);
  return Math.round(v * f) / f;
}

export default { computePnl, computeUnrealized, aggregateStats };
