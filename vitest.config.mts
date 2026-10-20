import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const rootDirectory = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: {
    alias: [{ find: /^@\//, replacement: rootDirectory }],
  },
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts", "types/**/*.test.ts"],
  },
});
