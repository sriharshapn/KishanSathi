import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const dir = typeof import.meta.dirname !== 'undefined' ? import.meta.dirname : path.resolve('.');
  // Load environment variables from both root (outside itself) and client directory
  const rootEnv = loadEnv(mode, path.resolve(dir, '..'), '')
  const clientEnv = loadEnv(mode, dir, '')
  const env = { ...rootEnv, ...clientEnv }

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    // Support loading .env files located outside client (in the project root)
    envDir: path.resolve(dir, '..'),
    envPrefix: ['VITE_', 'GEMINI_', 'GOOGLE_'],
    define: {
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(
        env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY || ''
      ),
      'import.meta.env.VITE_GOOGLE_MAPS_API_KEY': JSON.stringify(
        env.VITE_GOOGLE_MAPS_API_KEY || env.GOOGLE_MAPS_API_KEY || ''
      ),
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:5001',
          changeOrigin: true,
        },
      },
    },
  }
})
