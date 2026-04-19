// src/portfolio/service.js - Gestione trade e aggiornamento portfolio
import { query, getPool } from '../db/pool.js';
import { computePnl } from './pnl.js';

export async function getPortfolio() {
  const { rows } = await query(`SELECT * FROM portfolio WHERE id = 1`);
  return rows[0] || null;
}

export async function updatePortfolio({ initial_capital, current_capital, currency }) {
  const fields = [];
  const values = [];
  let i = 1;
  if (initial_capital != null) { fields.push(`initial_capital = $${i++}`); values.push(initial_capital); }
  if (current_capital != null) { fields.push(`current_capital = $${i++}`); values.push(current_capital); }
  if (currency != null) { fields.push(`currency = $${i++}`); values.push(currency); }
  if (fields.length === 0) return getPortfolio();
  fields.push(`updated_at = NOW()`);
  const sql = `UPDATE portfolio SET ${fields.join(', ')} WHERE id = 1 RETURNING *`;
  const { rows } = await query(sql, values);
  return rows[0];
}

export async function listTrades({ status, assetId } = {}) {
  const clauses = [];
  const params = [];
  let i = 1;
  if (status) { clauses.push(`status = $${i++}`); params.push(status); }
  if (assetId) { clauses.push(`asset_id = $${i++}`); params.push(assetId); }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT t.*, a.symbol, a.display_name
     FROM trades t JOIN assets a ON a.id = t.asset_id
     ${where}
     ORDER BY t.entry_time DESC
     LIMIT 500`,
    params
  );
  return rows;
}

export async function getTrade(id) {
  const { rows } = await query(
    `SELECT t.*, a.symbol, a.display_name
     FROM trades t JOIN assets a ON a.id = t.asset_id
     WHERE t.id = $1`,
    [id]
  );
  return rows[0] || null;
}

export async function openTrade({
  asset_id, side, quantity, entry_price, entry_time, signal_id, note
}) {
  if (!asset_id || !side || !quantity || !entry_price) {
    throw new Error('Parametri trade mancanti');
  }
  if (!['LONG', 'SHORT'].includes(side)) throw new Error('side non valido');
  if (Number(quantity) <= 0) throw new Error('quantity deve essere > 0');
  const { rows } = await query(
    `INSERT INTO trades
       (asset_id, side, quantity, entry_price, entry_time, signal_id, status, note)
     VALUES ($1, $2, $3, $4, COALESCE($5, NOW()), $6, 'OPEN', $7)
     RETURNING *`,
    [asset_id, side, quantity, entry_price, entry_time || null, signal_id || null, note || null]
  );
  return rows[0];
}

export async function updateTrade(id, patch) {
  const allowed = ['quantity', 'entry_price', 'entry_time', 'signal_id', 'note', 'side'];
  const fields = [];
  const values = [];
  let i = 1;
  for (const k of allowed) {
    if (patch[k] != null) {
      fields.push(`${k} = $${i++}`);
      values.push(patch[k]);
    }
  }
  if (fields.length === 0) return getTrade(id);
  fields.push(`updated_at = NOW()`);
  values.push(id);
  const { rows } = await query(
    `UPDATE trades SET ${fields.join(', ')} WHERE id = $${i}
       AND status = 'OPEN' RETURNING *`,
    values
  );
  return rows[0] || null;
}

export async function closeTrade(id, { exit_price, exit_time }) {
  if (exit_price == null) throw new Error('exit_price obbligatorio');
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: curRows } = await client.query(
      `SELECT * FROM trades WHERE id = $1 FOR UPDATE`, [id]
    );
    if (curRows.length === 0) throw new Error('Trade non trovato');
    const t = curRows[0];
    if (t.status === 'CLOSED') throw new Error('Trade gia\' chiuso');
    const { pnl_abs, pnl_pct } = computePnl({
      side: t.side,
      quantity: t.quantity,
      entry_price: t.entry_price,
      exit_price
    });
    const { rows: updRows } = await client.query(
      `UPDATE trades SET
         exit_price = $1,
         exit_time  = COALESCE($2, NOW()),
         pnl_abs    = $3,
         pnl_pct    = $4,
         status     = 'CLOSED',
         updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [exit_price, exit_time || null, pnl_abs, pnl_pct, id]
    );
    // Aggiorna saldo portafoglio
    if (pnl_abs != null) {
      await client.query(
        `UPDATE portfolio SET
           current_capital = current_capital + $1,
           updated_at = NOW()
         WHERE id = 1`,
        [pnl_abs]
      );
    }
    await client.query('COMMIT');
    return updRows[0];
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

export async function deleteTrade(id) {
  await query(`DELETE FROM trades WHERE id = $1 AND status = 'OPEN'`, [id]);
}

export default {
  getPortfolio,
  updatePortfolio,
  listTrades,
  getTrade,
  openTrade,
  updateTrade,
  closeTrade,
  deleteTrade
};
