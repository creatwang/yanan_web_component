import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { defineConfig } from "vitest/config";

const require = createRequire(import.meta.url);
const { buildViteLibEntries } = require("./scripts/components.manifest.mjs") as {
  buildViteLibEntries: () => Record<string, string>;
};

const pkg = JSON.parse(readFileSync("./package.json", "utf8")) as { version: string };

export default defineConfig({
  define: {
    "import.meta.env.VITE_PACKAGE_VERSION": JSON.stringify(pkg.version)
  },
  build: {
    lib: {
      entry: buildViteLibEntries(),
      formats: ["es", "cjs"],
      fileName: (format, entryName) => {
        if (entryName === "index") {
          return format === "es" ? "index.js" : "index.cjs";
        }
        if (entryName === "define") {
          return format === "es" ? "define.js" : "define.cjs";
        }
        return format === "es" ? `${entryName}.js` : `${entryName}.cjs`;
      }
    },
    rollupOptions: {
      external: ["lit"],
    },
  },
  test: {
    include: ["src/**/*.spec.ts"],
    globals: true,
    environment: "happy-dom",
    setupFiles: ["src/test-setup.ts"]
  }
});
