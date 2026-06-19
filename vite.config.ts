import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Hosted under https://<user>.github.io/planset-qc-demo/, so the base path must
// match the repo name so asset URLs resolve on GitHub Pages.
export default defineConfig({
  base: '/planset-qc-demo/',
  plugins: [react()],
})
