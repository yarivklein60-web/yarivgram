import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(() => {});

export function Toaster({ children }) {
  const [toast, setToast] = useState(null);
  const show = useCallback((message) => {
    const id = Date.now();
    setToast({ id, message });
    setTimeout(() => setToast((t) => (t?.id === id ? null : t)), 2200);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      {toast && (
        <div className="fixed top-4 inset-x-0 flex justify-center z-[60] pointer-events-none">
          <div className="glass card py-2.5 px-4 text-sm font-medium animate-[fade_.2s_ease]">{toast.message}</div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
