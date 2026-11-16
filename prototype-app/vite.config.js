import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/prototipe/assets/',
  plugins: [vue()],
  build: {
    outDir: '../public/prototipe/assets',
    emptyOutDir: true,
    manifest: 'manifest.json',
    rollupOptions: { input: 'src/main.js' },
  },
})
