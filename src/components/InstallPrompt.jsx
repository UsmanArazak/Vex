// src/components/InstallPrompt.jsx
import React, { useState, useEffect } from 'react';

const DISMISS_KEY = 'mopal_install_dismissed_at';
const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

const shouldShow = () => {
  if (isStandalone()) return false;
  const dismissedAt = localStorage.getItem(DISMISS_KEY);
  if (!dismissedAt) return true; // never dismissed — first time, show it
  return Date.now() - Number(dismissedAt) >= TWO_DAYS_MS;
};

const InstallPrompt = () => {
  const [visible, setVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [ios] = useState(isIOS());

  useEffect(() => {
    if (!shouldShow()) return;

    if (ios) {
      // iOS has no install prompt API — just show instructions if eligible.
      setVisible(true);
      return;
    }

    // Android/Chrome: wait for the real install event before showing anything,
    // so we never show an "Install" button that wouldn't actually do anything.
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [ios]);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
    // Not calling dismiss() here — if they installed, isStandalone() will be
    // true next load anyway, so no need to burn the 2-day dismiss window.
  };

  if (!visible) return null;

  return (
    <div className="mx-6 mt-3 card bg-brand-charcoal text-white p-4 shadow-md border-0 flex items-start gap-3 relative">
      <div className="w-10 h-10 rounded-xl bg-brand-gold flex items-center justify-center shrink-0">
        <span className="font-black text-brand-charcoal text-base">M</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm mb-0.5">Install Mopal</p>
        {ios ? (
          <p className="text-xs text-gray-300 leading-relaxed">
            Tap the Share icon <span className="inline-block">⬆️</span> below, then "Add to Home Screen" for quick access.
          </p>
        ) : (
          <p className="text-xs text-gray-300 leading-relaxed mb-2">
            Add Mopal to your home screen for quick, full-screen access.
          </p>
        )}
        {!ios && (
          <button
            onClick={handleInstall}
            className="bg-brand-gold text-brand-charcoal text-xs font-bold px-3 py-1.5 rounded-lg mt-1"
          >
            Install
          </button>
        )}
      </div>
      <button onClick={dismiss} className="text-white/40 hover:text-white/80 transition-colors shrink-0" aria-label="Dismiss">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
    </div>
  );
};

export default InstallPrompt;
