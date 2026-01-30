import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['react', 'react-dom'],
  },
  server: {
    hmr: {
      overlay: true,
    },
  },
});
