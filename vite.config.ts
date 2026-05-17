import { defineConfig } from "vitest/config";

export default defineConfig({
  base: "/pocket-planetarium/",
  test: {
    environment: "jsdom",
    globals: true
  }
});
