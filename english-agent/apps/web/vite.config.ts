import { fileURLToPath, URL } from 'node:url'

import { Config } from '@en/config'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: Config.ports.web,
    proxy: {
      // 后端 server: /api/v1/* -> http://localhost:3000/api/v1/*
      '/api/v1': {
        target: `http://localhost:${Config.ports.server}`,
        changeOrigin: true,
      },
      // ai 服务: /api/ai/v1/* -> http://localhost:3001/api/v1/*
      '/api/ai/v1': {
        target: `http://localhost:${Config.ports.ai}`,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ai\/v1/, '/api/v1'),
      },
    },
  },
  plugins: [vue(), vueDevTools(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
