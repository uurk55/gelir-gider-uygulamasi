// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Kur istekleri için proxy
      '/api/kur': {
        target: 'https://api.exchangerate.host',
        changeOrigin: true,
        // /api/kur/latest -> https://api.exchangerate.host/latest
        rewrite: (path) => path.replace(/^\/api\/kur/, ''),
      },
    },
  },
});
