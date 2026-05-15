import { playwrightLauncher } from "@web/test-runner-playwright";
import { esbuildPlugin } from "@web/dev-server-esbuild";

export default {
  files: "src/**/*.spec.ts",
  nodeResolve: true,
  plugins: [esbuildPlugin({ ts: true, target: "auto", tsconfig: "tsconfig.json" })],
  concurrency: 1,
  browsers: [playwrightLauncher({ product: "chromium" })]
};
