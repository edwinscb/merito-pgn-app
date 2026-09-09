import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Mérito PGN',
        short_name: 'Mérito PGN',
        description: 'Preparación personal para el Concurso PGN 2026',
        theme_color: '#245d46',
        background_color: '#f5f8f5',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg}', 'data/question-bank.json', 'data/study-bank.json']
      }
    })
  ]
})
