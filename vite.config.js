import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  // css: { preprocessorOptions: { scss: { charset: false } } },
  optimizeDeps: {
    include: ["three"],
  },
})
