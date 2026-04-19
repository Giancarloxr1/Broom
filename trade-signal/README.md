# Trade Signal

Piattaforma personale di trading signal crypto con indicatori multi-timeframe, Smart Mode a confluenza pesata, tracker portafoglio con P/L, notifiche Telegram e frontend PWA installabile da telefono.

## Stack
- **Backend**: Node.js + Express + PostgreSQL, scheduler `node-cron`, `node-telegram-bot-api`, indicatori in JS puro
- **Frontend**: React + Vite + Tailwind + `lightweight-charts` (TradingView), PWA via `vite-plugin-pwa`
- **Dati**: Binance API pubblica (no API key richiesta per dati pubblici)

## Setup rapido

### 1. PostgreSQL
Crea un database vuoto `trade_signal` e prendi nota del `DATABASE_URL`.

### 2. Bot Telegram
1. Apri Telegram, cerca `@BotFather`, invia `/newbot`, segui le istruzioni
2. Copia il token restituito (sarà `TELEGRAM_BOT_TOKEN`)
3. Invia un messaggio qualsiasi al tuo bot
4. Apri `https://api.telegram.org/bot<TOKEN>/getUpdates` nel browser, copia `chat.id` (sarà `TELEGRAM_CHAT_ID`)

### 3. Backend
```bash
cd backend
cp .env.example .env      # edita DATABASE_URL, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
npm install
npm run migrate            # crea tabelle e inserisce preset
npm run dev                # avvia su :4100
```

### 4. Frontend
```bash
cd frontend
cp .env.example .env       # default VITE_API_BASE=http://localhost:4100 va bene in locale
npm install
npm run dev                # avvia su :5173
```

Apri `http://localhost:5173` dal browser del telefono (stessa rete WiFi del PC) o dal desktop.

## Installazione come PWA
1. Apri l'app nel browser del telefono (Chrome/Safari)
2. Menu → "Aggiungi alla schermata Home"
3. L'icona compare sulla home; si apre a schermo intero come una app nativa

## Funzionalità
- **Watchlist** asset crypto (es. BTCUSDT, ETHUSDT) — aggiungi/rimuovi
- **Indicatori** configurabili: MACD, RSI, EMA, Volume, Bollinger Bands, ADX, ATR, VWAP, Stochastic RSI — ognuno ON/OFF con parametri personalizzabili
- **Timeframes**: 1h, 4h, 1d, 1w
- **Smart Mode**: motore che combina automaticamente gli indicatori attivi con pesi configurabili; opzionale backtest su dati storici per tarare i pesi
- **Regole manuali** con RuleBuilder visuale (no JSON a mano)
- **Segnali** BUY/SELL con notifiche push su Telegram
- **Portafoglio**: capitale iniziale e corrente, equity line, P/L assoluto e percentuale
- **Trade**: apertura da segnale, chiusura con prezzo di vendita, calcolo automatico P/L

## Struttura
```
trade-signal/
├── backend/        # API + scheduler + Telegram + engine
└── frontend/       # PWA React + Tailwind + charts
```

## Comandi utili
```bash
# Backend
npm run dev        # watch mode
npm run migrate    # (re)applica schema
npm start          # produzione

# Frontend
npm run dev
npm run build      # build PWA in dist/
npm run preview
```

## Env vars

### Backend (`backend/.env`)
| Variabile | Esempio | Descrizione |
|---|---|---|
| `DATABASE_URL` | `postgres://user:pass@localhost:5432/trade_signal` | PostgreSQL connection string |
| `PORT` | `4100` | Porta Express |
| `TELEGRAM_BOT_TOKEN` | `123:ABC...` | Token bot da @BotFather |
| `TELEGRAM_CHAT_ID` | `987654321` | Tuo chat_id personale |
| `SCAN_INTERVAL_CRON` | `*/5 * * * *` | Cron del scheduler |
| `BINANCE_BASE_URL` | `https://api.binance.com` | Base URL Binance |

### Frontend (`frontend/.env`)
| Variabile | Esempio |
|---|---|
| `VITE_API_BASE` | `http://localhost:4100` |

## Note
- Progetto per **uso personale**, non scalabile, single-user
- Nessuna autenticazione (accesso locale/rete privata)
- Nessuna esecuzione ordini reali: solo segnali e tracking manuale dei trade
- Binance API pubblica, rate limit 1200 req/min — più che sufficiente
