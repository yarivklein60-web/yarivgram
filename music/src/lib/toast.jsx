import { createContext, useCallback, useContext, useRef, useState } from 'react';

const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
  const [message, setMessage] = useState(null);
  const timer = useRef();
  const show = useCallback((text) => {
    clearTimeout(timer.current);
    setMessage(text);
    timer.current = setTimeout(() => setMessage(null), 2400);
  }, []);
  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none fixed inset-x-0 bottom-40 z-50 flex justify-center px-4 transition-all duration-200 md:bottom-28 ${
          message ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
        }`}
      >
        {message && <div className="rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black shadow-xl">{message}</div>}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
