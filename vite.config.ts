import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// No Node.js modules needed!
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src"
    }
  }
});
