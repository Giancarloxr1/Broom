import React from 'react';

/**
 * Switch ON/OFF con label e descrizione.
 * Props:
 *  - id: id unico per associare label
 *  - label: testo principale
 *  - description: testo secondario opzionale
 *  - checked: bool
 *  - onChange: (bool) => void
 */
export default function IndicatorToggle({ id, label, description, checked, onChange }) {
  return (
    <label
      htmlFor={id}
      className="flex items-start justify-between gap-3 py-2 cursor-pointer"
    >
      <div className="flex-1">
        <div className="font-medium text-navy-50">{label}</div>
        {description && (
          <div className="text-xs text-navy-100 mt-0.5">{description}</div>
        )}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={
          'relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors ' +
          (checked ? 'bg-orange' : 'bg-navy-400')
        }
      >
        <span
          aria-hidden
          className={
            'inline-block h-5 w-5 bg-white rounded-full shadow transform transition-transform ' +
            (checked ? 'translate-x-6' : 'translate-x-1') +
            ' mt-1'
          }
        />
      </button>
    </label>
  );
}
