import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  // Allow importing .glb files as URLs
  assetsInclude: ['**/*.glb', '**/*.gltf'],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react':  ['react', 'react-dom', 'react-router-dom'],
          'vendor-three':  ['three', '@react-three/fiber', '@react-three/drei'],
          'vendor-motion': ['framer-motion'],
          'vendor-i18n':   ['react-i18next', 'i18next'],
        },
      },
    },
  },
})
