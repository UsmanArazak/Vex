// src/components/ui/InfoButton.jsx
import React, { useState } from 'react';
import { createPortal } from 'react-dom';

const InfoButton = ({ title, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-6 h-6 rounded-full bg-gray-100 dark:bg-brand-darkBorder text-gray-500 dark:text-gray-400 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-opacity-80 transition-colors shrink-0"
        aria-label="About this page"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      </button>
      {open && createPortal(
        <div
          className="fixed inset-0 z-[170] flex items-end sm:items-center justify-center bg-brand-charcoal/50 backdrop-blur-sm animate-toast-in"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white dark:bg-brand-darkCard rounded-t-3xl sm:rounded-3xl p-6 w-full sm:max-w-sm shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-brand-charcoal dark:text-white">{title}</h3>
              <button
                onClick={() => setOpen(false)}
                className="p-2 bg-gray-100 dark:bg-brand-darkBorder rounded-full text-gray-500 dark:text-gray-400 hover:text-brand-charcoal"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{children}</p>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default InfoButton;
