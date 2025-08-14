import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import WindiCSS from 'vite-plugin-windicss'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),WindiCSS(),],
  server: {
    host: '0.0.0.0',
    allowedHosts: ['s8.ywit.xyz'],
  }
})