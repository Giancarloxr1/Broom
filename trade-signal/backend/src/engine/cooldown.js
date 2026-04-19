// src/engine/cooldown.js - Controllo cooldown segnali
import { query } from '../db/pool.js';

/**
 * Controlla se un nuovo segnale puo' essere emesso in base al cooldown.
 * @param {object} opts { ruleId, assetId, cooldownMinutes }
 * @returns {Promise<boolean>} true se permesso, false se ancora in cooldown
 */
export async function canEmit({ ruleId, assetId, cooldownMinutes }) {
  if (!cooldownMinutes || cooldownMinutes <= 0) return true;
  const params = [assetId, cooldownMinutes];
  let sql;
  if (ruleId) {
    sql = `SELECT created_at FROM signals
           WHERE asset_id = $1 AND rule_id = $3
             AND created_at > NOW() - ($2 || ' minutes')::interval
           ORDER BY created_at DESC LIMIT 1`;
    params.push(ruleId);
  } else {
    sql = `SELECT created_at FROM signals
           WHERE asset_id = $1 AND rule_id IS NULL
             AND created_at > NOW() - ($2 || ' minutes')::interval
           ORDER BY created_at DESC LIMIT 1`;
  }
  const { rows } = await query(sql, params);
  return rows.length === 0;
}

/**
 * Variante con chiave "source" (es. 'smart') per cooldown su Smart Mode.
 */
export async function canEmitSmart({ assetId, source, cooldownMinutes }) {
  if (!cooldownMinutes || cooldownMinutes <= 0) return true;
  const { rows } = await query(
    `SELECT created_at FROM signals
     WHERE asset_id = $1 AND source = $2
       AND created_at > NOW() - ($3 || ' minutes')::interval
     ORDER BY created_at DESC LIMIT 1`,
    [assetId, source, cooldownMinutes]
  );
  return rows.length === 0;
}

export default { canEmit, canEmitSmart };
