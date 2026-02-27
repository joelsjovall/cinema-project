import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendPort = env.VITE_BACKEND_PORT || '5001'
  const target = `http://localhost:${backendPort}`

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/movies': {
          target,
          changeOrigin: true,
        },
        '/api': {
          target,
          changeOrigin: true,
        },
        '/bookings': {
          target,
          changeOrigin: true,
        },
      },
    },
  }
})