import React, { useState } from 'react';
import { api } from '../api/client.js';
import { nowLocalInput } from '../lib/formatters.js';
import { useToast } from './ToastContext.jsx';

/**
 * Modal per apertura trade da segnale o manuale.
 * Props:
 *  - asset: { id, symbol, price? } pre-compilazione
 *  - signalId: opzionale, FK a signals
 *  - defaultSide: 'LONG' | 'SHORT' (default LONG)
 *  - onClose: () => void
 *  - onCreated: (trade) => void
 */
export default function OpenTradeModal({
  asset,
  signalId = null,
  defaultSide = 'LONG',
  onClose,
  onCreated,
}) {
  const [side, setSide] = useState(defaultSide);
  const [quantity, setQuantity] = useState('');
  const [entryPrice, setEntryPrice] = useState(asset?.price || '');
  const [entryTime, setEntryTime] = useState(nowLocalInput());
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  /** Invio: POST /api/trades con payload di apertura. */
  async function submit(e) {
    e.preventDefault();
    setError(null);
    const qty = Number(quantity);
    const priceNum = Number(entryPrice);
    if (!Number.isFinite(qty) || qty <= 0) {
      setError('Quantita non valida.');
      return;
    }
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      setError('Prezzo di ingresso non valido.');
      return;
    }
    setLoading(true);
    try {
      const created = await api.post('/api/trades', {
        asset_id: asset.id,
        symbol: asset.symbol,
        side,
        quantity: qty,
        entry_price: priceNum,
        entry_time: new Date(entryTime).toISOString(),
        signal_id: signalId,
        note: note || null,
      });
      showToast('Trade aperto', 'success');
      onCreated && onCreated(created);
    } catch (e2) {
      setError(e2.message || 'Errore apertura trade');
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
          Apri trade su {asset?.symbol || '—'}
        </h2>
        <div className="flex gap-2">
          {['LONG', 'SHORT'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSide(s)}
              className={
                'flex-1 py-2.5 rounded-lg font-semibold min-h-[44px] ' +
                (side === s
                  ? s === 'LONG'
                    ? 'bg-buy text-white'
                    : 'bg-sell text-white'
                  : 'bg-navy-800 text-navy-100 border border-navy-400')
              }
            >
              {s}
            </button>
          ))}
        </div>
        <div>
          <label className="label" htmlFor="qty">Quantita</label>
          <input id="qty" className="input" type="number" step="any" min="0"
            value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
        </div>
        <div>
          <label className="label" htmlFor="entry">Prezzo di ingresso</label>
          <input id="entry" className="input" type="number" step="any" min="0"
            value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)} required />
        </div>
        <div>
          <label className="label" htmlFor="entry-time">Data / ora</label>
          <input id="entry-time" className="input" type="datetime-local"
            value={entryTime} onChange={(e) => setEntryTime(e.target.value)} required />
        </div>
        <div>
          <label className="label" htmlFor="note">Note (opzionali)</label>
          <textarea id="note" className="input min-h-[60px]"
            value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        {error && <div className="text-sm text-sell">{error}</div>}
        <div className="flex gap-2 mt-1">
          <button type="button" className="btn-secondary flex-1" onClick={onClose}>
            Annulla
          </button>
          <button type="submit" className="btn-primary flex-1" disabled={loading}>
            {loading ? 'Salvataggio...' : 'Apri trade'}
          </button>
        </div>
      </form>
    </div>
  );
}
