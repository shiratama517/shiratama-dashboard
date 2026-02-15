import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Electron で dist/index.html を file:// で開くため、相対パスでアセット参照する
  base: './',
  plugins: [react()],
})
