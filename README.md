# yn-web-component

[English](./README.en.md)

基于 **Lit + Web Components** 的组件库，支持按需导入、全量注册、Storybook 文档与测试流水线，适合在多框架项目中复用。

## 灵感来源

- 交互动效与视觉细节灵感参考：[Floema](https://www.floema.com/)

## 项目介绍

`yn-web-component` 提供一组 `yn-*` 前缀的自定义元素组件，核心目标是：

- 可复用：统一交互与视觉实现，避免业务层重复造轮子
- 可扩展：通过属性、事件、插槽、CSS 变量扩展能力
- 可发布：支持 npm 发布，支持 ESM/CJS 双格式
- 可维护：包含 Storybook 文档、测试与 lint/format 工具链

## 项目优势

- **跨框架使用**：基于原生 Web Components，可用于 React/Vue/Angular/原生项目
- **样式隔离**：组件默认使用 Shadow DOM，减少全局样式污染
- **文档完善**：Storybook 中提供属性/事件/插槽/CSS 变量说明
- **按需加载友好**：支持组件级子路径导入，便于 Tree Shaking
- **工程化完整**：Vite + Vitest + Web Test Runner + Storybook + Changesets

## 包体积参考（当前构建）

> 以下数据来自本地 `pnpm build` 构建结果（ESM 产物），会随版本变化。

- `yn-button`：约 `1.31 kB`（gzip 约 `0.74 kB`）
- `yn-input`：约 `1.53 kB`（gzip 约 `0.81 kB`）
- `yn-navigation`：约 `19.26 kB`（gzip 约 `5.54 kB`）
- `yn-search`：约 `21.27 kB`（gzip 约 `5.84 kB`）
- `yn-icon-connect-button`：约 `22.75 kB`（gzip 约 `7.55 kB`）

## Web Components 优势与行业实践

- **标准化能力**：基于浏览器标准（Custom Elements / Shadow DOM），框架无关
- **跨团队复用**：同一套组件可在多技术栈项目中复用，降低维护成本
- **长期可维护**：避免绑定单一框架生命周期，升级路径更稳
- **样式边界清晰**：Shadow DOM 减少样式互相污染，组件行为更可预期
- **行业主流方向**：越来越多设计系统采用“标准组件 + 框架适配层”模式

## 当前组件

- `yn-button`
- `yn-input`
- `yn-icon-connect-button`
- `yn-navigation`
- `yn-search`

## 安装

```bash
pnpm add yn-web-component
# 或 npm i yn-web-component
# 或 yarn add yn-web-component
```

## 组件使用方式

### 1) 全量注册（最简单）

适合中小项目或后台系统：

```ts
import "yn-web-component/define";
```

### 2) 按需导出类（主入口）

```ts
import { YnSearch, YnNavigation } from "yn-web-component";
```

### 3) 组件级子路径导入（推荐，Tree Shaking 更友好）

```ts
import { YnSearch } from "yn-web-component/components/yn-search";
import { YnNavigation } from "yn-web-component/components/yn-navigation";
```

### 4) 浏览器 `<script>` 直引（UMD / IIFE）

适合无打包器场景（静态站点、快速验证）：

```html
<!-- 先加载 lit -->
<script src="https://unpkg.com/lit@3/index.js?module"></script>
<!-- 再加载库（IIFE） -->
<script src="https://unpkg.com/yn-web-component/dist/index.iife.js"></script>

<yn-search></yn-search>
```

如果你在自建 CDN 或私有静态资源服务，也可以使用 `dist/index.umd.js` 或 `dist/index.iife.js` 文件。

## Tree Shaking 使用方式（推荐）

为获得更好的打包裁剪效果：

1. 优先使用 `yn-web-component/components/*` 子路径导入
2. 不要在按需场景里使用 `yn-web-component/define`（它会全量注册）
3. 在业务构建工具中保持 ESM 模式（Vite/Rollup/Webpack5 默认支持）

### 导入建议

- 需要全部组件：`import "yn-web-component/define"`
- 只需要单个组件：`import { YnXxx } from "yn-web-component/components/yn-xxx"`

## `yn-navigation`（SEO 模式）

`seoMode=true` 时，导航项会渲染为 `a` 标签并按 `window.location.pathname` 匹配激活项：

```html
<yn-navigation
  .seoMode=${true}
  .items=${{ Home: "/home", Products: "/products", Journal: "/journal" }}
  aria-label="Primary navigation"
></yn-navigation>
```

说明：

- `items` 的 `key` 为展示文案，`value` 为链接地址
- `seoMode=false` 时可用 `active` + `change` 做受控切换

## 版本与兼容性

### 包格式

- ESM：`dist/index.js`
- CJS：`dist/index.cjs`
- UMD：`dist/index.umd.js`
- IIFE：`dist/index.iife.js`
- Types：`dist/types/*`

### 依赖基线（当前仓库）

- `lit`: `^3.3.2`
- `storybook`: `8.6.x`
- `vite`: `6.4.x`
- `typescript`（开发时）：`6.x`

### 运行环境建议

- Node.js：建议 `>= 18`
- 包管理器：推荐 `pnpm 10+`
- 浏览器：支持 Custom Elements v1 / Shadow DOM 的现代浏览器

## 开发命令

```bash
pnpm dev
pnpm build
pnpm test
pnpm test:browser
pnpm lint
pnpm format
pnpm storybook
```

## Tailwind 使用边界（开发/文档）

为避免影响组件库正式产物体积与依赖，Tailwind 仅用于开发演示层：

- 允许在 Storybook（如 `.storybook/preview.ts`、`*.stories.ts`）中使用 Tailwind 美化示例
- 组件源码（`src/components/**`）禁止引入 `tailwind.css` 或 `tailwind.css?inline`
- 组件样式请使用组件内 `css` 与公开 CSS 变量（`--yn-*`）实现
- 发布前确保 `pnpm build` 产物不包含 Tailwind 运行时样式依赖

## 发布

```bash
pnpm build
pnpm changeset
pnpm release
```

## License

MIT
