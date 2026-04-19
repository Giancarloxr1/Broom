import React from 'react';
import {
  INDICATORS, OPERATORS, TIMEFRAMES, CONFLUENCES,
  newCondition, newGroup, isGroup, groupOp, describeRule,
} from '../lib/ruleDsl.js';

/**
 * Builder visuale per DSL regole.
 * Props:
 *  - value: DSL corrente (vedi lib/ruleDsl.js)
 *  - onChange: (nuovoDsl) => void
 * Stato interno minimale: tutto in value.
 */
export default function RuleBuilder({ value, onChange }) {
  /** Aggiorna un campo top-level (type, confluence, cooldown, tf). */
  function patch(patchObj) {
    onChange({ ...value, ...patchObj });
  }

  /** Aggiorna il nodo logic sostituendolo con `newLogic`. */
  function setLogic(newLogic) {
    onChange({ ...value, logic: newLogic });
  }

  /** Toggle di un timeframe nella lista. */
  function toggleTf(tf) {
    const exists = value.timeframes.includes(tf);
    const next = exists
      ? value.timeframes.filter((t) => t !== tf)
      : [...value.timeframes, tf];
    patch({ timeframes: next.length ? next : [tf] });
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="label">Tipo segnale</label>
        <div className="flex gap-2">
          {['BUY', 'SELL'].map((t) => (
            <button
              key={t} type="button" onClick={() => patch({ type: t })}
              className={
                'flex-1 py-2.5 rounded-lg font-semibold min-h-[44px] ' +
                (value.type === t
                  ? t === 'BUY' ? 'bg-buy text-white' : 'bg-sell text-white'
                  : 'bg-navy-800 border border-navy-400 text-navy-100')
              }
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Timeframes</label>
        <div className="flex flex-wrap gap-1.5">
          {TIMEFRAMES.map((tf) => {
            const active = value.timeframes.includes(tf);
            return (
              <button
                key={tf} type="button" onClick={() => toggleTf(tf)}
                className={
                  'px-3 py-1.5 rounded-full text-sm min-h-[36px] ' +
                  (active ? 'bg-orange text-white' : 'bg-navy-800 border border-navy-400 text-navy-100')
                }
              >
                {tf}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label">Confluenza</label>
          <select className="input" value={value.confluence}
            onChange={(e) => patch({ confluence: e.target.value })}>
            {CONFLUENCES.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Cooldown (min)</label>
          <input className="input" type="number" min="0"
            value={value.cooldown_minutes}
            onChange={(e) => patch({ cooldown_minutes: Number(e.target.value) })} />
        </div>
      </div>

      {value.confluence === 'n_of_m' && (
        <div>
          <label className="label">N timeframe richiesti</label>
          <input className="input" type="number" min="1" max={value.timeframes.length}
            value={value.confluence_n || 1}
            onChange={(e) => patch({ confluence_n: Number(e.target.value) })} />
        </div>
      )}

      <div>
        <label className="label">Logica condizioni</label>
        <GroupNode node={value.logic} onChange={setLogic} depth={0} />
      </div>

      <div className="card bg-navy-800 border border-navy-400">
        <div className="text-xs text-navy-100 mb-1 font-medium">Anteprima regola</div>
        <div className="text-sm text-navy-50">{describeRule(value)}</div>
      </div>
    </div>
  );
}

/**
 * Nodo gruppo (all / any) ricorsivo.
 * Props: node, onChange, depth
 */
function GroupNode({ node, onChange, depth }) {
  const op = groupOp(node);
  const children = node[op];

  /** Cambia operatore mantenendo i figli. */
  function changeOp(nextOp) {
    onChange({ [nextOp]: children });
  }

  /** Aggiorna il figlio i-esimo. */
  function updateChild(i, next) {
    const arr = [...children];
    arr[i] = next;
    onChange({ [op]: arr });
  }

  /** Aggiunge una condizione foglia. */
  function addCondition() {
    onChange({ [op]: [...children, newCondition()] });
  }

  /** Aggiunge un sotto-gruppo nidificato. */
  function addSubgroup() {
    onChange({ [op]: [...children, newGroup(op === 'all' ? 'any' : 'all')] });
  }

  /** Rimuove il figlio i-esimo (minimo 1). */
  function removeChild(i) {
    if (children.length <= 1) return;
    const arr = children.filter((_, idx) => idx !== i);
    onChange({ [op]: arr });
  }

  return (
    <div className={'rounded-lg p-2.5 ' + (depth === 0 ? 'bg-navy-800' : 'bg-navy-600 border border-navy-400 mt-2')}>
      <div className="flex items-center gap-2 mb-2">
        <select className="input w-auto text-sm py-1.5 min-h-0"
          value={op} onChange={(e) => changeOp(e.target.value)}>
          <option value="all">TUTTI (E)</option>
          <option value="any">QUALSIASI (OPPURE)</option>
        </select>
        <span className="text-xs text-navy-100">
          {op === 'all' ? 'Tutte le condizioni vere' : 'Almeno una vera'}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {children.map((child, i) => (
          <div key={i} className="flex items-start gap-1">
            <div className="flex-1">
              {isGroup(child) ? (
                <GroupNode node={child} depth={depth + 1}
                  onChange={(n) => updateChild(i, n)} />
              ) : (
                <LeafNode leaf={child} onChange={(n) => updateChild(i, n)} />
              )}
            </div>
            <button type="button" onClick={() => removeChild(i)}
              className="text-navy-100 hover:text-sell px-2 text-lg" aria-label="Rimuovi">×</button>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        <button type="button" className="btn-secondary text-xs py-1.5 min-h-0"
          onClick={addCondition}>+ condizione</button>
        <button type="button" className="btn-secondary text-xs py-1.5 min-h-0"
          onClick={addSubgroup}>+ gruppo</button>
      </div>
    </div>
  );
}

/** Condizione foglia: 4 select (indicatore, campo, operatore, valore/riferimento). */
function LeafNode({ leaf, onChange }) {
  const indDef = INDICATORS.find((i) => i.id === leaf.indicator) || INDICATORS[0];
  const isCross = leaf.op === 'crossUp' || leaf.op === 'crossDown';

  /** Aggiorna un campo della foglia. */
  function patch(p) { onChange({ ...leaf, ...p }); }

  /** Switcha tra valore numerico e riferimento (es. ema200). */
  function toggleMode(mode) {
    if (mode === 'ref') patch({ value: undefined, ref: leaf.ref || 'ema200' });
    else patch({ ref: undefined, value: leaf.value ?? 0 });
  }

  return (
    <div className="grid grid-cols-2 gap-1.5">
      <select className="input text-sm py-1.5 min-h-0"
        value={leaf.indicator}
        onChange={(e) => {
          const nd = INDICATORS.find((i) => i.id === e.target.value);
          patch({ indicator: e.target.value, field: nd.fields[0] });
        }}>
        {INDICATORS.map((i) => <option key={i.id} value={i.id}>{i.label}</option>)}
      </select>
      <select className="input text-sm py-1.5 min-h-0"
        value={leaf.field || indDef.fields[0]}
        onChange={(e) => patch({ field: e.target.value })}>
        {indDef.fields.map((f) => <option key={f} value={f}>{f}</option>)}
      </select>
      <select className="input text-sm py-1.5 min-h-0"
        value={leaf.op} onChange={(e) => patch({ op: e.target.value })}>
        {OPERATORS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
      <div className="flex gap-1">
        <select className="input text-sm py-1.5 min-h-0 w-20"
          value={leaf.ref ? 'ref' : 'val'}
          onChange={(e) => toggleMode(e.target.value)}>
          <option value="val">num</option>
          <option value="ref">ref</option>
        </select>
        {leaf.ref !== undefined ? (
          <input className="input text-sm py-1.5 min-h-0 flex-1" placeholder="ema200"
            value={leaf.ref || ''} onChange={(e) => patch({ ref: e.target.value })} />
        ) : (
          <input className="input text-sm py-1.5 min-h-0 flex-1" type="number" step="any"
            value={leaf.value ?? 0} onChange={(e) => patch({ value: Number(e.target.value) })}
            disabled={isCross && leaf.op === 'crossUp' && false} />
        )}
      </div>
    </div>
  );
}
