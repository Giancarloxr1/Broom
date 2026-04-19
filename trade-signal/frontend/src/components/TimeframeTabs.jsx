import React from 'react';

const TFS = ['1h', '4h', '1d', '1w'];

/**
 * Selettore timeframe orizzontale (pill tabs).
 * Props:
 *  - value: TF corrente
 *  - onChange: (tf) => void
 *  - options: opzionale, default ['1h','4h','1d','1w']
 */
export default function TimeframeTabs({ value, onChange, options = TFS }) {
  return (
    <div
      role="tablist"
      aria-label="Seleziona timeframe"
      className="inline-flex gap-1 bg-navy-800 p-1 rounded-lg"
    >
      {options.map((tf) => {
        const active = tf === value;
        return (
          <button
            key={tf}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(tf)}
            className={
              'px-3 py-1.5 rounded-md text-sm font-medium min-w-[44px] min-h-[36px] ' +
              (active
                ? 'bg-orange text-white'
                : 'text-navy-100 hover:text-navy-50 hover:bg-navy-700')
            }
          >
            {tf}
          </button>
        );
      })}
    </div>
  );
}
