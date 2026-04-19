import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useApi from '../hooks/useApi.js';
import { api } from '../api/client.js';
import { useToast } from '../components/ToastContext.jsx';
import { nowLocalInput } from '../lib/formatters.js';

/**
 * Editor trade manuale: nuovo o modifica trade aperto.
 * Non consente di modificare trade gia chiusi (redirect a /trades).
 */
export default function TradeEdit() {
  const { id } = useParams();
  const isNew = !id;
  const nav = useNavigate();
  const watchlist = useApi('/api/watchlist');
  const existing = useApi(!isNew ? `/api/trades/${id}` : null);
  const { showToast } = useToast();

  const [assetId, setAssetId] = useState('');
  const [side, setSide] = useState('LONG');
  const [quantity, setQuantity] = useState('');
  const [entryPrice, setEntryPrice] = useState('');
  const [entryTime, setEntryTime] = useState(nowLocalInput());
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isNew && existing.data) {
      const t = existing.data;
      if (t.status === 'CLOSED') { nav('/trades'); return; }
      setAssetId(t.asset_id || '');
      setSide(t.side || 'LONG');
      setQuantity(t.quantity ?? '');
      setEntryPrice(t.entry_price ?? '');
      if (t.entry_time) {
        const d = new Date(t.entry_time);
        const pad = (n) => String(n).padStart(2, '0');
        setEntryTime(`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
      }
      setNote(t.note || '');
    }
  }, [isNew, existing.data, nav]);

  /** Submit POST / PUT trade. */
  async function submit(e) {
    e.preventDefault();
    setError(null);
    const qty = Number(quantity);
    const price = Number(entryPrice);
    if (!assetId) return setError('Seleziona un asset');
    if (!Number.isFinite(qty) || qty <= 0) return setError('Quantita non valida');
    if (!Number.isFinite(price) || price <= 0) return setError('Prezzo non valido');
    setSaving(true);
    try {
      const asset = (watchlist.data || []).find((a) => String(a.id) === String(assetId));
      const payload = {
        asset_id: assetId,
        symbol: asset?.symbol,
        side, quantity: qty, entry_price: price,
        entry_time: new Date(entryTime).toISOString(),
        note: note || null,
      };
      if (isNew) await api.post('/api/trades', payload);
      else await api.put(`/api/trades/${id}`, payload);
      showToast('Trade salvato', 'success');
      nav('/trades');
    } catch (e2) {
      setError(e2.message || 'Errore');
    } finally {
      setSaving(false);
    }
  }

  if (!isNew && existing.loading) {
    return <div className="text-sm text-navy-100">Caricamento...</div>;
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-navy-50">
          {isNew ? 'Nuovo trade' : 'Modifica trade'}
        </h1>
        <button type="button" className="btn-ghost text-sm" onClick={() => nav('/trades')}>
          ← Indietro
        </button>
      </header>

      <div>
        <label className="label">Asset</label>
        <select className="input" value={assetId}
          onChange={(e) => setAssetId(e.target.value)} required>
          <option value="">Seleziona...</option>
          {(watchlist.data || []).map((a) => (
            <option key={a.id} value={a.id}>{a.symbol}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Lato</label>
        <div className="flex gap-2">
          {['LONG', 'SHORT'].map((s) => (
            <button key={s} type="button" onClick={() => setSide(s)}
              className={
                'flex-1 py-2.5 rounded-lg font-semibold min-h-[44px] ' +
                (side === s
                  ? s === 'LONG' ? 'bg-buy text-white' : 'bg-sell text-white'
                  : 'bg-navy-800 border border-navy-400 text-navy-100')
              }>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label">Quantita</label>
          <input className="input" type="number" step="any" min="0"
            value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
        </div>
        <div>
          <label className="label">Prezzo ingresso</label>
          <input className="input" type="number" step="any" min="0"
            value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)} required />
        </div>
      </div>

      <div>
        <label className="label">Data / ora</label>
        <input className="input" type="datetime-local"
          value={entryTime} onChange={(e) => setEntryTime(e.target.value)} required />
      </div>

      <div>
        <label className="label">Note</label>
        <textarea className="input min-h-[60px]" value={note}
          onChange={(e) => setNote(e.target.value)} />
      </div>

      {error && <div className="text-sm text-sell">{error}</div>}

      <div className="flex gap-2">
        <button type="button" className="btn-secondary flex-1" onClick={() => nav('/trades')}>
          Annulla
        </button>
        <button type="submit" className="btn-primary flex-1" disabled={saving}>
          {saving ? 'Salvataggio...' : 'Salva'}
        </button>
      </div>
    </form>
  );
}
