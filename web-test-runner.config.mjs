import { playwrightLauncher } from "@web/test-runner-playwright";

export default {
  files: "src/**/*.spec.ts",
  nodeResolve: true,
  concurrency: 1,
  browsers: [playwrightLauncher({ product: "chromium" })]
};
