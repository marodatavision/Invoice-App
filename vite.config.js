import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'logo192.png', 'logo512.png'],
      manifest: {
        name: 'Rechnungserstellung',
        short_name: 'Rechnung',
        description: 'Erstelle Rechnungen im ZUGFeRD-Format',
        theme_color: '#007bff',
        icons: [
          {
            src: 'logo192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'logo512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
        start_url: '/',
        display: 'standalone',
      },
    }),
  ],
});
