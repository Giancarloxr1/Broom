import React, { useMemo, useState } from 'react';
import useApi from '../hooks/useApi.js';
import AssetCard from '../components/AssetCard.jsx';
import SignalBadge from '../components/SignalBadge.jsx';
import AddAssetModal from '../components/AddAssetModal.jsx';
import { api } from '../api/client.js';
import { useToast } from '../components/ToastContext.jsx';
import { formatMoney, formatTime, formatDateTime } from '../lib/formatters.js';

/**
 * Dashboard: watchlist, ultimi 5 segnali, P/L del giorno, prossimo scan.
 * CTA grande se la watchlist e' vuota (onboarding inline).
 */
export default function Dashboard() {
  const [showAdd, setShowAdd] = useState(false);
  const watchlist = useApi('/api/watchlist');
  const signals = useApi('/api/signals?limit=5');
  const trades = useApi('/api/trades?status=CLOSED');
  const settings = useApi('/api/settings');
  const { showToast } = useToast();

  /** P/L trade chiusi OGGI (somma pnl_abs). */
  const pnlToday = useMemo(() => {
    if (!Array.isArray(trades.data)) return 0;
    const today = new Date().toDateString();
    return trades.data.reduce((acc, t) => {
      if (!t.exit_time) return acc;
      const d = new Date(t.exit_time);
      if (d.toDateString() === today) return acc + Number(t.pnl_abs || 0);
      return acc;
    }, 0);
  }, [trades.data]);

  /** Stima grossolana del prossimo scan (ogni 5 minuti). */
  const nextScan = useMemo(() => {
    const d = new Date();
    const min = d.getMinutes();
    const next = Math.ceil((min + 1) / 5) * 5;
    d.setMinutes(next, 0, 0);
    return d;
  }, [settings.data]);

  /** Rimuove un asset dalla watchlist. */
  async function removeAsset(asset) {
    if (!confirm(`Rimuovere ${asset.symbol}?`)) return;
    try {
      await api.del(`/api/watchlist/${asset.id}`);
      showToast('Asset rimosso', 'success');
      watchlist.refetch();
    } catch (e) {
      showToast(e.message || 'Errore', 'error');
    }
  }

  const loading = watchlist.loading && !watchlist.data;
  const wlEmpty = watchlist.data && watchlist.data.length === 0;

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-50">Trade Signal</h1>
          <p className="text-xs text-navy-100">
            Prossimo scan: {formatTime(nextScan)}
          </p>
        </div>
        <button className="btn-primary text-sm" onClick={() => setShowAdd(true)}>
          + Aggiungi asset
        </button>
      </header>

      <section className="grid grid-cols-2 gap-2">
        <div className="card">
          <div className="text-xs text-navy-100">P/L di oggi</div>
          <div className={
            'text-xl font-bold ' +
            (pnlToday > 0 ? 'text-buy' : pnlToday < 0 ? 'text-sell' : 'text-navy-50')
          }>
            {formatMoney(pnlToday)}
          </div>
        </div>
        <div className="card">
          <div className="text-xs text-navy-100">Asset monitorati</div>
          <div className="text-xl font-bold text-navy-50">
            {watchlist.data?.length ?? 0}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-navy-100 mb-2">Ultimi segnali</h2>
        {signals.loading && <div className="text-sm text-navy-100">Caricamento...</div>}
        {signals.error && (
          <div className="text-sm text-sell">Errore: {signals.error.message}</div>
        )}
        {signals.data && signals.data.length === 0 && (
          <div className="card text-sm text-navy-100">
            Ancora nessun segnale. Il prossimo scan sara alle {formatTime(nextScan)}.
          </div>
        )}
        {signals.data && signals.data.length > 0 && (
          <ul className="flex flex-col gap-1.5">
            {signals.data.slice(0, 5).map((s) => (
              <li key={s.id} className="card py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SignalBadge type={s.type} size="sm" />
                  <span className="font-medium text-navy-50">{s.symbol}</span>
                  <span className="text-xs text-navy-100">{s.timeframe}</span>
                </div>
                <span className="text-xs text-navy-100">
                  {formatDateTime(s.created_at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold text-navy-100 mb-2">Watchlist</h2>
        {loading && <div className="text-sm text-navy-100">Caricamento...</div>}
        {watchlist.error && (
          <div className="text-sm text-sell">
            Errore watchlist: {watchlist.error.message}
          </div>
        )}
        {wlEmpty && <OnboardingEmpty onAdd={() => setShowAdd(true)} />}
        {watchlist.data && watchlist.data.length > 0 && (
          <div className="grid grid-cols-1 gap-2">
            {watchlist.data.map((a) => (
              <AssetCard
                key={a.id}
                asset={a}
                lastSignals={(signals.data || []).filter((s) => s.asset_id === a.id)}
                onRemove={removeAsset}
              />
            ))}
          </div>
        )}
      </section>

      {showAdd && (
        <AddAssetModal
          onClose={() => setShowAdd(false)}
          onCreated={() => { setShowAdd(false); watchlist.refetch(); }}
        />
      )}
    </div>
  );
}

/** Stato vuoto informativo con 3 step inline. */
function OnboardingEmpty({ onAdd }) {
  return (
    <div className="card flex flex-col gap-3">
      <div className="text-lg font-semibold text-navy-50">Iniziamo in 3 passi</div>
      <ol className="list-decimal list-inside text-sm text-navy-100 space-y-1">
        <li>Aggiungi il primo asset alla watchlist (es. BTCUSDT)</li>
        <li>Configura indicatori o attiva la Smart Mode</li>
        <li>Collega Telegram in Opzioni per ricevere gli alert</li>
      </ol>
      <button className="btn-primary" onClick={onAdd}>
        Aggiungi il primo asset
      </button>
    </div>
  );
}
