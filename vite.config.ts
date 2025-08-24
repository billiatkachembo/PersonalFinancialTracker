import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Money Manager',
        short_name: 'MoneyManager',
        start_url: '.',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#2F855A',
        icons: [
          {
            src: 'favicon.jpeg',
            sizes: '192x192',
            type: 'image/jpeg'
          },
          {
            src: 'favicon.jpeg',
            sizes: '512x512',
            type: 'image/jpeg'
          }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  base: "/PersonalFinancialTracker/", // required for GitHub Pages
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            "react",
            "react-dom",
            "@tanstack/react-query",
            "react-router-dom",
          ],
        },
      },
    },
  },
}));
