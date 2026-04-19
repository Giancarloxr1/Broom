# Trade Signal — Frontend

PWA React + Vite + Tailwind CSS per il progetto Trade Signal.

## Setup

```bash
cp .env.example .env   # VITE_API_BASE punta al backend (default http://localhost:4100)
npm install
npm run dev            # avvia su http://localhost:5173
```

Il build di produzione: `npm run build` → `dist/`.

## Stack
- React 18 + Vite
- Tailwind CSS (palette Navy `#1A1A2E` + Orange `#FF5733`)
- React Router v6
- `lightweight-charts` (TradingView) per candele, overlay ed equity line
- `vite-plugin-pwa` per installabilita e cache offline

## Struttura
```
src/
  api/client.js        wrapper fetch con base URL env
  hooks/               useApi (GET + stato), useInterval (polling)
  lib/                 formatters + DSL helper regole
  components/          tutti i pezzi UI riusabili (max 300 righe cad.)
  pages/               una pagina per route, stati loading/error/empty
  App.jsx              router
  main.jsx             entry + registerSW
```

## Icone PWA (placeholder)
Le icone `public/icon-192.png` e `public/icon-512.png` non sono incluse
nel repo (gli asset binari vanno generati dall'utente). Soluzioni:

1. Copia qualunque PNG quadrato 192x192 e 512x512 nei due percorsi.
2. Oppure genera placeholder con un tool online e salvali in `public/`.
3. Se i file mancano, `vite-plugin-pwa` usa un'icona di fallback e la PWA
   rimane installabile — ma sulla home apparira l'icona generica.

Un `favicon.ico` minimale si puo copiare da qualunque progetto Vite.

## Note
- Tutte le stringhe UI sono in italiano.
- Mobile-first: bottom tab bar fissa, tap target >= 44px.
- Nessun file sorgente supera le 300 righe.
