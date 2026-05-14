import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: '.',
  base: './',
  server: {
    port: 9000,
    open: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    cssMinify: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        css: resolve(__dirname, 'src/scss/minesweeper.scss'),
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '',
        api: 'modern-compiler',
      },
    },
    devSourcemap: true,
  },
})
