# Memorandum — Avvio progetto definitivo (broom)

Documento di riferimento per la **fase finale / start progetto definitivo**, da usare quando si esce dall’MVP (demo con dati mock nel frontend).  
*Creato come promemoria; aggiornare questo file man mano che le decisioni si consolidano.*

---

## 1. Contesto MVP attuale

- Catalogo auto (`CARS`) e offerte sono **in-memory / hardcoded** in `src/App.js`.
- Flussi dealer, pratiche, preventivi e notifiche sono in gran parte **simulati** (mock).
- Obiettivo della fase definitiva: **dati reali**, **persistenza**, **ruoli** (cliente / dealer / admin) e **processi** affidabili.

---

## 2. Catalogo e dati veicoli (da implementare)

| Attività | Note |
|----------|------|
| **Spostare il catalogo fuori dal codice** | Es. `public/data/cars.json` o endpoint `GET /api/vehicles`; il frontend fa `fetch` / import in build. |
| **Fonte dati** | Valutare dataset strutturati (es. repository open tipo *open-vehicle-db*) o provider commerciali (API/CSV) per marche/modelli; **non** pretendere “tutto il web” in un solo file statico. |
| **Aggiornamento periodico** | Job schedulato (cron) o pipeline che rigenera il catalogo da API/fornitore; gestione **cache** (browser/CDN). |
| **Upload / inserimento da dealer** | Pannello dealer che crea o aggiorna **offerte** (marca, modello, versione, canone, disponibilità). Persistenza su **database**, non solo JSON statico. |
| **Moderazione (opzionale ma consigliata)** | Stati tipo *bozza* / *in revisione* / *pubblicata* per evitare cataloghi incoerenti. |

---

## 3. Backend, API e persistenza

| Attività | Note |
|----------|------|
| **Scelta stack** | Es. Node (Express/Fastify), Supabase, Firebase, o altro; serve almeno: DB, auth, API REST/GraphQL. |
| **Entità minime** | Utenti, dealer, veicolo/offerta, pratica richiesta, preventivo, documenti (meta), log eventi. |
| **Sostituire i mock** | Ogni flusso oggi “finto” va mappato a chiamate API reali (invio richiesta, notifiche, dashboard dealer, ecc.). |

---

## 4. Autenticazione e autorizzazioni

| Attività | Note |
|----------|------|
| **Cliente** | Accesso pratiche (es. email + codice pratica **e/o** account). |
| **Dealer** | Registrazione/onboarding, profilo azienda, permessi su proprie offerte e risposte. |
| **Admin (se previsto)** | Approvazione dealer, moderazione catalogo, supporto. |

---

## 5. Integrazioni e operatività

| Attività | Note |
|----------|------|
| **Email / SMS** | Inviare codice pratica e aggiornamenti offerte (provider tipo SendGrid, Twilio, ecc.). |
| **Pagamenti** | Se previsti abbonamenti dealer o servizi a pagamento: Stripe (o equivalente), allineamento con fatturazione. |
| **Privacy e GDPR** | Base giuridica, conservazione dati, informative, export/cancellazione se necessario. |
| **Ambiente e deploy** | CI/CD, staging/produzione, variabili d’ambiente per chiavi API e DB. |

---

## 6. Frontend (evoluzione da MVP)

- Separazione netta **UI / servizi**: client che consuma solo API, non business logic “sola” nel browser per dati sensibili.
- **Errori e stati** di caricamento su tutte le liste (catalogo, pratiche, offerte).
- **Accessibilità e test** base su flussi critici (filtri, richiesta preventivo, accesso pratica).

---

## 7. Checklist “day one” fase definitiva (sintesi)

- [ ] Definire fornitore dati veicoli (dataset/API) e strategia aggiornamento.
- [ ] Progettare schema DB e API (offerte, pratiche, utenti).
- [ ] Implementare auth e ruoli (cliente / dealer / admin se serve).
- [ ] Migrare catalogo da `App.js` a storage + API; form dealer per nuovi modelli/offerte.
- [ ] Sostituire mock (MOCK_OFFERS, richieste dealer demo, ecc.) con persistenza reale.
- [ ] Email/SMS e policy privacy; logging e monitoring minimi.
- [ ] Deploy, backup DB, piani incident response leggeri.

---

## 8. Riferimenti discussi (non vincolanti)

- File **JSON**: formato utile per prototipo o export; in produzione il catalogo “vivo” tipicamente viene da **backend/DB**.
- **MVP**: versione attuale orientata a demo; la fase definitiva implementa quanto sopra in modo incrementale prioritizzato.

---

*Ultimo aggiornamento: promemoria iniziale su richiesta — integrare date, owner e priorità quando il progetto definitivo parte.*
