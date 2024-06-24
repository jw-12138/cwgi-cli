import {defineConfig} from 'vite'
import solidPlugin from 'vite-plugin-solid'

export default defineConfig({
  plugins: [
    solidPlugin()
  ],
  server: {
    port: 19247
  },
  build: {
    target: 'chrome87',
    lib: {
      entry: 'src/main.jsx',
      name: '_CWGI',
      formats: ['iife', 'es'],
      fileName: 'cwgi'
    },
    rollupOptions: {
      external: []
    },
    sourcemap: true
  }
})
