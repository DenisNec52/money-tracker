import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Same-origin /api in dev, so the generated client needs no base URL.
    proxy: { "/api": `http://localhost:${process.env.API_PORT ?? 3001}` },
  },
});
