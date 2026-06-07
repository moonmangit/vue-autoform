import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import type { OutputBundle, OutputChunk, NormalizedOutputOptions } from 'rollup'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// Custom plugin to inject CSS into JS bundle
function cssInjectorPlugin() {
  let cssContent = ''
  return {
    name: 'css-injector',
    generateBundle(_options: NormalizedOutputOptions, bundle: OutputBundle) {
      // Find the emitted CSS asset in the bundle (it exists here, before writing to disk)
      for (const [fileName, file] of Object.entries(bundle)) {
        if (file.type === 'asset' && fileName.endsWith('.css') && typeof file.source === 'string') {
          cssContent = file.source
          break
        }
      }
      if (!cssContent) return

      // Inject into every JS chunk
      for (const file of Object.values(bundle)) {
        if (file.type === 'chunk') {
          const chunk = file as OutputChunk
          const inject = `(function(){if(typeof document==='undefined')return;var s=document.createElement('style');s.textContent=${JSON.stringify(cssContent)};document.head.appendChild(s);})();\n`
          chunk.code = inject + chunk.code
        }
      }
    }
  }
}

export default defineConfig({
  plugins: [
    vue(),
    dts({
      include: ['src/**/*.ts', 'src/**/*.vue'],
      outDir: 'dist',
      rollupTypes: true,
    }),
    cssInjectorPlugin(),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VueAutoform',
      fileName: (format: string) => `vue-autoform.${format}.js`,
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['vue', 'zod'],
      output: {
        globals: {
          vue: 'Vue',
          zod: 'Zod',
        },
      },
    },
    sourcemap: true,
  },
})
