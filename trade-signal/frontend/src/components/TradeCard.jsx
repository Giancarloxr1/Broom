import React from 'react';
import { formatPrice, formatMoney, formatPct, formatDateTime } from '../lib/formatters.js';

/**
 * Riga / card di un trade (LONG o SHORT, aperto o chiuso).
 * Props:
 *  - trade: oggetto trade del backend
 *  - onClose: () => void  (mostra bottone "Chiudi" se status OPEN)
 *  - onEdit: () => void   (link modifica)
 *  - onDelete: () => void
 */
export default function TradeCard({ trade, onClose, onEdit, onDelete }) {
  const isOpen = trade.status === 'OPEN';
  const pnl = Number(trade.pnl_abs);
  const pnlPct = Number(trade.pnl_pct);
  const pnlColor = !Number.isFinite(pnl) || pnl === 0
    ? 'text-navy-100'
    : pnl > 0
    ? 'text-buy'
    : 'text-sell';

  return (
    <div className="card flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-base font-semibold text-navy-50">
            {trade.symbol || trade.asset_symbol || '—'}
            <span
              className={
                'ml-2 text-[10px] px-1.5 py-0.5 rounded font-semibold ' +
                (trade.side === 'LONG' ? 'bg-buy text-white' : 'bg-sell text-white')
              }
            >
              {trade.side}
            </span>
          </div>
          <div className="text-xs text-navy-100">
            {formatDateTime(trade.entry_time)}
            {trade.exit_time && ' → ' + formatDateTime(trade.exit_time)}
          </div>
        </div>
        <div className="text-right">
          {isOpen ? (
            <span className="text-orange text-xs font-semibold">APERTO</span>
          ) : (
            <div>
              <div className={`font-bold text-sm ${pnlColor}`}>
                {Number.isFinite(pnl) ? formatMoney(pnl) : '—'}
              </div>
              <div className={`text-xs ${pnlColor}`}>
                {Number.isFinite(pnlPct) ? formatPct(pnlPct) : ''}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs text-navy-100">
        <div>
          <div className="opacity-70">Qty</div>
          <div className="text-navy-50 font-medium">{trade.quantity}</div>
        </div>
        <div>
          <div className="opacity-70">Entry</div>
          <div className="text-navy-50 font-medium">{formatPrice(trade.entry_price)}</div>
        </div>
        <div>
          <div className="opacity-70">Exit</div>
          <div className="text-navy-50 font-medium">
            {trade.exit_price != null ? formatPrice(trade.exit_price) : '—'}
          </div>
        </div>
      </div>

      {trade.note && (
        <div className="text-xs text-navy-100 italic border-l-2 border-navy-400 pl-2">
          {trade.note}
        </div>
      )}

      <div className="flex gap-2 pt-1">
        {isOpen && onClose && (
          <button type="button" onClick={onClose} className="btn-primary text-sm flex-1">
            Chiudi trade
          </button>
        )}
        {onEdit && (
          <button type="button" onClick={onEdit} className="btn-secondary text-sm">
            Modifica
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="btn-secondary text-sm"
            aria-label="Elimina trade"
          >
            Elimina
          </button>
        )}
      </div>
    </div>
  );
}
