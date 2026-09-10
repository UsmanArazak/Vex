import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false, // we register manually in main.jsx for reliable auto-reload
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        // Don't let the app shell (HTML/JS/CSS) get served stale — only
        // cache actual static assets, always fetch fresh code from network.
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkOnly',
          },
        ],
      },
      includeAssets: ['favicon.png'],
      manifest: {
        name: 'Mopal',
        short_name: 'Mopal',
        description: 'Personal Spending Tracker',
        theme_color: '#FFE066',
        background_color: '#F4F5F7',
        display: 'standalone',
        icons: [
          {
            src: 'favicon.png',
            sizes: '192x192 512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
