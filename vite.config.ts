import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico','favicon3.ico','og-image.png','assets/screenshot.png','alarmbell.wav'],
      manifest: {
        name: 'Dorofy',
        short_name: 'Dorofy',
        start_url: '/',
        display: 'standalone',
        background_color: '#0b0612',
        theme_color: '#6b46c1',
        icons: [
          { src: 'og-image.png', sizes: '1200x630', type: 'image/png' },
          { src: 'favicon3.ico', sizes: '256x256 128x128 64x64 32x32 16x16', type: 'image/x-icon' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,wav,mp3}'],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'document' || request.destination === 'script' || request.destination === 'style',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'dorofy-assets' },
          },
        ],
      },
    }),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
