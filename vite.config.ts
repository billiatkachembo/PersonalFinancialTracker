import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,json,ico,png,svg}"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
      includeAssets: ["favicon.ico", "**/*.{js,css,html,json,ico,png,svg}"],
      manifest: {
        name: "Money Manager",
        short_name: "MoneyManager",
        description: "Personal financial tracking application",
        start_url: "/PersonalFinancialTracker/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#2F855A",
        icons: [
          {
            src: "favicon.ico",
            sizes: "64x64 32x32 24x24 16x16",
            type: "image/x-icon",
          },
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          }
        ],
      },
    }),
  ],
  base: "/PersonalFinancialTracker/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    // CSS optimization
    cssCodeSplit: true,
    // Ensure CSS is properly processed
    rollupOptions: {
      onwarn(warning, defaultHandler) {
        if (warning.code === 'EVAL' && warning.id && warning.id.includes('gapi-script')) {
          return; // Ignore gapi-script eval warnings
        }
        defaultHandler(warning);
      },
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          // This helps with CSS splitting
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'assets/css/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
  // CSS configuration
  css: {
    postcss: "./postcss.config.js",
    modules: {
      localsConvention: "camelCase",
    },
  },
  // Optimize build
  esbuild: {
    legalComments: "none",
    treeShaking: true,
  },
});