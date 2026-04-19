// src/telegram/formatter.js - Formattazione messaggi alert Telegram

function emojiFor(type) {
  return type === 'BUY' ? '🟢' : '🔴';
}

function fmtPrice(p) {
  const n = Number(p);
  if (!Number.isFinite(n)) return '-';
  if (n >= 1000) return n.toLocaleString('it-IT', { maximumFractionDigits: 2 });
  if (n >= 1) return n.toFixed(4);
  return n.toFixed(8);
}

function fmtScore(s) {
  if (s == null) return '';
  const n = Number(s);
  if (!Number.isFinite(n)) return '';
  return (n >= 0 ? '+' : '') + n.toFixed(2);
}

function concordantIndicators(snapshot, type) {
  if (!snapshot || typeof snapshot !== 'object') return [];
  const wanted = type === 'BUY' ? 1 : -1;
  const lines = [];
  for (const [name, data] of Object.entries(snapshot)) {
    if (!data || typeof data !== 'object') continue;
    if (typeof data.vote === 'number' && (data.vote > 0) === (wanted > 0)) {
      lines.push(name);
    }
  }
  return lines;
}

/**
 * Formatta il messaggio alert.
 * @param {object} signal riga signals
 * @param {object} asset riga assets
 */
export function formatAlert(signal, asset) {
  const emoji = emojiFor(signal.type);
  const symbol = asset?.symbol || `asset#${signal.asset_id}`;
  const name = asset?.display_name ? ` (${asset.display_name})` : '';
  const score = fmtScore(signal.score);
  const scoreLine = score ? `\n📊 Score: ${score}` : '';
  const indicators = concordantIndicators(signal.snapshot_indicators, signal.type);
  const indLine = indicators.length
    ? `\n🧩 Indicatori concordi: ${indicators.join(', ')}`
    : '';
  const source = signal.source === 'smart' ? 'Smart Mode' : 'Regola manuale';
  return [
    `${emoji} Segnale ${signal.type} — ${symbol}${name}`,
    `⏱ Timeframe: ${signal.timeframe}`,
    `💶 Prezzo: ${fmtPrice(signal.price)}`,
    `🤖 Origine: ${source}`,
    scoreLine,
    indLine
  ].filter(Boolean).join('\n');
}

export function formatStatus({ lastScanAt, todaySignals }) {
  const when = lastScanAt ? new Date(lastScanAt).toLocaleString('it-IT') : 'mai';
  return [
    'Stato Trade Signal:',
    `• Ultimo scan: ${when}`,
    `• Segnali oggi: ${todaySignals ?? 0}`
  ].join('\n');
}

export default { formatAlert, formatStatus };
