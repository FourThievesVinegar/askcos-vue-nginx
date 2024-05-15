// Plugins
import { fileURLToPath, URL } from "node:url";
import vue from "@vitejs/plugin-vue";
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";

// Utilities
import { defineConfig } from "vite";
import childProcess from 'child_process';

let lastCommitHash = '';
try {
  lastCommitHash = childProcess
    .execSync('git rev-parse --short HEAD')
    .toString()
    .trim();
} catch (e) {
  console.error(e);
}

const fastapiGatewayPtr = {
  target: "https://askcos.mit.edu/",
  changeOrigin: true,
  ws: true,
  secure: false,
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls },
    }),
    // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
    vuetify({
      autoImport: true,
      styles: {
        configFile: "src/styles/settings.scss",
      },
    }),
  ],
  define: { 'import.meta.env.VITE_APP_VERSION': JSON.stringify(lastCommitHash) },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
    extensions: [".js", ".json", ".jsx", ".mjs", ".ts", ".tsx", ".vue"],
  },
  base: "./",
  server: {
    host: "0.0.0.0",
    port: 3000,
    proxy: {
      // Proxy configuration
      // FastAPI Docs Config
      "/openapi.json": fastapiGatewayPtr,
      "/docs": fastapiGatewayPtr,
      // FastAPI Gateway
      "/api/": fastapiGatewayPtr,
    },
  },
  optimizeDeps: {
    exclude: ["vuetify"],
  },
});
