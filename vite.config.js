import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Other server options you might have (e.g., port)
    // port: 5173,

    // Crucial: Add the ngrok host to allowedHosts
    // You can include localhost as well for direct local access
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '564e3bb765a4.ngrok-free.app'
    ],
  },
});
