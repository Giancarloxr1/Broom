import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useApi from '../hooks/useApi.js';
import { api } from '../api/client.js';
import { useToast } from '../components/ToastContext.jsx';
import { describeRule } from '../lib/ruleDsl.js';

/**
 * Lista regole manuali. Azioni: toggle enable, edit, delete, duplicate.
 */
export default function Rules() {
  const rules = useApi('/api/rules');
  const { showToast } = useToast();
  const nav = useNavigate();

  /** Toggle enabled via PUT /api/rules/:id. */
  async function toggle(rule) {
    try {
      await api.put(`/api/rules/${rule.id}`, { ...rule, enabled: !rule.enabled });
      showToast(rule.enabled ? 'Regola disabilitata' : 'Regola abilitata', 'success');
      rules.refetch();
    } catch (e) { showToast(e.message, 'error'); }
  }

  /** Elimina una regola (con conferma). */
  async function del(rule) {
    if (!confirm(`Eliminare la regola "${rule.name}"?`)) return;
    try {
      await api.del(`/api/rules/${rule.id}`);
      showToast('Regola eliminata', 'success');
      rules.refetch();
    } catch (e) { showToast(e.message, 'error'); }
  }

  /** Duplica una regola (POST con "Copia di ..."). */
  async function duplicate(rule) {
    try {
      await api.post('/api/rules', { ...rule, id: undefined, name: `Copia di ${rule.name}` });
      showToast('Regola duplicata', 'success');
      rules.refetch();
    } catch (e) { showToast(e.message, 'error'); }
  }

  return (
    <div className="flex flex-col gap-3">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-navy-50">Regole</h1>
        <button className="btn-primary text-sm" onClick={() => nav('/rules/new')}>
          + Nuova regola
        </button>
      </header>

      {rules.loading && <div className="text-sm text-navy-100">Caricamento...</div>}
      {rules.error && <div className="text-sm text-sell">Errore: {rules.error.message}</div>}
      {rules.data && rules.data.length === 0 && (
        <div className="card text-sm text-navy-100">
          Nessuna regola manuale. Creane una oppure usa la Smart Mode.
          <Link to="/rules/new" className="block mt-2 btn-primary">
            Crea prima regola
          </Link>
        </div>
      )}

      {rules.data && rules.data.map((r) => (
        <div key={r.id} className="card flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-navy-50">{r.name}</span>
                <span className={
                  'text-[10px] px-1.5 py-0.5 rounded font-semibold ' +
                  (r.type === 'BUY' ? 'bg-buy text-white' : 'bg-sell text-white')
                }>
                  {r.type}
                </span>
                {!r.enabled && (
                  <span className="text-[10px] text-navy-100 uppercase">disattiva</span>
                )}
              </div>
              <div className="text-xs text-navy-100 mt-1">
                {describeRule(r.dsl)}
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button className="btn-secondary text-xs py-1.5 min-h-0" onClick={() => toggle(r)}>
              {r.enabled ? 'Disattiva' : 'Attiva'}
            </button>
            <Link to={`/rules/${r.id}`} className="btn-secondary text-xs py-1.5 min-h-0">
              Modifica
            </Link>
            <button className="btn-secondary text-xs py-1.5 min-h-0" onClick={() => duplicate(r)}>
              Duplica
            </button>
            <button className="btn-secondary text-xs py-1.5 min-h-0" onClick={() => del(r)}>
              Elimina
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
