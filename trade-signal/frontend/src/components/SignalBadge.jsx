import React from 'react';

/**
 * Badge visuale per un segnale BUY o SELL.
 * Props:
 *  - type: 'BUY' | 'SELL'
 *  - size: 'sm' | 'md' (default md)
 *  - className: eventuale extra (posizionamento)
 */
export default function SignalBadge({ type, size = 'md', className = '' }) {
  const isBuy = type === 'BUY';
  const base = isBuy ? 'bg-buy text-white' : 'bg-sell text-white';
  const dims =
    size === 'sm'
      ? 'text-[10px] px-1.5 py-0.5 rounded'
      : 'text-xs px-2 py-1 rounded-md font-semibold';
  const emoji = isBuy ? '🟢' : '🔴';
  const label = isBuy ? 'BUY' : 'SELL';
  return (
    <span className={`inline-flex items-center gap-1 ${base} ${dims} ${className}`}>
      <span aria-hidden>{emoji}</span>
      <span>{label}</span>
    </span>
  );
}
