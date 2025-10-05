import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import monacoEditorPlugin from "vite-plugin-monaco-editor";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  plugins: [
    react({
      // Modern JSX runtime (no need to import React manually)
      babel: {
        // Optional optimization: improves React render performance
        // If not installed, remove this line or run:
        // npm install -D @babel/plugin-transform-react-constant-elements
        plugins: [["@babel/plugin-transform-react-constant-elements"]],
      },
    }),

    tailwindcss(),

    monacoEditorPlugin.default({
      // Only load required Monaco workers to keep bundle small
      languageWorkers: ["editorWorkerService", "typescript"],
      publicPath: "monaco", // Enables better CDN caching
    }),

    nodePolyfills({
      protocolImports: true,
      include: ["buffer", "process"], // Include only essential polyfills
    }),
  ],

  resolve: {
    alias: {
      "@": "/src",
    },
  },

  build: {
    // ---- 🔧 Production optimizations ----
    minify: "terser", // Smaller JS output
    cssCodeSplit: true, // Split CSS by chunks
    sourcemap: false,
    target: "es2017", // Modern JS output for smaller bundles
    chunkSizeWarningLimit: 600,
    reportCompressedSize: false,

    rollupOptions: {
      output: {
        // ---- ⚡ Code splitting ----
        manualChunks: {
          react: ["react", "react-dom"],
          monaco: ["@monaco-editor/react"],
          parser: ["@babel/parser", "parse5", "csstree", "axe-core"],
        },
        // ---- ✨ File naming & caching ----
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },

    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log() in production
        drop_debugger: true,
        passes: 2,
      },
      format: {
        comments: false, // Strip all comments
      },
    },
  },

  optimizeDeps: {
    // Prebundle common dependencies for faster dev startup
    include: ["react", "react-dom"],
  },

  esbuild: {
    drop: ["console", "debugger"],
  },

  server: {
    headers: {
      // Avoid stale cache in dev mode
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  },
});
