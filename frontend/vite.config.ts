import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@todo-app/shared": path.resolve(__dirname, "../shared/src")
    }
  },
  optimizeDeps: {
    include: ["@todo-app/shared"]
  }
});
