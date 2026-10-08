import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Mirrors tsconfig "paths": { "@/*": ["./*"] }.
    alias: { "@": fileURLToPath(new URL("./", import.meta.url)) },
  },
});
