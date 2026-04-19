import React, { useState } from 'react';
import IndicatorToggle from './IndicatorToggle.jsx';
import { api } from '../api/client.js';
import { useToast } from './ToastContext.jsx';

// Lista indicatori con parametri default + descrizione breve in italiano.
const CATALOG = [
  { id: 'rsi', label: 'RSI', desc: 'Indice di forza relativa.',
    defaults: { period: 14 }, params: [{ key: 'period', label: 'Periodo', hint: 'tipico 14' }] },
  { id: 'macd', label: 'MACD', desc: 'Convergenza / divergenza media mobile.',
    defaults: { fast: 12, slow: 26, signal: 9 },
    params: [
      { key: 'fast', label: 'Fast', hint: 'tipico 12' },
      { key: 'slow', label: 'Slow', hint: 'tipico 26' },
      { key: 'signal', label: 'Signal', hint: 'tipico 9' },
    ] },
  { id: 'ema', label: 'EMA', desc: 'Media mobile esponenziale (20/50/200).',
    defaults: { periods: '20,50,200' },
    params: [{ key: 'periods', label: 'Periodi (CSV)', hint: 'tipico 20,50,200' }] },
  { id: 'bollinger', label: 'Bollinger Bands', desc: 'Bande di volatilita.',
    defaults: { period: 20, stddev: 2 },
    params: [
      { key: 'period', label: 'Periodo', hint: 'tipico 20' },
      { key: 'stddev', label: 'Deviazioni', hint: 'tipico 2' },
    ] },
  { id: 'adx', label: 'ADX', desc: 'Forza del trend.',
    defaults: { period: 14 },
    params: [{ key: 'period', label: 'Periodo', hint: 'tipico 14' }] },
  { id: 'atr', label: 'ATR', desc: 'Average True Range (stop dinamici).',
    defaults: { period: 14 },
    params: [{ key: 'period', label: 'Periodo', hint: 'tipico 14' }] },
  { id: 'vwap', label: 'VWAP', desc: 'Prezzo medio pesato sui volumi.',
    defaults: { window: 20 },
    params: [{ key: 'window', label: 'Finestra', hint: 'tipico 20' }] },
  { id: 'stochRsi', label: 'Stochastic RSI', desc: 'RSI stocastico sensibile.',
    defaults: { period: 14, k: 3, d: 3 },
    params: [
      { key: 'period', label: 'Periodo', hint: 'tipico 14' },
      { key: 'k', label: '%K', hint: 'tipico 3' },
      { key: 'd', label: '%D', hint: 'tipico 3' },
    ] },
  { id: 'volume', label: 'Volume', desc: 'Volume con media mobile.',
    defaults: { avgPeriod: 20 },
    params: [{ key: 'avgPeriod', label: 'Media periodo', hint: 'tipico 20' }] },
];

/**
 * Pannello configurazione indicatori per un asset.
 * Props:
 *  - assetId: id asset
 *  - initial: { [indicator]: { enabled, params } } dal backend
 *  - onSaved: () => void (reload parent)
 */
export default function IndicatorPanel({ assetId, initial = {}, onSaved }) {
  const [configs, setConfigs] = useState(() => buildInitial(initial));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  /** Toggle ON/OFF per un indicatore. */
  function toggle(id, enabled) {
    setConfigs((c) => ({ ...c, [id]: { ...c[id], enabled } }));
  }

  /** Aggiorna un parametro (stringa; parsing a numero lato submit). */
  function updateParam(id, key, val) {
    setConfigs((c) => ({
      ...c, [id]: { ...c[id], params: { ...c[id].params, [key]: val } },
    }));
  }

  /** Submit: PUT /api/indicators/:assetId con configs normalizzate. */
  async function save() {
    setSaving(true);
    setError(null);
    try {
      const payload = { configs: normalize(configs) };
      await api.put(`/api/indicators/${assetId}`, payload);
      showToast('Configurazione indicatori salvata', 'success');
      onSaved && onSaved();
    } catch (e) {
      setError(e.message || 'Errore salvataggio');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <div className="text-sm text-sell">{error}</div>}
      <div className="flex flex-col divide-y divide-navy-400">
        {CATALOG.map((ind) => {
          const cfg = configs[ind.id] || { enabled: false, params: ind.defaults };
          return (
            <div key={ind.id} className="py-2">
              <IndicatorToggle
                id={`tog-${ind.id}`}
                label={ind.label}
                description={ind.desc}
                checked={!!cfg.enabled}
                onChange={(v) => toggle(ind.id, v)}
              />
              {cfg.enabled && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {ind.params.map((p) => (
                    <div key={p.key}>
                      <label className="label text-xs">{p.label}</label>
                      <input
                        className="input text-sm"
                        value={cfg.params?.[p.key] ?? ind.defaults[p.key]}
                        onChange={(e) => updateParam(ind.id, p.key, e.target.value)}
                      />
                      <div className="text-[10px] text-navy-100 mt-0.5">{p.hint}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <button type="button" className="btn-primary" onClick={save} disabled={saving}>
        {saving ? 'Salvataggio...' : 'Salva configurazione'}
      </button>
    </div>
  );
}

/** Popola lo stato iniziale partendo dal payload backend + default del catalog. */
function buildInitial(initial) {
  const out = {};
  CATALOG.forEach((ind) => {
    const fromApi = initial[ind.id];
    out[ind.id] = {
      enabled: fromApi?.enabled ?? false,
      params: fromApi?.params ? { ...ind.defaults, ...fromApi.params } : { ...ind.defaults },
    };
  });
  return out;
}

/** Converte i parametri stringa in numeri (salvo "periods" che resta CSV). */
function normalize(configs) {
  const out = {};
  CATALOG.forEach((ind) => {
    const cfg = configs[ind.id];
    if (!cfg) return;
    const params = {};
    ind.params.forEach((p) => {
      const raw = cfg.params?.[p.key];
      if (p.key === 'periods') {
        params[p.key] = String(raw);
      } else {
        const n = Number(raw);
        params[p.key] = Number.isFinite(n) ? n : raw;
      }
    });
    out[ind.id] = { enabled: !!cfg.enabled, params };
  });
  return out;
}
