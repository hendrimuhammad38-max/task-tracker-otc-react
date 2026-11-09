import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'ok', title = '') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type, title }]);
    const duration = type === 'bad' ? 6000 : 3800;
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    ok: (msg, title) => addToast(msg, 'ok', title),
    bad: (msg, title) => addToast(msg, 'bad', title || 'Gagal'),
    warn: (msg, title) => addToast(msg, 'warn', title),
    info: (msg, title) => addToast(msg, 'info', title)
  };

  return (
    <ToastContext.Provider value={{ toast, addToast }}>
      {children}
      <div id="toast-root" className="toasts" aria-live="polite" style={{ zIndex: 9999 }}>
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon =
              t.type === 'ok'
                ? CheckCircle2
                : t.type === 'bad'
                ? XCircle
                : t.type === 'warn'
                ? AlertTriangle
                : Info;
            const tileCls =
              t.type === 'ok' ? 'ok' : t.type === 'bad' ? 'bad' : t.type === 'warn' ? 'warn' : 'info';

            return (
              <motion.div
                key={t.id}
                className={`toast ${t.type}`}
                role={t.type === 'bad' ? 'alert' : 'status'}
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.92 }}
                transition={{ duration: 0.22 }}
                onClick={() => removeToast(t.id)}
                style={{ cursor: 'pointer' }}
              >
                <span className={`ic-tile ${tileCls}`}>
                  <Icon size={18} />
                </span>
                <div>
                  {t.title && <b>{t.title}</b>}
                  <span>{t.message}</span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  return ctx?.toast;
}
