// Plugins
import { fileURLToPath, URL } from 'node:url';
import vue from '@vitejs/plugin-vue';
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';

// Utilities
import { defineConfig } from 'vite';

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
        configFile: 'src/styles/settings.scss',
      },
    }),
  ],
  define: { 'process.env': {} },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue'],
  },
  base: './',
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      // Proxy configuration
      '/api/admin': {
        target: "http://127.0.0.1:9100",
        changeOrigin: true,
        ws: true,
      },
      '/api': {
        target: 'https://askcos-demo.mit.edu',
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
