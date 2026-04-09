import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { devApiPlugin } from './vite-dev-api'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    base: process.env.GITHUB_PAGES ? '/rah/' : '/',
    plugins: [
      react(),
      tailwindcss(),
      devApiPlugin(env.ZHIPU_API_KEY || ''),
    ],
  }
})
