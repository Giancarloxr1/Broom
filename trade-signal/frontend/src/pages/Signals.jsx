import React, { useMemo, useState } from 'react';
import useApi from '../hooks/useApi.js';
import SignalBadge from '../components/SignalBadge.jsx';
import OpenTradeModal from '../components/OpenTradeModal.jsx';
import useInterval from '../hooks/useInterval.js';
import { formatPrice, formatDateTime } from '../lib/formatters.js';

/**
 * Lista segnali storici con filtri (asset, tipo, TF).
 * Polling automatico ogni 30s per nuovi segnali.
 */
export default function Signals() {
  const [assetFilter, setAssetFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [tfFilter, setTfFilter] = useState('');
  const [opening, setOpening] = useState(null); // segnale selezionato per apri trade

  const query = useMemo(() => {
    const p = new URLSearchParams({ limit: '100' });
    if (assetFilter) p.set('assetId', assetFilter);
    if (typeFilter) p.set('type', typeFilter);
    if (tfFilter) p.set('timeframe', tfFilter);
    return `/api/signals?${p.toString()}`;
  }, [assetFilter, typeFilter, tfFilter]);

  const signals = useApi(query);
  const watchlist = useApi('/api/watchlist');

  // Polling 30s.
  useInterval(() => signals.refetch(), 30000);

  return (
    <div className="flex flex-col gap-3">
      <header>
        <h1 className="text-xl font-bold text-navy-50">Segnali</h1>
        <p className="text-xs text-navy-100">
          Aggiornamento automatico ogni 30 secondi.
        </p>
      </header>

      <section className="grid grid-cols-3 gap-2">
        <select className="input text-sm py-1.5 min-h-0" value={assetFilter}
          onChange={(e) => setAssetFilter(e.target.value)}>
          <option value="">Tutti gli asset</option>
          {(watchlist.data || []).map((a) => (
            <option key={a.id} value={a.id}>{a.symbol}</option>
          ))}
        </select>
        <select className="input text-sm py-1.5 min-h-0" value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">Tipo</option>
          <option value="BUY">BUY</option>
          <option value="SELL">SELL</option>
        </select>
        <select className="input text-sm py-1.5 min-h-0" value={tfFilter}
          onChange={(e) => setTfFilter(e.target.value)}>
          <option value="">TF</option>
          <option value="1h">1h</option>
          <option value="4h">4h</option>
          <option value="1d">1d</option>
          <option value="1w">1w</option>
        </select>
      </section>

      {signals.loading && !signals.data &&
        <div className="text-sm text-navy-100">Caricamento...</div>}
      {signals.error && <div className="text-sm text-sell">Errore: {signals.error.message}</div>}
      {signals.data && signals.data.length === 0 && (
        <div className="card text-sm text-navy-100">
          Nessun segnale ancora emesso con questi filtri.
        </div>
      )}

      {signals.data && signals.data.map((s) => (
        <div key={s.id} className="card flex items-center justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <SignalBadge type={s.type} size="sm" />
              <span className="font-semibold text-navy-50">{s.symbol}</span>
              <span className="text-xs text-navy-100">{s.timeframe}</span>
            </div>
            <div className="text-xs text-navy-100 mt-1">
              {formatDateTime(s.created_at)} — prezzo: {formatPrice(s.price)}
              {s.rule_name && <span className="ml-2">· {s.rule_name}</span>}
              {s.score != null && <span className="ml-2">· score {Number(s.score).toFixed(2)}</span>}
            </div>
          </div>
          <button
            type="button" className="btn-secondary text-xs py-1.5 min-h-0"
            onClick={() => setOpening(s)}
          >
            Apri trade
          </button>
        </div>
      ))}

      {opening && (
        <OpenTradeModal
          asset={{ id: opening.asset_id, symbol: opening.symbol, price: opening.price }}
          signalId={opening.id}
          defaultSide={opening.type === 'BUY' ? 'LONG' : 'SHORT'}
          onClose={() => setOpening(null)}
          onCreated={() => setOpening(null)}
        />
      )}
    </div>
  );
}
