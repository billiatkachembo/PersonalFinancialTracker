import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  base: "/PersonalFinancialTracker/", // required for GitHub Pages
  build: {
    // Increase the warning limit to 2 MB
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        // Separate vendor libraries into their own chunk
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
