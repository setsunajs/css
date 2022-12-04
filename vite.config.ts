import { defineConfig } from "vitest/config"
import path from "node:path"

export default defineConfig({
  resolve: {
    alias: {
      src: path.resolve(process.cwd(), "./src")
    }
  },
  test: {
    globals: true,
    environment: "jsdom"
  }
})