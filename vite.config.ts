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
        globPatterns: ["**/*.{js,css,html,json}"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
      includeAssets: ["favicon.ico"],
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
    rollupOptions: {
      output: { inlineDynamicImports: false },
    },
  },
  esbuild: { legalComments: "none" },
  css: { postcss: "./postcss.config.js" },
});
