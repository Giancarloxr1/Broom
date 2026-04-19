import React, { useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import useApi from '../hooks/useApi.js';
import Chart from '../components/Chart.jsx';
import TimeframeTabs from '../components/TimeframeTabs.jsx';
import SmartScoreBar from '../components/SmartScoreBar.jsx';
import { api } from '../api/client.js';
import { useToast } from '../components/ToastContext.jsx';
import { formatPrice } from '../lib/formatters.js';

/**
 * Vista grafico per un asset + timeframe selezionato.
 * URL: /chart/:symbol?tf=1h
 * Controlli: TimeframeTabs, toggle RSI/MACD/Stoch, bottone "Aggiungi a watchlist".
 */
export default function ChartView() {
  const { symbol = 'BTCUSDT' } = useParams();
  const [sp, setSp] = useSearchParams();
  const tf = sp.get('tf') || '1h';
  const [showRsi, setShowRsi] = useState(true);
  const [showMacd, setShowMacd] = useState(true);
  const [showStoch, setShowStoch] = useState(false);
  const { showToast } = useToast();

  const candles = useApi(`/api/candles?symbol=${symbol}&interval=${tf}&limit=300`);
  const overlays = useApi(`/api/candles/overlays?symbol=${symbol}&interval=${tf}`);
  const smart = useApi(`/api/smart/score?symbol=${symbol}&tf=${tf}`);
  const watchlist = useApi('/api/watchlist');

  const inWatchlist = useMemo(() => {
    if (!watchlist.data) return false;
    return watchlist.data.some((a) => a.symbol === symbol);
  }, [watchlist.data, symbol]);

  /** Cambia timeframe aggiornando query string. */
  function setTf(next) {
    const p = new URLSearchParams(sp);
    p.set('tf', next);
    setSp(p);
  }

  /** Aggiunge il simbolo alla watchlist. */
  async function addToWatchlist() {
    try {
      await api.post('/api/watchlist', { symbol });
      showToast(`${symbol} aggiunto`, 'success');
      watchlist.refetch();
    } catch (e) {
      showToast(e.message || 'Errore', 'error');
    }
  }

  const subpanels = {};
  if (showRsi) subpanels.rsi = overlays.data?.rsi;
  if (showMacd) subpanels.macd = overlays.data?.macd;
  if (showStoch) subpanels.stochRsi = overlays.data?.stochRsi;

  const lastPrice = useMemo(() => {
    if (!candles.data || !candles.data.length) return null;
    return candles.data[candles.data.length - 1].close;
  }, [candles.data]);

  return (
    <div className="flex flex-col gap-3">
      <header className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-navy-50">{symbol}</h1>
          <div className="text-sm text-navy-100">
            {lastPrice != null ? formatPrice(lastPrice) : '—'}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TimeframeTabs value={tf} onChange={setTf} />
        </div>
      </header>

      {!inWatchlist && (
        <button className="btn-secondary text-sm" onClick={addToWatchlist}>
          + Aggiungi a watchlist
        </button>
      )}

      {candles.loading && <div className="text-sm text-navy-100">Caricamento candele...</div>}
      {candles.error && (
        <div className="text-sm text-sell">
          Errore candele: {candles.error.message}
        </div>
      )}
      {candles.data && candles.data.length === 0 && (
        <div className="card text-sm text-navy-100">
          Nessuna candela disponibile per {symbol} / {tf}.
        </div>
      )}
      {candles.data && candles.data.length > 0 && (
        <Chart
          candles={candles.data}
          overlays={overlays.data?.overlays || {}}
          subpanels={subpanels}
          height={320}
        />
      )}

      <div className="flex flex-wrap gap-2">
        <ToggleChip label="RSI" on={showRsi} onChange={setShowRsi} />
        <ToggleChip label="MACD" on={showMacd} onChange={setShowMacd} />
        <ToggleChip label="Stoch RSI" on={showStoch} onChange={setShowStoch} />
      </div>

      {smart.data && (
        <div className="card">
          <div className="text-xs text-navy-100 mb-1">Smart Mode score</div>
          <SmartScoreBar
            score={smart.data.score ?? 0}
            thresholdBuy={smart.data.threshold_buy ?? 0.6}
            thresholdSell={smart.data.threshold_sell ?? 0.6}
            label={smart.data.explanation}
          />
        </div>
      )}
    </div>
  );
}

/** Chip ON/OFF riutilizzabile per sub-panel. */
function ToggleChip({ label, on, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={
        'px-3 py-1.5 rounded-full text-xs font-medium min-h-[36px] ' +
        (on ? 'bg-orange text-white' : 'bg-navy-800 border border-navy-400 text-navy-100')
      }
    >
      {label} {on ? 'ON' : 'OFF'}
    </button>
  );
}
