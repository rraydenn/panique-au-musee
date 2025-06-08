import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      manifest: {
        name: 'MIF13 Game Application',
        short_name: 'MIF13 Game',
        description: 'Application de jeu géolocalisé avec carte interactive pour voleurs et policiers',
        theme_color: '#2c3e50',
        background_color: '#ffffff',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        categories: ['games', 'entertainment'],
        lang: 'fr',
        icons: [
          {
            src: '/favicon.ico',
            sizes: '48x48',
            type: 'image/x-icon'
          },
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/users': {
        target: 'https://192.168.75.94:8443', // Adresse de Spring Boot
        changeOrigin: true,
        headers: {
          Origin: 'https://192.168.75.94'
        },
        secure: false,
      },
      '/game': {
        //TODO : ajouter le serveur pour request les données de jeu (ZRR par exemple)
        target: 'https://192.168.75.94', // Adresse de Express
        changeOrigin: true,
        headers: {
          Origin: 'https://192.168.75.94'
        },
        secure: false,
        rewrite: (path) => path.replace(/^\/game/, '/api/game')
      }
    }
  }
  // server: {
  //   proxy: {
  //     '/api': {
  //       target: 'http://localhost:8080', // Adresse de Spring Boot
  //       changeOrigin: true,
  //       headers: {
  //         Origin: 'http://localhost'
  //       },
  //       secure: false,
  //       rewrite: (path) => path.replace(/^\/api/, '')
  //     },
  //     '/game': {
  //       //TODO : ajouter le serveur pour request les données de jeu (ZRR par exemple)
  //       target: 'http://localhost:3376', // Adresse de Express
  //       changeOrigin: true,
  //       headers: {
  //         Origin: 'http://localhost'
  //       },
  //       secure: false,
  //       rewrite: (path) => path.replace(/^\/game/, '/game')
  //     }
  //   }
  // }
})
