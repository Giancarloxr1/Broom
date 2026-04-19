// src/engine/signalBuilder.js - Costruisce oggetto signal e lo persiste
import { query } from '../db/pool.js';

/**
 * Snapshot sintetico degli indicatori in una candela idx.
 */
export function buildSnapshot(indicators, idx) {
  const snap = {};
  for (const [name, ind] of Object.entries(indicators || {})) {
    if (!ind || typeof ind !== 'object') continue;
    const entry = {};
    for (const [field, series] of Object.entries(ind)) {
      if (Array.isArray(series)) {
        entry[field] = series[idx] != null ? Number(series[idx]) : null;
      } else if (field === 'params' || field === 'period' || field === 'mode' || field === 'type') {
        entry[field] = series;
      }
    }
    snap[name] = entry;
  }
  return snap;
}

export async function persistSignal({
  assetId,
  ruleId = null,
  source = 'manual',
  type,
  timeframe,
  price,
  score = null,
  snapshot = null
}) {
  const { rows } = await query(
    `INSERT INTO signals
       (asset_id, rule_id, source, type, timeframe, price, score, snapshot_indicators)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
     RETURNING *`,
    [
      assetId,
      ruleId,
      source,
      type,
      timeframe,
      price,
      score,
      snapshot ? JSON.stringify(snapshot) : null
    ]
  );
  return rows[0];
}

export async function markTelegramSent(signalId) {
  await query(
    `UPDATE signals SET telegram_sent = TRUE WHERE id = $1`,
    [signalId]
  );
}

export default { buildSnapshot, persistSignal, markTelegramSent };
