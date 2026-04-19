import React, { useState } from 'react';
import { api } from '../api/client.js';
import { useToast } from './ToastContext.jsx';

const SYMBOL_RX = /^[A-Z0-9]{4,20}$/;
const PRESETS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT'];

/**
 * Modal "Aggiungi asset": input simbolo Binance validato.
 * Props:
 *  - onClose: () => void
 *  - onCreated: (asset) => void
 */
export default function AddAssetModal({ onClose, onCreated }) {
  const [symbol, setSymbol] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  /** Submit POST /api/watchlist con simbolo normalizzato maiuscolo. */
  async function submit(e) {
    e.preventDefault();
    const s = symbol.trim().toUpperCase();
    if (!SYMBOL_RX.test(s)) {
      setError('Formato simbolo non valido. Esempi: BTCUSDT, ETHUSDT.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/api/watchlist', { symbol: s });
      showToast(`${s} aggiunto alla watchlist`, 'success');
      onCreated && onCreated(res);
    } catch (e2) {
      setError(e2.message || 'Errore durante l aggiunta');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-40 p-3"
      role="dialog" aria-modal="true"
    >
      <form
        onSubmit={submit}
        className="bg-navy-700 rounded-xl w-full max-w-md p-4 flex flex-col gap-3"
      >
        <h2 className="text-lg font-semibold text-navy-50">Aggiungi asset</h2>
        <div>
          <label className="label" htmlFor="asset-sym">Simbolo Binance</label>
          <input
            id="asset-sym"
            className="input uppercase"
            placeholder="BTCUSDT"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            autoFocus
            autoCapitalize="characters"
            required
          />
          <div className="text-xs text-navy-100 mt-1">
            Solo lettere maiuscole e numeri, es. BTCUSDT, ETHUSDT.
          </div>
        </div>
        <div>
          <div className="text-xs text-navy-100 mb-1.5">Preset rapidi:</div>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p} type="button" onClick={() => setSymbol(p)}
                className="px-2.5 py-1 bg-navy-800 border border-navy-400 rounded-md text-xs
                  hover:border-orange"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        {error && <div className="text-sm text-sell">{error}</div>}
        <div className="flex gap-2 mt-1">
          <button type="button" className="btn-secondary flex-1" onClick={onClose}>
            Annulla
          </button>
          <button type="submit" className="btn-primary flex-1" disabled={loading}>
            {loading ? 'Aggiunta...' : 'Aggiungi'}
          </button>
        </div>
      </form>
    </div>
  );
}
