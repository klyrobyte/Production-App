import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: true, // Set to ["your-domain.com"] to restrict access
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Disable source maps to hide the original source code in the browser's developer tools
  build: {
    sourcemap: false, 
    // Minify code to make it look "encrypted"/unreadable in production
    minify: "esbuild", 
  },
}));
