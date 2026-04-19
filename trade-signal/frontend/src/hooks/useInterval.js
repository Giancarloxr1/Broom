import { useEffect, useRef } from 'react';

/**
 * Polling React-safe: esegue `callback` ogni `delayMs` millisecondi.
 * Se `delayMs` e' null interrompe l'intervallo. Usa ref per evitare restart
 * quando il callback cambia identita a ogni render.
 */
export function useInterval(callback, delayMs) {
  const savedRef = useRef(callback);
  useEffect(() => {
    savedRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delayMs == null) return undefined;
    const id = setInterval(() => savedRef.current && savedRef.current(), delayMs);
    return () => clearInterval(id);
  }, [delayMs]);
}

export default useInterval;
