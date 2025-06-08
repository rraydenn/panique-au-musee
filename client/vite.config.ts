import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

// Définition des fichiers de l'app shell
const appShellFiles = [
  '/',
  '/index.html',
  '/src/main.ts',
  '/src/App.vue',
  '/src/assets/main.css',
  '/src/assets/logo.svg',
  '/src/components/MyMap.vue',
  '/src/components/Login.vue',
  '/src/components/CatchModal.vue',
  '/src/stores/position.ts',
  '/src/services/game.ts'
]

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        additionalManifestEntries: appShellFiles.map(file => ({
          url: file,
          revision: null
        })),
        globIgnores: ['**/node_modules/**/*', '**/dev-dist/**/*'],
        maximumFileSizeToCacheInBytes: 3000000,
        runtimeCaching: [
          {
            // Cache des tuiles de carte Mapbox
            urlPattern: /^https:\/\/api\.mapbox\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'mapbox-tiles',
              expiration: {
                maxEntries: 1000,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 jours
              },
            }
          },
          {
            // Cache des API calls de jeu
            urlPattern: /^https:\/\/192\.168\.75\.94.*\/api\/game\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'game-api',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5 // 5 minutes
              },
              networkTimeoutSeconds: 3
            }
          },
          {
            // Cache des ressources statiques
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30
              }
            }
          }
        ]
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
