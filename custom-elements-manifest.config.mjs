/** @type {import('@custom-elements-manifest/analyzer').AnalyzerConfig} */
export default {
  globs: ["src/components/**/yn-*.ts"],
  exclude: ["**/*.stories.ts", "**/*.spec.ts"],
  outdir: ".",
  dev: true,
  plugins: []
};
