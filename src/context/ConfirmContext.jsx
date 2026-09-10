// src/context/ConfirmContext.jsx
import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';

const ConfirmContext = createContext(null);

export const ConfirmProvider = ({ children }) => {
  const [state, setState] = useState(null); // { title, message, confirmLabel, danger }
  const resolverRef = useRef(null);

  const confirm = useCallback((options) => {
    const opts = typeof options === 'string' ? { message: options } : options;
    setState({
      title: opts.title || 'Are you sure?',
      message: opts.message || '',
      confirmLabel: opts.confirmLabel || 'Confirm',
      cancelLabel: opts.cancelLabel || 'Cancel',
      danger: opts.danger ?? false,
    });
    return new Promise((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const handle = (result) => {
    setState(null);
    if (resolverRef.current) {
      resolverRef.current(result);
      resolverRef.current = null;
    }
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && createPortal(
        <div className="fixed inset-0 z-[190] flex items-center justify-center bg-brand-charcoal/50 backdrop-blur-sm p-6 animate-toast-in">
          <div className="bg-white dark:bg-brand-darkCard rounded-3xl shadow-2xl w-full max-w-sm p-6 animate-scale-in">
            <h3 className="text-lg font-bold text-brand-charcoal dark:text-white mb-2">{state.title}</h3>
            {state.message && <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{state.message}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => handle(false)}
                className="flex-1 py-3 rounded-xl font-semibold text-sm bg-gray-100 dark:bg-brand-darkBorder text-brand-charcoal dark:text-white hover:bg-gray-200 dark:hover:bg-opacity-80 transition-colors"
              >
                {state.cancelLabel}
              </button>
              <button
                onClick={() => handle(true)}
                className={`flex-1 py-3 rounded-xl font-semibold text-sm text-white transition-colors ${
                  state.danger ? 'bg-danger hover:bg-red-600' : 'bg-brand-charcoal hover:bg-gray-800'
                }`}
              >
                {state.confirmLabel}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within a ConfirmProvider');
  return ctx;
};
