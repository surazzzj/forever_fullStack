import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url' // ✅ Required to emulate __dirname
import { dirname } from 'path'      // ✅ Required to emulate __dirname

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  server: { port: 5173 },
  build: {
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'), // ✅ Correct usage
    },
  },
})
