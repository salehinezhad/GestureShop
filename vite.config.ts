import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { host: '127.0.0.1', port: 4173 },
  preview: { host: '127.0.0.1', port: 4174 },
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@mediapipe/tasks-vision')) return 'vision';
          if (id.includes('@react-three') || id.includes('/three/') || id.includes('three-stdlib')) return 'three';
          if (id.includes('/motion/')) return 'motion';
        },
      },
    },
  },
});
