// src/engine/smartScorer.js - SMART MODE: voti per indicatore, score pesato.
// Ogni indicatore emette BULL(+1)/BEAR(-1)/NEUTRAL(0).
// Score normalizzato = (sum weighted votes) / (sum of abs weights).

const VOTE = { BULL: 1, BEAR: -1, NEUTRAL: 0 };

function last(series, idx) {
  if (!Array.isArray(series)) return null;
  const v = series[idx];
  return v == null || Number.isNaN(v) ? null : Number(v);
}

// --- Voti per singolo indicatore ---
function voteRsi(ind, idx) {
  const v = last(ind?.values, idx);
  if (v == null) return VOTE.NEUTRAL;
  if (v < 30) return VOTE.BULL;
  if (v > 70) return VOTE.BEAR;
  return VOTE.NEUTRAL;
}

function voteMacd(ind, idx) {
  const hist = last(ind?.hist, idx);
  const prev = last(ind?.hist, idx - 1);
  if (hist == null || prev == null) return VOTE.NEUTRAL;
  if (prev <= 0 && hist > 0) return VOTE.BULL;
  if (prev >= 0 && hist < 0) return VOTE.BEAR;
  if (hist > 0 && hist > prev) return VOTE.BULL;
  if (hist < 0 && hist < prev) return VOTE.BEAR;
  return VOTE.NEUTRAL;
}

function voteEma(ind, idx, candles) {
  const ema = last(ind?.values, idx);
  if (ema == null || !candles[idx]) return VOTE.NEUTRAL;
  const price = Number(candles[idx].close);
  if (price > ema * 1.001) return VOTE.BULL;
  if (price < ema * 0.999) return VOTE.BEAR;
  return VOTE.NEUTRAL;
}

function voteBollinger(ind, idx, candles) {
  const upper = last(ind?.upper, idx);
  const lower = last(ind?.lower, idx);
  if (upper == null || lower == null || !candles[idx]) return VOTE.NEUTRAL;
  const price = Number(candles[idx].close);
  if (price <= lower) return VOTE.BULL;
  if (price >= upper) return VOTE.BEAR;
  return VOTE.NEUTRAL;
}

function voteAdx(ind, idx) {
  const adxV = last(ind?.values, idx);
  const plus = last(ind?.plusDI, idx);
  const minus = last(ind?.minusDI, idx);
  if (adxV == null || adxV < 20) return VOTE.NEUTRAL;
  if (plus != null && minus != null) {
    if (plus > minus) return VOTE.BULL;
    if (minus > plus) return VOTE.BEAR;
  }
  return VOTE.NEUTRAL;
}

function voteAtr() {
  // ATR non fornisce direzione: rimane neutrale nel voto.
  return VOTE.NEUTRAL;
}

function voteVwap(ind, idx, candles) {
  const v = last(ind?.values, idx);
  if (v == null || !candles[idx]) return VOTE.NEUTRAL;
  const price = Number(candles[idx].close);
  if (price > v) return VOTE.BULL;
  if (price < v) return VOTE.BEAR;
  return VOTE.NEUTRAL;
}

function voteStochRsi(ind, idx) {
  const k = last(ind?.k, idx);
  const d = last(ind?.d, idx);
  if (k == null) return VOTE.NEUTRAL;
  if (k < 20 && (d == null || k >= d)) return VOTE.BULL;
  if (k > 80 && (d == null || k <= d)) return VOTE.BEAR;
  return VOTE.NEUTRAL;
}

function voteVolume(ind, idx) {
  const ratio = last(ind?.ratio, idx);
  if (ratio == null) return VOTE.NEUTRAL;
  // Volume alto e' un conferma (non direzione): usa positivo se > 1.5
  if (ratio >= 1.5) return VOTE.BULL;
  if (ratio <= 0.5) return VOTE.BEAR;
  return VOTE.NEUTRAL;
}

const VOTERS = {
  rsi: voteRsi,
  macd: voteMacd,
  ema: voteEma,
  bollinger: voteBollinger,
  adx: voteAdx,
  atr: voteAtr,
  vwap: voteVwap,
  stochRsi: voteStochRsi,
  volume: voteVolume
};

/**
 * Calcola score Smart Mode su una candela idx.
 * @param {object} indicators mappa nome → output indicatore
 * @param {Array} weights lista { indicator_name, weight, enabled }
 * @param {Array} candles
 * @param {number} idx
 * @returns {{score:number, votes:object}}
 */
export function scoreAt(indicators, weights, candles, idx) {
  let weightedSum = 0;
  let totalWeight = 0;
  const votes = {};
  for (const w of weights) {
    if (!w.enabled) continue;
    const name = w.indicator_name;
    const fn = VOTERS[name];
    if (!fn) continue;
    const v = fn(indicators[name], idx, candles);
    votes[name] = v;
    const weight = Number(w.weight) || 0;
    weightedSum += v * weight;
    totalWeight += Math.abs(weight);
  }
  const score = totalWeight > 0 ? weightedSum / totalWeight : 0;
  return { score, votes };
}

/**
 * Decide segnale dato score e soglie.
 */
export function decide(score, thresholdBuy, thresholdSell) {
  if (score >= thresholdBuy) return 'BUY';
  if (score <= -thresholdSell) return 'SELL';
  return null;
}

/**
 * Verifica confluenza multi-TF: richiede segnale concorde su almeno
 * `tfConfluenceCount` dei TF passati.
 * @param {Array<{tf,signal}>} perTf
 * @param {number} required
 * @returns {string|null}
 */
export function combineTf(perTf, required) {
  const buys = perTf.filter(x => x.signal === 'BUY').length;
  const sells = perTf.filter(x => x.signal === 'SELL').length;
  if (buys >= required && buys > sells) return 'BUY';
  if (sells >= required && sells > buys) return 'SELL';
  return null;
}

export default { scoreAt, decide, combineTf };
