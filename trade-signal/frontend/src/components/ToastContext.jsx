import React, { createContext, useCallback, useContext, useState } from 'react';

// Contesto globale per toast di conferma / errore.
// Usage: const { showToast } = useToast(); showToast('Salvato', 'success').
const ToastContext = createContext({ showToast: () => {} });

/** Hook di accesso rapido al toast. */
export function useToast() {
  return useContext(ToastContext);
}

/**
 * Provider del sistema toast: ogni toast ha id, messaggio, variante e auto-scompare.
 * @param {object} props children dell'app
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  /** Aggiunge un toast e programma la rimozione dopo 3s. */
  const showToast = useCallback((message, variant = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, variant }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={
              'px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium pointer-events-auto ' +
              (t.variant === 'error'
                ? 'bg-sell text-white'
                : t.variant === 'warning'
                ? 'bg-orange text-white'
                : 'bg-buy text-white')
            }
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
