import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png'],
      manifest: {
        name: 'Vex My Wallet',
        short_name: 'Vex Wallet',
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
