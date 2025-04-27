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
      '/api': {
        target: 'https://192.168.75.94:8443/users',
        changeOrigin: true,
        headers: {
          Origin: 'https://192.168.75.94:8443' // Explicitly set the Origin to match target
        },
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
    }
  }
})
