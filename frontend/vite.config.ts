import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Proxy API calls to the Spring Boot backend during development (avoids CORS).
    proxy: {
      '/decks': 'http://localhost:8080',
      '/quiz': 'http://localhost:8080',
    },
  },
})
