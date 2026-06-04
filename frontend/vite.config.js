import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true, // Needed for Docker container mapping
    proxy: {
      '/api': {
        // target: 'http://localhost:5000',
        target: 'https://resturant-managment-system-qkow.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
