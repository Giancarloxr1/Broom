import React from 'react';
import { Link } from 'react-router-dom';
import SignalBadge from './SignalBadge.jsx';
import { formatPrice, formatPct } from '../lib/formatters.js';

/**
 * Card riassuntiva di un asset in watchlist.
 * Props:
 *  - asset: { id, symbol, display_name, price, change_24h_pct }
 *  - lastSignals: array segnali recenti [{ id, type, timeframe }]
 *  - onRemove: (asset) => void opzionale
 */
export default function AssetCard({ asset, lastSignals = [], onRemove }) {
  const change = Number(asset.change_24h_pct);
  const changeColor =
    !Number.isFinite(change)
      ? 'text-navy-100'
      : change >= 0
      ? 'text-buy'
      : 'text-sell';

  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-lg font-semibold text-navy-50">
            {asset.display_name || asset.symbol}
          </div>
          <div className="text-xs text-navy-100">{asset.symbol}</div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-navy-50">
            {asset.price != null ? formatPrice(asset.price) : '—'}
          </div>
          <div className={`text-sm font-medium ${changeColor}`}>
            {Number.isFinite(change) ? formatPct(change) : '—'}
          </div>
        </div>
      </div>

      {lastSignals.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {lastSignals.slice(0, 3).map((s) => (
            <SignalBadge key={s.id} type={s.type} size="sm" />
          ))}
          {lastSignals.length > 3 && (
            <span className="text-xs text-navy-100 self-center">
              +{lastSignals.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <Link
          to={`/chart/${asset.symbol}`}
          className="btn-primary flex-1 text-sm"
        >
          Apri
        </Link>
        {onRemove && (
          <button
            type="button"
            onClick={() => onRemove(asset)}
            className="btn-secondary px-3 text-sm"
            aria-label={`Rimuovi ${asset.symbol}`}
          >
            Rimuovi
          </button>
        )}
      </div>
    </div>
  );
}
