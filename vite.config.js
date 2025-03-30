import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Ensure Vite correctly serves the app on port 3000
  server: {
    port: 3000,
    strictPort: true,
    host: '0.0.0.0',
    // Allow specific hosts to access the development server
    allowedHosts: ['all', '5b88512b-b61b-448f-9a97-d0ff0b76d89f-00-1nkgpz8kag6cc.janeway.replit.dev'],
    cors: true,
  },
  // Vite default uses index.html as an entry point
  // Make sure the build is optimized for Tauri
  build: {
    target: ['es2021', 'chrome100', 'safari13'],
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG,
  }
});