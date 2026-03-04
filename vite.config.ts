import react from '@vitejs/plugin-react-swc';
import { fileURLToPath, URL } from 'node:url';
import autoImports from 'unplugin-auto-import/vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import "@/assets/styles/root/variables";
          @import "@/assets/styles/root/mixins";
        `,
      },
    },
  },

  plugins: [
    react(),
    svgr(),

    autoImports({
      dirs: [
        'src/apis/**',
        'src/constants/**',
        'src/hooks/shared/**',
        'src/utils/**',
      ],

      dts: 'src/@types/auto-imports.d.ts',

      eslintrc: {
        enabled: true,
        filepath: './.eslint-globals.json',
        globalsPropValue: true,
      },

      imports: ['react', 'react-router', 'react-i18next'],
    }),

    VitePWA({
      devOptions: {
        enabled: true,
      },
      manifest: {
        background_color: '#ffffff',
        description: 'Quản lý chi tiêu cá nhân - PWA',
        display: 'standalone',
        icons: [
          {
            sizes: '192x192',
            src: '/logo.png',
            type: 'image/png',
          },
          {
            sizes: '512x512',
            src: '/logo.png',
            type: 'image/png',
          },
          {
            purpose: 'maskable',
            sizes: '512x512',
            src: '/logo.png',
            type: 'image/png',
          },
        ],
        name: 'Flow Budget',
        orientation: 'portrait',
        short_name: 'FlowBudget',
        start_url: '/',
        theme_color: '#0ea5e9',
      },
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxAgeSeconds: 60 * 60 * 24,
                maxEntries: 50,
              },
            },
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
          },
        ],
      },
    }),
  ],

  preview: {
    host: '0.0.0.0',
    port: Number(process.env.VITE_PORT_PREVIEW) || 3030,
  },

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  server: {
    host: '0.0.0.0',
    port: Number(process.env.VITE_PORT) || 3000,
  },
});
