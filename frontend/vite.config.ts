import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// App 100% estático (sem backend). "base" pode ser sobrescrito via
// VITE_BASE_PATH ao publicar em um subcaminho (ex.: GitHub Pages de projeto:
// "/nome-do-repo/").
export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? '/',
  plugins: [react()],
  server: {
    port: 5173,
  },
});
