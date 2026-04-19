import React from 'react';

/**
 * Barra visuale per Smart Mode score [-1..+1] con cursore colorato.
 * Props:
 *  - score: number compreso fra -1 e +1
 *  - thresholdBuy: soglia (0..1) per BUY (default 0.6)
 *  - thresholdSell: soglia (0..1) per SELL (default 0.6)
 *  - label: testo opzionale sotto alla barra
 */
export default function SmartScoreBar({
  score = 0,
  thresholdBuy = 0.6,
  thresholdSell = 0.6,
  label,
}) {
  const clamped = Math.max(-1, Math.min(1, Number(score) || 0));
  // Percentuale cursore: -1 -> 0%, 0 -> 50%, +1 -> 100%
  const cursorPct = (clamped + 1) * 50;
  const buyPct = (1 - thresholdBuy) * 50; // larghezza zona buy da destra
  const sellPct = (1 - thresholdSell) * 50; // larghezza zona sell da sinistra

  let status = 'NEUTRO';
  let statusColor = 'text-navy-100';
  if (clamped >= thresholdBuy) {
    status = 'BUY';
    statusColor = 'text-buy';
  } else if (clamped <= -thresholdSell) {
    status = 'SELL';
    statusColor = 'text-sell';
  }

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-navy-100 mb-1.5">
        <span>SELL</span>
        <span className={`font-bold ${statusColor}`}>
          {status} ({clamped.toFixed(2)})
        </span>
        <span>BUY</span>
      </div>
      <div className="relative h-5 rounded-full bg-navy-700 overflow-hidden">
        {/* Zone colorate */}
        <div
          className="absolute left-0 top-0 h-full bg-sell/30"
          style={{ width: `${sellPct}%` }}
        />
        <div
          className="absolute right-0 top-0 h-full bg-buy/30"
          style={{ width: `${buyPct}%` }}
        />
        {/* Linea centrale */}
        <div className="absolute top-0 left-1/2 w-px h-full bg-navy-400" />
        {/* Cursore */}
        <div
          className="absolute top-0 h-full w-1.5 bg-orange rounded-sm shadow"
          style={{ left: `calc(${cursorPct}% - 3px)` }}
          aria-label={`Score ${clamped.toFixed(2)}`}
        />
      </div>
      {label && <div className="text-xs text-navy-100 mt-1.5">{label}</div>}
    </div>
  );
}
