import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useApi from '../hooks/useApi.js';
import RuleBuilder from '../components/RuleBuilder.jsx';
import { api } from '../api/client.js';
import { useToast } from '../components/ToastContext.jsx';
import { emptyDsl, validateDsl, RULE_PRESETS } from '../lib/ruleDsl.js';

/**
 * Editor di una regola. Se :id e' presente → modifica (GET), altrimenti → nuova.
 * Pulsanti "Carica preset" precompilano il builder con 5 regole standard.
 */
export default function RuleEdit() {
  const { id } = useParams();
  const nav = useNavigate();
  const isNew = !id;
  const existing = useApi(!isNew ? `/api/rules/${id}` : null);
  const [name, setName] = useState('');
  const [dsl, setDsl] = useState(() => emptyDsl('BUY'));
  const [enabled, setEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState([]);
  const { showToast } = useToast();

  useEffect(() => {
    if (!isNew && existing.data) {
      setName(existing.data.name || '');
      setDsl(existing.data.dsl || emptyDsl('BUY'));
      setEnabled(existing.data.enabled ?? true);
    }
  }, [isNew, existing.data]);

  /** Applica un preset al builder corrente. */
  function loadPreset(preset) {
    setName((n) => n || preset.name);
    setDsl(preset.dsl);
    showToast(`Preset "${preset.name}" caricato`, 'success');
  }

  /** Salva creazione / update regola. */
  async function submit(e) {
    e.preventDefault();
    const errs = validateDsl(dsl);
    if (!name.trim()) errs.unshift('Nome regola obbligatorio');
    setErrors(errs);
    if (errs.length) return;
    setSaving(true);
    const payload = {
      name, type: dsl.type, dsl, enabled,
      timeframes: dsl.timeframes,
      cooldown_minutes: dsl.cooldown_minutes,
    };
    try {
      if (isNew) await api.post('/api/rules', payload);
      else await api.put(`/api/rules/${id}`, payload);
      showToast('Regola salvata', 'success');
      nav('/rules');
    } catch (e2) {
      showToast(e2.message || 'Errore', 'error');
    } finally { setSaving(false); }
  }

  if (!isNew && existing.loading) {
    return <div className="text-sm text-navy-100">Caricamento regola...</div>;
  }
  if (!isNew && existing.error) {
    return <div className="text-sm text-sell">Errore: {existing.error.message}</div>;
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-navy-50">
          {isNew ? 'Nuova regola' : 'Modifica regola'}
        </h1>
        <button type="button" className="btn-ghost text-sm" onClick={() => nav('/rules')}>
          ← Indietro
        </button>
      </header>

      <div>
        <label className="label" htmlFor="rule-name">Nome</label>
        <input id="rule-name" className="input" value={name}
          onChange={(e) => setName(e.target.value)} required />
      </div>

      <div>
        <label className="label">Preset</label>
        <div className="flex flex-wrap gap-1.5">
          {RULE_PRESETS.map((p) => (
            <button
              key={p.id} type="button" onClick={() => loadPreset(p)}
              className="px-2.5 py-1.5 text-xs bg-navy-800 border border-navy-400
                rounded-md hover:border-orange text-navy-50"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <RuleBuilder value={dsl} onChange={setDsl} />

      <label className="flex items-center gap-2 text-sm text-navy-50">
        <input type="checkbox" checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="accent-orange w-4 h-4" />
        Regola attiva
      </label>

      {errors.length > 0 && (
        <ul className="text-sm text-sell list-disc list-inside">
          {errors.map((er, i) => <li key={i}>{er}</li>)}
        </ul>
      )}

      <div className="flex gap-2">
        <button type="button" className="btn-secondary flex-1" onClick={() => nav('/rules')}>
          Annulla
        </button>
        <button type="submit" className="btn-primary flex-1" disabled={saving}>
          {saving ? 'Salvataggio...' : 'Salva'}
        </button>
      </div>
    </form>
  );
}
