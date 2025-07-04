import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import environment from 'vite-plugin-environment';

export default defineConfig({
  plugins: [
    react(),
    environment([
      'VITE_API_URL',
      'VITE_TOKEN_KEY',
      'VITE_USER_KEY',
      'VITE_NAME',
      'VITE_DESCRIPTION',
    ]),
  ],
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, 'src') },
      { find: '@routes', replacement: path.resolve(__dirname, 'src/routes') },
      { find: '@store', replacement: path.resolve(__dirname, 'src/store') },
      { find: '@components', replacement: path.resolve(__dirname, 'src/components') },
      { find: '@pages', replacement: path.resolve(__dirname, 'src/pages') },
      { find: '@services', replacement: path.resolve(__dirname, 'src/services') },
      { find: '@assets', replacement: path.resolve(__dirname, 'src/assets') },
      { find: '@hooks', replacement: path.resolve(__dirname, 'src/hooks') },
      { find: '@utils', replacement: path.resolve(__dirname, 'src/utils') },
      { find: '@themes', replacement: path.resolve(__dirname, 'src/themes') },
      { find: '@config', replacement: path.resolve(__dirname, 'src/config') },
      { find: '@i18n', replacement: path.resolve(__dirname, 'src/i18n') },
      // Adicione todos os seus aliases aqui
    ],
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
});
