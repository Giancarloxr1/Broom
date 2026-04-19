// Wrapper fetch verso il backend Trade Signal.
// Base URL da VITE_API_BASE (in dev il proxy Vite redirige /api -> localhost:4100).
const BASE = import.meta.env.VITE_API_BASE || '';

/**
 * Costruisce l'URL assoluto appendendo il path all'API base.
 * Se BASE e' vuoto usiamo path relativo (proxy dev).
 */
function buildUrl(path) {
  if (!path.startsWith('/')) path = '/' + path;
  return BASE ? BASE + path : path;
}

/**
 * Esegue una fetch uniforme, restituisce JSON o lancia Error con status+messaggio.
 * @param {string} method verbo HTTP
 * @param {string} path percorso es. "/api/watchlist"
 * @param {any} body payload JSON opzionale
 */
async function request(method, path, body) {
  const init = {
    method,
    headers: { Accept: 'application/json' },
  };
  if (body !== undefined) {
    init.headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }
  let res;
  try {
    res = await fetch(buildUrl(path), init);
  } catch (netErr) {
    throw new Error('Rete non raggiungibile: ' + netErr.message);
  }
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json().catch(() => null) : await res.text();
  if (!res.ok) {
    const msg = (data && data.error) || (typeof data === 'string' ? data : 'Errore API');
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  del: (path) => request('DELETE', path),
};

export default api;
