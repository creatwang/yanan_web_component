# package.json scripts 说明

> `package.json` **不能**用 JSONC / 行内注释（npm、pnpm、Node 都按严格 JSON 解析）。  
> 说明写在本文件；标了「可删」的按需精简即可。

## 开发

| script | 说明 | 建议 |
|--------|------|------|
| `dev` | 文档站 `app/` 本地开发（默认入口） | 保留 |
| `dev:pull-cord` | 孤立 demo：拉绳开关 | 可删 |
| `dev:menu-mobile-bg` | 孤立 demo：移动端菜单背景 | 可删 |
| `dev:unified-address` | 孤立 demo：统一地址（address 文案有引用） | 常用可留 |
| `dev:google-address` | 孤立 demo：Google 地址 | 可删 |
| `dev:dr5hn-region` | 孤立 demo：dr5hn 地区数据 | 可删 |

## 构建 / 文档

| script | 说明 | 建议 |
|--------|------|------|
| `build` | npm 产物：ESM/CJS + UMD/IIFE + d.ts，末尾写体积表 | 保留 |
| `build:docs` | 静态文档站（先跑 sitemap） | 部署 docs 则保留 |
| `storybook` | Storybook 本地调试（6006） | 保留 |
| `build-storybook` | 构建静态 Storybook | 部署 SB 则保留 |

## 门禁 / 测试

| script | 说明 | 建议 |
|--------|------|------|
| `check` | `typecheck` + `lint` + `test` 一键门禁 | 保留 |
| `typecheck` | `tsc --noEmit`（CI 单独步骤） | 保留 |
| `lint` | ESLint（CI 单独步骤） | 保留 |
| `format` | Prettier 写回 | 保留 |
| `test` | Vitest 单测（CI 用） | 保留 |
| `test:watch` | Vitest 监听 | 保留 |
| `test:browser` | Playwright + web-test-runner；CI 未用 | 可选 |

## 代码生成

| script | 说明 | 建议 |
|--------|------|------|
| `generate:entries` | 按清单写回 `package.json` exports | 保留 |
| `generate:entries:check` | CI 校验 exports | 保留 |
| `generate:bundle-sizes` | 只写体积表；`build` 末尾已做 | **可删** |
| `generate:bundle-sizes:check` | CI 校验体积文档 | 保留 |
| `generate:sitemap` | 文档站 sitemap（`build:docs` 会调） | 可内联进 docs，单独入口可选 |
| `generate:cookie-notice-btn` | Cookie 按钮资源（`build` 会先调） | 可只留被 build 调用，不必手跑 |
| `analyze` | CEM + IDE 元数据（改公开 API 后跑） | 保留 |

## 发布 / 联调

| script | 说明 | 建议 |
|--------|------|------|
| `changeset` | 写 changeset | 保留 |
| `version` | `changeset version`（勿与 `npm version` 混淆） | 保留 |
| `prepublishOnly` | `publish` 前自动 `check && build` | **建议只留这一处门禁** |
| `release` | 再跑一遍 check+build 后 `changeset publish` | 与钩子**双跑**，可精简为只 publish |
| `publish:npm` | 同上 + `--no-git-checks` | 与钩子**双跑**，可精简 |
| `link:global` | `build` 后全局 `pnpm link` | 本地联调需要则留 |
