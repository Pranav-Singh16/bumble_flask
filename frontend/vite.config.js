import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  optimizeDeps: {
    include: ['react-loader-spinner', 'react-tooltip'],
  },
  plugins: [react()],
})
