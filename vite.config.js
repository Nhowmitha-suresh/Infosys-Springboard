import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Same-origin proxies for the Authentication, Model Versioning and Clinical Rule
// Engine screens (see src/services/serviceClients.ts). Override targets with env vars.
const proxy = {
  // Team-C / Team-D embedded pages (public/team-c/**) call these paths relative to the page
  // origin. Without a proxy the Vite dev server answers them with index.html (the HTML dump
  // shown on the False Alert Rate page), so forward them to the Team-C/D Spring Boot backend.
  '^/api/(c|d|fhir|federated|consent|anomaly|audit)(/|$)': {
    target: process.env.TEAM_CD_API_TARGET || process.env.SPRING_API_TARGET || 'http://localhost:8080',
    changeOrigin: true,
  },
  '/svc/spring': {
    target: process.env.SPRING_API_TARGET || 'http://localhost:8080',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/svc\/spring/, ''),
  },
  '/svc/ml': {
    target: process.env.ML_API_TARGET || 'http://127.0.0.1:5001',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/svc\/ml/, ''),
  },
  '/svc/monitoring': {
    target: process.env.MONITORING_API_TARGET || 'http://localhost:4000',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/svc\/monitoring/, ''),
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: { proxy },
  preview: { proxy },
})
