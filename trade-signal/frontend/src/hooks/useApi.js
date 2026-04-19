import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api/client.js';

/**
 * Hook GET con stato completo.
 * @param {string|null} path percorso API; se null non esegue
 * @param {object} options { auto = true, deps = [] }
 * @returns {{data, error, loading, refetch}} stato corrente e funzione per ricaricare
 */
export function useApi(path, options = {}) {
  const { auto = true, deps = [] } = options;
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(auto && !!path);
  const mountedRef = useRef(true);

  const refetch = useCallback(async () => {
    if (!path) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(path);
      if (mountedRef.current) setData(res);
    } catch (e) {
      if (mountedRef.current) setError(e);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  useEffect(() => {
    mountedRef.current = true;
    if (auto && path) refetch();
    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, auto, ...deps]);

  return { data, error, loading, refetch, setData };
}

export default useApi;
