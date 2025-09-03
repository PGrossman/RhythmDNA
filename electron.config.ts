import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    outDir: 'dist-electron',
    lib: {
      entry: resolve(__dirname, 'src/main/main.ts'),
      formats: ['cjs']
    },
    rollupOptions: {
      external: ['electron']
    }
  }
})
