import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
      },
    },
  },
  define: {
    'import.meta.env.TMDB_API_KEY': JSON.stringify(process.env.TMDB_API_KEY)
  }
});