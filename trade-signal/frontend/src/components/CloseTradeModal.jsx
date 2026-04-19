import React, { useState } from 'react';
import { api } from '../api/client.js';
import { nowLocalInput } from '../lib/formatters.js';
import { useToast } from './ToastContext.jsx';

/**
 * Modal di chiusura trade: chiede exit_price + exit_time.
 * Props:
 *  - trade: oggetto trade aperto
 *  - onClose: () => void (chiude modal senza azione)
 *  - onClosed: () => void (chiusura avvenuta, per ricaricare liste)
 */
export default function CloseTradeModal({ trade, onClose, onClosed }) {
  const [exitPrice, setExitPrice] = useState(trade.current_price || '');
  const [exitTime, setExitTime] = useState(nowLocalInput());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  /** Invio: PUT /api/trades/:id/close con prezzo e timestamp ISO. */
  async function submit(e) {
    e.preventDefault();
    setError(null);
    const priceNum = Number(exitPrice);
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      setError('Inserisci un prezzo di uscita valido.');
      return;
    }
    setLoading(true);
    try {
      await api.put(`/api/trades/${trade.id}/close`, {
        exit_price: priceNum,
        exit_time: new Date(exitTime).toISOString(),
      });
      showToast('Trade chiuso correttamente', 'success');
      onClosed && onClosed();
    } catch (e2) {
      setError(e2.message || 'Errore durante la chiusura');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-40 p-3"
      role="dialog"
      aria-modal="true"
    >
      <form
        onSubmit={submit}
        className="bg-navy-700 rounded-xl w-full max-w-md p-4 flex flex-col gap-3"
      >
        <h2 className="text-lg font-semibold text-navy-50">
          Chiudi {trade.symbol || 'trade'}
        </h2>
        <div className="text-xs text-navy-100">
          Entry: {trade.entry_price} — Qty: {trade.quantity}
        </div>
        <div>
          <label className="label" htmlFor="exit-price">Prezzo di uscita</label>
          <input
            id="exit-price"
            className="input"
            type="number"
            step="any"
            min="0"
            value={exitPrice}
            onChange={(e) => setExitPrice(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="exit-time">Data / ora chiusura</label>
          <input
            id="exit-time"
            className="input"
            type="datetime-local"
            value={exitTime}
            onChange={(e) => setExitTime(e.target.value)}
            required
          />
        </div>
        {error && <div className="text-sm text-sell">{error}</div>}
        <div className="flex gap-2 mt-1">
          <button type="button" className="btn-secondary flex-1" onClick={onClose}>
            Annulla
          </button>
          <button type="submit" className="btn-primary flex-1" disabled={loading}>
            {loading ? 'Chiusura...' : 'Conferma'}
          </button>
        </div>
      </form>
    </div>
  );
}
