// Helper per costruire, validare e stampare in italiano il DSL delle regole.
// Il DSL e' identico a quello consumato dal backend (engine/evaluator.js).
//
// Struttura:
// { type: 'BUY'|'SELL', timeframes: ['1h','4h'], confluence: 'all_tf'|'any_tf'|'n_of_m',
//   confluence_n: 2, cooldown_minutes: 60, logic: <node> }
// Node: { all: [node...] } | { any: [node...] } | condizione foglia
// Foglia: { indicator, field, op, value? , ref? }

export const INDICATORS = [
  { id: 'price', label: 'Prezzo', fields: ['close', 'open', 'high', 'low'] },
  { id: 'ema', label: 'EMA', fields: ['value'], hasPeriod: true },
  { id: 'rsi', label: 'RSI', fields: ['value'] },
  { id: 'macd', label: 'MACD', fields: ['line', 'signal', 'hist'] },
  { id: 'bollinger', label: 'Bollinger Bands', fields: ['upper', 'middle', 'lower'] },
  { id: 'adx', label: 'ADX', fields: ['adx', 'diPlus', 'diMinus'] },
  { id: 'atr', label: 'ATR', fields: ['value'] },
  { id: 'vwap', label: 'VWAP', fields: ['value'] },
  { id: 'stochRsi', label: 'Stoch RSI', fields: ['k', 'd'] },
  { id: 'volume', label: 'Volume', fields: ['value', 'avg'] },
];

export const OPERATORS = [
  { id: '>', label: 'maggiore di' },
  { id: '<', label: 'minore di' },
  { id: '>=', label: 'maggiore o uguale' },
  { id: '<=', label: 'minore o uguale' },
  { id: '==', label: 'uguale a' },
  { id: 'crossUp', label: 'incrocia al rialzo' },
  { id: 'crossDown', label: 'incrocia al ribasso' },
];

export const TIMEFRAMES = ['1h', '4h', '1d', '1w'];

export const CONFLUENCES = [
  { id: 'all_tf', label: 'Tutti i timeframe concordano' },
  { id: 'any_tf', label: 'Almeno un timeframe' },
  { id: 'n_of_m', label: 'Almeno N timeframe su M' },
];

/** Ritorna un DSL vuoto pronto da popolare nel RuleBuilder. */
export function emptyDsl(type = 'BUY') {
  return {
    type,
    timeframes: ['1h'],
    confluence: 'all_tf',
    confluence_n: 1,
    cooldown_minutes: 60,
    logic: { all: [newCondition()] },
  };
}

/** Nuova condizione foglia default (RSI < 30). */
export function newCondition() {
  return { indicator: 'rsi', field: 'value', op: '<', value: 30 };
}

/** Nuovo gruppo logico annidato, default 'all'. */
export function newGroup(op = 'all') {
  return { [op]: [newCondition()] };
}

/** True se un nodo e' un gruppo logico (all/any). */
export function isGroup(node) {
  return node && (Array.isArray(node.all) || Array.isArray(node.any));
}

/** Ritorna l'operatore logico del gruppo: 'all' | 'any'. */
export function groupOp(node) {
  return Array.isArray(node.all) ? 'all' : 'any';
}

/** Validazione minimale: ritorna array di messaggi errore (vuoto se ok). */
export function validateDsl(dsl) {
  const errors = [];
  if (!dsl) return ['DSL mancante'];
  if (!['BUY', 'SELL'].includes(dsl.type)) errors.push('Tipo segnale non valido');
  if (!Array.isArray(dsl.timeframes) || dsl.timeframes.length === 0) {
    errors.push('Seleziona almeno un timeframe');
  }
  if (!CONFLUENCES.find((c) => c.id === dsl.confluence)) {
    errors.push('Modalita confluenza non valida');
  }
  if (dsl.cooldown_minutes == null || dsl.cooldown_minutes < 0) {
    errors.push('Cooldown non valido');
  }
  if (!dsl.logic) errors.push('Logica regola mancante');
  return errors;
}

/** Serializza una condizione foglia in italiano. */
function describeLeaf(leaf) {
  const ind = INDICATORS.find((i) => i.id === leaf.indicator);
  const op = OPERATORS.find((o) => o.id === leaf.op);
  const indLabel = ind ? ind.label : leaf.indicator;
  const fieldLabel = leaf.field && leaf.field !== 'value' ? ` (${leaf.field})` : '';
  const opLabel = op ? op.label : leaf.op;
  const right = leaf.ref ? leaf.ref : leaf.value;
  return `${indLabel}${fieldLabel} ${opLabel} ${right}`;
}

/** Serializza ricorsivamente un nodo DSL in italiano. */
function describeNode(node, depth = 0) {
  if (!node) return '';
  if (!isGroup(node)) return describeLeaf(node);
  const op = groupOp(node);
  const sep = op === 'all' ? ' E ' : ' OPPURE ';
  const parts = node[op].map((c) => describeNode(c, depth + 1));
  const joined = parts.join(sep);
  return depth === 0 ? joined : `(${joined})`;
}

/** Preview testuale in italiano della regola completa. */
export function describeRule(dsl) {
  const errs = validateDsl(dsl);
  if (errs.length) return 'Regola incompleta: ' + errs[0];
  const typeLabel = dsl.type === 'BUY' ? 'SEGNALE DI ACQUISTO' : 'SEGNALE DI VENDITA';
  const tfs = dsl.timeframes.join(', ');
  const confLabel = CONFLUENCES.find((c) => c.id === dsl.confluence)?.label || dsl.confluence;
  const conditions = describeNode(dsl.logic);
  const parts = [
    `Se ${conditions}`,
    `su timeframe ${tfs}`,
    `(${confLabel.toLowerCase()})`,
    `allora ${typeLabel}.`,
    `Cooldown: ${dsl.cooldown_minutes} min.`,
  ];
  return parts.join(' ');
}

/** Preset predefiniti pronti all'uso (RSI, MACD, BB, confluenza). */
export const RULE_PRESETS = [
  {
    id: 'rsi-oversold',
    name: 'RSI Oversold 1h',
    dsl: {
      type: 'BUY',
      timeframes: ['1h'],
      confluence: 'any_tf',
      confluence_n: 1,
      cooldown_minutes: 60,
      logic: { all: [{ indicator: 'rsi', field: 'value', op: '<', value: 30 }] },
    },
  },
  {
    id: 'macd-cross-daily',
    name: 'MACD Cross Daily',
    dsl: {
      type: 'BUY',
      timeframes: ['1d'],
      confluence: 'any_tf',
      confluence_n: 1,
      cooldown_minutes: 240,
      logic: { all: [{ indicator: 'macd', field: 'hist', op: 'crossUp', value: 0 }] },
    },
  },
  {
    id: 'bb-squeeze',
    name: 'Bollinger Squeeze breakout',
    dsl: {
      type: 'BUY',
      timeframes: ['4h'],
      confluence: 'any_tf',
      confluence_n: 1,
      cooldown_minutes: 120,
      logic: {
        all: [
          { indicator: 'price', field: 'close', op: '>', ref: 'bollinger.upper' },
          { indicator: 'volume', field: 'value', op: '>', ref: 'volume.avg' },
        ],
      },
    },
  },
  {
    id: 'classic-confluence',
    name: 'Confluenza classica multi-TF',
    dsl: {
      type: 'BUY',
      timeframes: ['1h', '4h'],
      confluence: 'all_tf',
      confluence_n: 2,
      cooldown_minutes: 90,
      logic: {
        all: [
          { indicator: 'rsi', field: 'value', op: '<', value: 40 },
          { indicator: 'macd', field: 'hist', op: 'crossUp', value: 0 },
          { indicator: 'price', field: 'close', op: '>', ref: 'ema200' },
        ],
      },
    },
  },
  {
    id: 'rsi-overbought-sell',
    name: 'RSI Overbought (SELL)',
    dsl: {
      type: 'SELL',
      timeframes: ['1h', '4h'],
      confluence: 'all_tf',
      confluence_n: 2,
      cooldown_minutes: 60,
      logic: { all: [{ indicator: 'rsi', field: 'value', op: '>', value: 70 }] },
    },
  },
];
