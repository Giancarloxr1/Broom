import React, { useState } from 'react';
import useApi from '../hooks/useApi.js';
import IndicatorPanel from '../components/IndicatorPanel.jsx';

/**
 * Per ogni asset in watchlist mostra una sezione collapsible con IndicatorPanel
 * per configurare quali indicatori attivare e i parametri.
 */
export default function Indicators() {
  const watchlist = useApi('/api/watchlist');
  const [openId, setOpenId] = useState(null);

  /** Toggle apertura sezione asset. */
  function toggleOpen(id) {
    setOpenId((cur) => (cur === id ? null : id));
  }

  return (
    <div className="flex flex-col gap-3">
      <header>
        <h1 className="text-xl font-bold text-navy-50">Indicatori</h1>
        <p className="text-xs text-navy-100">
          Attiva gli indicatori che vuoi valutare per ciascun asset.
        </p>
      </header>

      {watchlist.loading && <div className="text-sm text-navy-100">Caricamento...</div>}
      {watchlist.error && (
        <div className="text-sm text-sell">Errore: {watchlist.error.message}</div>
      )}
      {watchlist.data && watchlist.data.length === 0 && (
        <div className="card text-sm text-navy-100">
          Aggiungi prima un asset dalla Home per configurarne gli indicatori.
        </div>
      )}
      {watchlist.data && watchlist.data.map((asset) => (
        <AssetSection
          key={asset.id}
          asset={asset}
          open={openId === asset.id}
          onToggle={() => toggleOpen(asset.id)}
        />
      ))}
    </div>
  );
}

/** Sezione collapsible per un singolo asset. */
function AssetSection({ asset, open, onToggle }) {
  const cfg = useApi(open ? `/api/indicators/${asset.id}` : null, { deps: [open] });
  return (
    <div className="card p-0 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div>
          <div className="font-semibold text-navy-50">{asset.symbol}</div>
          <div className="text-xs text-navy-100">
            {asset.display_name || 'Tocca per configurare'}
          </div>
        </div>
        <span className="text-navy-100 text-lg">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="border-t border-navy-400 p-4">
          {cfg.loading && <div className="text-sm text-navy-100">Caricamento...</div>}
          {cfg.error && (
            <div className="text-sm text-sell">Errore: {cfg.error.message}</div>
          )}
          {!cfg.loading && (
            <IndicatorPanel
              assetId={asset.id}
              initial={cfg.data?.configs || {}}
              onSaved={() => cfg.refetch()}
            />
          )}
        </div>
      )}
    </div>
  );
}
