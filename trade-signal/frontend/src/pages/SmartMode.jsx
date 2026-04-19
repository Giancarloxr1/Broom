import React, { useEffect, useState } from 'react';
import useApi from '../hooks/useApi.js';
import { api } from '../api/client.js';
import { useToast } from '../components/ToastContext.jsx';

const KNOWN_INDICATORS = [
  'rsi', 'macd', 'ema', 'bollinger', 'adx', 'atr', 'vwap', 'stochRsi', 'volume',
];

/**
 * SmartMode: configurazione pesi indicatori + soglie + confluence TF + backtest.
 * Spiegazione utente in italiano di come funziona il motore di scoring.
 */
export default function SmartMode() {
  const cfg = useApi('/api/smart/config');
  const [state, setState] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showBacktest, setShowBacktest] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (cfg.data && !state) {
      setState({
        weights: cfg.data.weights || defaultWeights(),
        threshold_buy: cfg.data.threshold_buy ?? 0.6,
        threshold_sell: cfg.data.threshold_sell ?? 0.6,
        tf_confluence_count: cfg.data.tf_confluence_count ?? 2,
      });
    }
  }, [cfg.data, state]);

  /** Salva la config Smart Mode. */
  async function save() {
    setSaving(true);
    try {
      await api.put('/api/smart/config', state);
      showToast('Configurazione Smart salvata', 'success');
    } catch (e) {
      showToast(e.message || 'Errore', 'error');
    } finally {
      setSaving(false);
    }
  }

  if (cfg.loading || !state) {
    return <div className="text-sm text-navy-100">Caricamento...</div>;
  }
  if (cfg.error) {
    return <div className="text-sm text-sell">Errore: {cfg.error.message}</div>;
  }

  return (
    <div className="flex flex-col gap-3">
      <header>
        <h1 className="text-xl font-bold text-navy-50">Smart Mode</h1>
        <p className="text-xs text-navy-100">
          Il sistema combina automaticamente i segnali degli indicatori attivi in uno
          score tra -1 e +1. Quando lo score supera la soglia BUY/SELL su N
          timeframe concordi, viene emesso un segnale.
        </p>
      </header>

      <section className="card">
        <h2 className="font-semibold text-navy-50 mb-2">Pesi indicatori</h2>
        <div className="flex flex-col gap-2">
          {KNOWN_INDICATORS.map((id) => (
            <div key={id} className="flex items-center gap-3">
              <span className="w-24 text-sm text-navy-50 capitalize">{id}</span>
              <input
                type="range" min="0" max="2" step="0.1"
                className="flex-1 accent-orange"
                value={state.weights[id] ?? 1}
                onChange={(e) => setState({
                  ...state,
                  weights: { ...state.weights, [id]: Number(e.target.value) },
                })}
              />
              <span className="w-10 text-right text-sm text-navy-100">
                {(state.weights[id] ?? 1).toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="card flex flex-col gap-3">
        <h2 className="font-semibold text-navy-50">Soglie</h2>
        <SliderField label="Soglia BUY" value={state.threshold_buy}
          onChange={(v) => setState({ ...state, threshold_buy: v })} />
        <SliderField label="Soglia SELL" value={state.threshold_sell}
          onChange={(v) => setState({ ...state, threshold_sell: v })} />
        <div>
          <label className="label">TF concordi richiesti</label>
          <input
            type="number" min="1" max="4" className="input w-20"
            value={state.tf_confluence_count}
            onChange={(e) => setState({
              ...state,
              tf_confluence_count: Number(e.target.value),
            })}
          />
        </div>
      </section>

      <button className="btn-primary" onClick={save} disabled={saving}>
        {saving ? 'Salvataggio...' : 'Salva configurazione'}
      </button>

      <button className="btn-secondary" onClick={() => setShowBacktest(true)}>
        Lancia backtest
      </button>

      {showBacktest && (
        <BacktestModal
          onClose={() => setShowBacktest(false)}
          onApplied={() => { setShowBacktest(false); cfg.refetch(); setState(null); }}
        />
      )}
    </div>
  );
}

/** Slider 0..1 con label e valore. */
function SliderField({ label, value, onChange }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm text-navy-50">{label}</span>
        <span className="text-sm text-navy-100">{Number(value).toFixed(2)}</span>
      </div>
      <input
        type="range" min="0" max="1" step="0.05"
        className="w-full accent-orange"
        value={value} onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

/** Config default se backend ritorna null. */
function defaultWeights() {
  const w = {};
  KNOWN_INDICATORS.forEach((i) => { w[i] = 1.0; });
  return w;
}

/** Modal backtest: symbol + TFs + mesi → POST + apply. */
function BacktestModal({ onClose, onApplied }) {
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [months, setMonths] = useState(3);
  const [tfs, setTfs] = useState(['1h', '4h']);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  /** Esegue POST /api/smart/backtest. */
  async function run() {
    setLoading(true); setError(null);
    try {
      const r = await api.post('/api/smart/backtest', { symbol, timeframes: tfs, months });
      setResult(r);
    } catch (e) { setError(e.message || 'Errore backtest'); }
    finally { setLoading(false); }
  }

  /** Applica best config via POST /api/smart/apply-backtest/:id. */
  async function apply() {
    if (!result?.id) return;
    setLoading(true);
    try {
      await api.post(`/api/smart/apply-backtest/${result.id}`);
      showToast('Configurazione applicata', 'success');
      onApplied && onApplied();
    } catch (e) { setError(e.message || 'Errore'); }
    finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-40 p-3">
      <div className="bg-navy-700 rounded-xl w-full max-w-md p-4 flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-navy-50">Backtest Smart Mode</h2>
        <div>
          <label className="label">Simbolo</label>
          <input className="input uppercase" value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())} />
        </div>
        <div>
          <label className="label">Mesi</label>
          <input type="number" min="1" max="12" className="input"
            value={months} onChange={(e) => setMonths(Number(e.target.value))} />
        </div>
        <div>
          <label className="label">Timeframes</label>
          <div className="flex gap-1.5 flex-wrap">
            {['1h','4h','1d','1w'].map((tf) => (
              <button key={tf} type="button"
                onClick={() => setTfs(tfs.includes(tf) ? tfs.filter(t=>t!==tf) : [...tfs, tf])}
                className={'px-3 py-1.5 rounded-full text-sm ' +
                  (tfs.includes(tf) ? 'bg-orange text-white' : 'bg-navy-800 border border-navy-400 text-navy-100')}>
                {tf}
              </button>
            ))}
          </div>
        </div>
        {error && <div className="text-sm text-sell">{error}</div>}
        {result && (
          <div className="card bg-navy-800 text-sm">
            <div className="text-navy-50 font-medium mb-1">Miglior score: {result.score?.toFixed?.(2)}</div>
            <pre className="text-[10px] text-navy-100 overflow-auto max-h-48">
              {JSON.stringify(result.best_config, null, 2)}
            </pre>
          </div>
        )}
        <div className="flex gap-2">
          <button className="btn-secondary flex-1" onClick={onClose}>Chiudi</button>
          {!result ? (
            <button className="btn-primary flex-1" onClick={run} disabled={loading}>
              {loading ? 'Esecuzione...' : 'Esegui'}
            </button>
          ) : (
            <button className="btn-primary flex-1" onClick={apply} disabled={loading}>
              Applica configurazione
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
