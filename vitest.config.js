import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    // Enable globals so that jest-when can be used
    globals: true,
    // Reset mocks between tests
    mockReset: true,
  },
})
