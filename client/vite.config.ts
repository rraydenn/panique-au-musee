import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
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
