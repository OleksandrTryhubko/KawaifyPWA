import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'apple-touch-icon.png',
        'pwa-192x192.png',
        'pwa-512x512.png'
      ],
      manifest: {
        name: 'Kawaify',
        short_name: 'Kawaify',
        description: 'A kawaii PWA music app',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#121212',
        theme_color: '#1db954',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        categories: ['music', 'entertainment'],
        lang: 'en',
        dir: 'ltr'
      },
      devOptions: {
        enabled: true,
        type: 'module',
        suppressWarnings: true // це прибирає ворнінги про порожні match-и
      },
      workbox: process.env.NODE_ENV === 'production'
        ? {
            globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
            navigateFallback: 'index.html',
            runtimeCaching: [
              {
                urlPattern: /^https:\/\/discoveryprovider\.audius\.co\/v1\/.*/i,
                handler: 'NetworkFirst',
                options: {
                  cacheName: 'audius-api-cache',
                  expiration: {
                    maxEntries: 100,
                    maxAgeSeconds: 60 * 60 * 24 // 1 day
                  },
                  cacheableResponse: {
                    statuses: [0, 200]
                  }
                }
              }
            ]
          }
        : undefined
    })
  ]
});
