import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import { ConfirmProvider } from './context/ConfirmContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'

// Auto-update the service worker as soon as a new version is available —
// no user action or hard refresh required. Checks every 60s so a tab left
// open still picks up updates without needing to be closed and reopened.
const updateSW = registerSW({
  immediate: true,
  onRegisteredSW(swUrl, registration) {
    if (registration) {
      setInterval(() => {
        registration.update();
      }, 60 * 1000);
    }
  },
  onNeedRefresh() {
    updateSW(true); // auto-reload with the new version, no prompt
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <ConfirmProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ConfirmProvider>
      </ToastProvider>
    </ThemeProvider>
  </StrictMode>,
)
