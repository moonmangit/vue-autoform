import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      'vue-autoform': resolve(__dirname, '../dist/vue-autoform.es.js'),
    },
  },
  root: resolve(__dirname),
  server: {
    port: 5175,
  },
})
