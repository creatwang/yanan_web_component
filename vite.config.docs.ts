import { readFileSync } from "node:fs";
import { defineConfig } from "vite";

const pkg = JSON.parse(readFileSync("./package.json", "utf8")) as { version: string };

export default defineConfig({
  define: {
    "import.meta.env.VITE_PACKAGE_VERSION": JSON.stringify(pkg.version)
  },
  build: {
    outDir: "dist-docs"
  }
});
