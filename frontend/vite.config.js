import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import fs from 'fs'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true },
      manifest: {
        name: 'Pokémon TCG Portfolio',
        short_name: 'PokéTCG',
        description: 'Track your Pokémon TCG collection',
        theme_color: '#dc2626',
        background_color: '#f3f4f6',
        display: 'standalone',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      }
    })
  ],
  server: {
    port: 3000,
    host: true,
    https: {
      key: fs.readFileSync('./fedora.local-key.pem'),
      cert: fs.readFileSync('./fedora.local.pem')
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true
      }
    }
  }
})