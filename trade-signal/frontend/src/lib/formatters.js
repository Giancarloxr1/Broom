// Helper di formattazione localizzati in italiano.

/**
 * Formatta un prezzo con decimali adattivi in base alla magnitudo.
 * Grandi (>=1000) 2 decimali, medi (>=1) 4, piccoli 6, micro 8.
 */
export function formatPrice(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  const abs = Math.abs(n);
  let digits = 2;
  if (abs < 1) digits = 6;
  if (abs < 0.01) digits = 8;
  if (abs >= 1 && abs < 1000) digits = 4;
  return n.toLocaleString('it-IT', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

/** Formatta una percentuale con segno esplicito. */
export function formatPct(value, digits = 2) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  const sign = n > 0 ? '+' : '';
  return `${sign}${n.toFixed(digits)}%`;
}

/** Formatta un importo in EUR (default). */
export function formatMoney(value, currency = 'EUR') {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString('it-IT', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  });
}

/** Compatta numeri grandi: 1234567 -> 1,2M. */
export function formatCompact(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return Intl.NumberFormat('it-IT', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(n);
}

/** Data italiana breve: 19/04/2026 14:32. */
export function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Solo data italiana. */
export function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/** Solo orario HH:MM. */
export function formatTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
}

/** Input datetime-local corrente (YYYY-MM-DDTHH:MM) per default form. */
export function nowLocalInput() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
