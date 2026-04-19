import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useApi from '../hooks/useApi.js';
import TradeCard from '../components/TradeCard.jsx';
import CloseTradeModal from '../components/CloseTradeModal.jsx';
import { api } from '../api/client.js';
import { useToast } from '../components/ToastContext.jsx';

/**
 * Lista trade con filtri (stato / asset). Chiusura via modal.
 */
export default function Trades() {
  const [statusFilter, setStatusFilter] = useState('');
  const [assetFilter, setAssetFilter] = useState('');
  const [closing, setClosing] = useState(null);
  const nav = useNavigate();
  const { showToast } = useToast();

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (statusFilter) p.set('status', statusFilter);
    if (assetFilter) p.set('assetId', assetFilter);
    const qs = p.toString();
    return '/api/trades' + (qs ? `?${qs}` : '');
  }, [statusFilter, assetFilter]);

  const trades = useApi(query);
  const watchlist = useApi('/api/watchlist');

  /** Elimina un trade. */
  async function del(trade) {
    if (!confirm('Eliminare questo trade?')) return;
    try {
      await api.del(`/api/trades/${trade.id}`);
      showToast('Trade eliminato', 'success');
      trades.refetch();
    } catch (e) { showToast(e.message, 'error'); }
  }

  return (
    <div className="flex flex-col gap-3">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-navy-50">Trade</h1>
        <button className="btn-primary text-sm" onClick={() => nav('/trades/new')}>
          + Nuovo trade
        </button>
      </header>

      <section className="grid grid-cols-2 gap-2">
        <select className="input text-sm py-1.5 min-h-0" value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Tutti gli stati</option>
          <option value="OPEN">Aperti</option>
          <option value="CLOSED">Chiusi</option>
        </select>
        <select className="input text-sm py-1.5 min-h-0" value={assetFilter}
          onChange={(e) => setAssetFilter(e.target.value)}>
          <option value="">Tutti gli asset</option>
          {(watchlist.data || []).map((a) => (
            <option key={a.id} value={a.id}>{a.symbol}</option>
          ))}
        </select>
      </section>

      {trades.loading && !trades.data &&
        <div className="text-sm text-navy-100">Caricamento...</div>}
      {trades.error && <div className="text-sm text-sell">Errore: {trades.error.message}</div>}
      {trades.data && trades.data.length === 0 && (
        <div className="card text-sm text-navy-100">
          Nessun trade con questi filtri. Creane uno manuale o da un segnale.
        </div>
      )}

      {trades.data && trades.data.map((t) => (
        <TradeCard
          key={t.id} trade={t}
          onClose={() => setClosing(t)}
          onEdit={() => nav(`/trades/${t.id}`)}
          onDelete={() => del(t)}
        />
      ))}

      {closing && (
        <CloseTradeModal
          trade={closing}
          onClose={() => setClosing(null)}
          onClosed={() => { setClosing(null); trades.refetch(); }}
        />
      )}
    </div>
  );
}
