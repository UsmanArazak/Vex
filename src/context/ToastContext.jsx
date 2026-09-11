// src/context/ToastContext.jsx
import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';

const ToastContext = createContext(null);

const ICONS = {
  success: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
  ),
  error: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
  ),
  info: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
  ),
};

const STYLES = 'bg-brand-charcoal dark:bg-brand-darkCard text-white border border-white/10';

const ICON_BG = {
  success: 'bg-success/15 text-success',
  error: 'bg-danger/15 text-danger',
  info: 'bg-info/15 text-info',
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.map(t => t.id === id ? { ...t, leaving: true } : t));
    setTimeout(() => {
      setToasts((prev) => prev.filter(t => t.id !== id));
    }, 180);
  }, []);

  const toast = useCallback((message, type = 'success', duration = 3200) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, type, leaving: false }]);
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration);
    }
    return id;
  }, [dismiss]);

  const api = {
    show: toast,
    success: (msg, d) => toast(msg, 'success', d),
    error: (msg, d) => toast(msg, 'error', d),
    info: (msg, d) => toast(msg, 'info', d),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      {createPortal(
        <div className="fixed top-0 left-0 right-0 z-[200] flex flex-col items-center gap-2 p-4 pointer-events-none">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`pointer-events-auto max-w-sm w-full sm:w-auto flex items-center gap-3 pl-3 pr-4 py-3 rounded-2xl shadow-xl text-sm ${STYLES} ${t.leaving ? 'animate-toast-out' : 'animate-toast-in'}`}
            >
              <span className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${ICON_BG[t.type]}`}>
                {ICONS[t.type]}
              </span>
              <span className="flex-1 font-medium leading-snug">{t.message}</span>
              <button onClick={() => dismiss(t.id)} className="text-white/40 hover:text-white/80 transition-colors shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};
