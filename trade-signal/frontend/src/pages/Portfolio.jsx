import React, { useMemo, useState } from 'react';
import useApi from '../hooks/useApi.js';
import EquityLine from '../components/EquityLine.jsx';
import { api } from '../api/client.js';
import { useToast } from '../components/ToastContext.jsx';
import { formatMoney, formatPct } from '../lib/formatters.js';

/**
 * Pagina Portafoglio: capitale iniziale, corrente, equity line, stats.
 * Se il capitale iniziale non e' settato mostra form di inizializzazione.
 */
export default function Portfolio() {
  const pf = useApi('/api/portfolio');
  const trades = useApi('/api/trades');
  const [initial, setInitial] = useState('');
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  /** Imposta il capitale iniziale (PUT portfolio). */
  async function setupCapital(e) {
    e.preventDefault();
    const n = Number(initial);
    if (!Number.isFinite(n) || n <= 0) {
      showToast('Capitale non valido', 'error');
      return;
    }
    setSaving(true);
    try {
      await api.put('/api/portfolio', { initial_capital: n, current_capital: n });
      showToast('Portafoglio inizializzato', 'success');
      pf.refetch();
    } catch (e2) { showToast(e2.message, 'error'); }
    finally { setSaving(false); }
  }

  /** Serie equity per grafico: start + cumulative sui trade chiusi. */
  const equitySeries = useMemo(() => {
    if (!pf.data || !trades.data) return [];
    const closed = trades.data
      .filter((t) => t.status === 'CLOSED' && t.exit_time)
      .sort((a, b) => new Date(a.exit_time) - new Date(b.exit_time));
    let acc = Number(pf.data.initial_capital) || 0;
    const createdAt = pf.data.created_at ? new Date(pf.data.created_at) : new Date();
    const start = { time: Math.floor(createdAt.getTime() / 1000), value: acc };
    const out = [start];
    closed.forEach((t) => {
      acc += Number(t.pnl_abs || 0);
      out.push({ time: Math.floor(new Date(t.exit_time).getTime() / 1000), value: acc });
    });
    return out;
  }, [pf.data, trades.data]);

  /** Drawdown massimo (peak - trough) sulla serie equity. */
  const drawdown = useMemo(() => {
    if (!equitySeries.length) return 0;
    let peak = equitySeries[0].value;
    let maxDd = 0;
    equitySeries.forEach((p) => {
      if (p.value > peak) peak = p.value;
      const dd = peak - p.value;
      if (dd > maxDd) maxDd = dd;
    });
    return maxDd;
  }, [equitySeries]);

  if (pf.loading) return <div className="text-sm text-navy-100">Caricamento...</div>;
  if (pf.error) return <div className="text-sm text-sell">Errore: {pf.error.message}</div>;

  const notInitialized = !pf.data || !pf.data.initial_capital;
  if (notInitialized) {
    return (
      <form onSubmit={setupCapital} className="flex flex-col gap-3">
        <h1 className="text-xl font-bold text-navy-50">Imposta capitale iniziale</h1>
        <p className="text-xs text-navy-100">
          Il capitale iniziale e' il punto di partenza per calcolare P/L e drawdown.
        </p>
        <div>
          <label className="label">Capitale (EUR)</label>
          <input className="input" type="number" step="any" min="0"
            value={initial} onChange={(e) => setInitial(e.target.value)} required />
        </div>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Salvataggio...' : 'Salva e inizia'}
        </button>
      </form>
    );
  }

  const init = Number(pf.data.initial_capital) || 0;
  const curr = Number(pf.data.current_capital) || 0;
  const pnlAbs = curr - init;
  const pnlPct = init ? (pnlAbs / init) * 100 : 0;
  const openCnt = (trades.data || []).filter((t) => t.status === 'OPEN').length;
  const closedCnt = (trades.data || []).filter((t) => t.status === 'CLOSED').length;
  const color = pnlAbs > 0 ? 'text-buy' : pnlAbs < 0 ? 'text-sell' : 'text-navy-50';

  return (
    <div className="flex flex-col gap-3">
      <header>
        <h1 className="text-xl font-bold text-navy-50">Portafoglio</h1>
      </header>

      <div className="grid grid-cols-2 gap-2">
        <div className="card">
          <div className="text-xs text-navy-100">Capitale iniziale</div>
          <div className="text-lg font-bold text-navy-50">{formatMoney(init)}</div>
        </div>
        <div className="card">
          <div className="text-xs text-navy-100">Capitale corrente</div>
          <div className="text-lg font-bold text-navy-50">{formatMoney(curr)}</div>
        </div>
        <div className="card">
          <div className="text-xs text-navy-100">P/L totale</div>
          <div className={`text-lg font-bold ${color}`}>
            {formatMoney(pnlAbs)} ({formatPct(pnlPct)})
          </div>
        </div>
        <div className="card">
          <div className="text-xs text-navy-100">Drawdown max</div>
          <div className="text-lg font-bold text-navy-50">{formatMoney(drawdown)}</div>
        </div>
      </div>

      <section>
        <h2 className="text-sm font-semibold text-navy-100 mb-2">Equity curve</h2>
        <div className="card p-2">
          <EquityLine data={equitySeries} height={240} />
        </div>
      </section>

      <section className="grid grid-cols-2 gap-2">
        <div className="card text-center">
          <div className="text-xs text-navy-100">Trade aperti</div>
          <div className="text-2xl font-bold text-orange">{openCnt}</div>
        </div>
        <div className="card text-center">
          <div className="text-xs text-navy-100">Trade chiusi</div>
          <div className="text-2xl font-bold text-navy-50">{closedCnt}</div>
        </div>
      </section>
    </div>
  );
}
