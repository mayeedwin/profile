import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        work: resolve(__dirname, "work/index.html"),
        about: resolve(__dirname, "about/index.html"),
        contact: resolve(__dirname, "contact/index.html")
      }
    }
  }
});
