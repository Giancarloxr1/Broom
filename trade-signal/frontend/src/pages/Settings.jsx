import React, { useEffect, useState } from 'react';
import useApi from '../hooks/useApi.js';
import { api } from '../api/client.js';
import { useToast } from '../components/ToastContext.jsx';

/**
 * Impostazioni: Telegram ON/OFF, chat_id, test, scan interval cron.
 * Include guida inline per ottenere TELEGRAM_BOT_TOKEN e chat_id.
 */
export default function Settings() {
  const settings = useApi('/api/settings');
  const [form, setForm] = useState({
    telegram_enabled: false, telegram_chat_id: '', scan_interval_cron: '*/5 * * * *',
  });
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (settings.data) {
      setForm({
        telegram_enabled: !!settings.data.telegram_enabled,
        telegram_chat_id: settings.data.telegram_chat_id || '',
        scan_interval_cron: settings.data.scan_interval_cron || '*/5 * * * *',
      });
    }
  }, [settings.data]);

  /** Salva PUT /api/settings. */
  async function save() {
    setSaving(true);
    try {
      await api.put('/api/settings', form);
      showToast('Impostazioni salvate', 'success');
    } catch (e) { showToast(e.message, 'error'); }
    finally { setSaving(false); }
  }

  /** Invia messaggio di test a Telegram. */
  async function sendTest() {
    setTesting(true);
    try {
      await api.post('/api/test-telegram');
      showToast('Messaggio di test inviato', 'success');
    } catch (e) {
      // Fallback se endpoint non esiste: dai istruzioni manuali.
      showToast('Endpoint non disponibile, manda /start al bot', 'warning');
    } finally { setTesting(false); }
  }

  if (settings.loading) return <div className="text-sm text-navy-100">Caricamento...</div>;

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-xl font-bold text-navy-50">Opzioni</h1>
      </header>

      <section className="card flex flex-col gap-3">
        <h2 className="font-semibold text-navy-50">Telegram</h2>
        <label className="flex items-center justify-between text-sm text-navy-50">
          <span>Notifiche attive</span>
          <button
            type="button" role="switch" aria-checked={form.telegram_enabled}
            onClick={() => setForm({ ...form, telegram_enabled: !form.telegram_enabled })}
            className={
              'relative inline-flex h-7 w-12 rounded-full transition-colors ' +
              (form.telegram_enabled ? 'bg-orange' : 'bg-navy-400')
            }
          >
            <span className={
              'inline-block h-5 w-5 bg-white rounded-full mt-1 transform transition-transform ' +
              (form.telegram_enabled ? 'translate-x-6' : 'translate-x-1')
            } />
          </button>
        </label>
        <div>
          <label className="label">Chat ID Telegram</label>
          <input className="input" value={form.telegram_chat_id}
            placeholder="es. 123456789"
            onChange={(e) => setForm({ ...form, telegram_chat_id: e.target.value })} />
        </div>
        <button className="btn-secondary" onClick={sendTest} disabled={testing}>
          {testing ? 'Invio...' : 'Invia messaggio di test'}
        </button>
      </section>

      <section className="card flex flex-col gap-3">
        <h2 className="font-semibold text-navy-50">Scheduler</h2>
        <div>
          <label className="label">Cron scan interval</label>
          <input className="input font-mono" value={form.scan_interval_cron}
            onChange={(e) => setForm({ ...form, scan_interval_cron: e.target.value })} />
          <div className="text-xs text-navy-100 mt-1">
            Sintassi cron standard. Default: <code>*/5 * * * *</code> (ogni 5 min).
          </div>
        </div>
      </section>

      <section className="card">
        <h2 className="font-semibold text-navy-50 mb-2">Come collegare Telegram</h2>
        <ol className="text-xs text-navy-100 list-decimal list-inside space-y-1">
          <li>Apri Telegram e cerca <b>@BotFather</b>.</li>
          <li>Scrivi <code>/newbot</code> e segui le istruzioni: otterrai un <b>TOKEN</b>.</li>
          <li>Incolla il TOKEN nel file <code>backend/.env</code> come <code>TELEGRAM_BOT_TOKEN</code> e riavvia il backend.</li>
          <li>Manda <code>/start</code> al tuo bot su Telegram per avviarlo.</li>
          <li>Per il chat_id: apri <code>https://api.telegram.org/bot&lt;TOKEN&gt;/getUpdates</code> dopo aver scritto al bot, copia il numero <code>chat.id</code>.</li>
          <li>Incolla il chat_id qui sopra, salva e manda un messaggio di test.</li>
        </ol>
      </section>

      <button className="btn-primary" onClick={save} disabled={saving}>
        {saving ? 'Salvataggio...' : 'Salva impostazioni'}
      </button>
    </div>
  );
}
