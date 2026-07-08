# yn-web-component

[English](https://github.com/creatwang/yanan_web_component/blob/main/README.en.md)（npm 包页仅展示本文件，英文完整文档见 GitHub）

面向**独立站电商平台**打造的 **Lit + Web Components** 组件库——从商品浏览、规格选择到跨境结账，提供统一、精致、可定制的界面能力，并支持按需导入与跨框架复用。

## 目录

- [灵感来源](#灵感来源)
- [项目介绍](#项目介绍)
- [安装与导入](#安装与导入)
- [通用约定](#通用约定)
- [组件文档](#组件文档)
  - [yn-button](#yn-button)
  - [yn-input](#yn-input)
  - [yn-navigation](#yn-navigation)
  - [yn-search](#yn-search)
  - [yn-group-pick](#yn-group-pick)
  - [yn-pick](#yn-pick)
  - [yn-dropdown](#yn-dropdown)
  - [yn-dropdown-pick](#yn-dropdown-pick)
  - [yn-drawer](#yn-drawer)
  - [yn-toast](#yn-toast)
  - [yn-icon-connect-button](#yn-icon-connect-button)
  - [yn-pull-cord-switch](#yn-pull-cord-switch)
  - [yn-quantity](#yn-quantity)
  - [yn-checkout-address](#yn-checkout-address)
  - [yn-sku-selector](#yn-sku-selector)
- [打包体积](#打包体积)
- [在线文档站](#在线文档站)
- [导入路径速查](#导入路径速查)
- [主题与样式](#主题与样式)
- [开发命令](#开发命令)
- [发布](#发布)

## 灵感来源

交互动效与视觉质感参考独立站品牌站 [Floema](https://www.floema.com/)——克制、细腻、有呼吸感的电商体验，是本组件库在视觉与动效上的重要参照。

## 项目介绍

`yn-web-component` 是一套为**跨境独立站 / DTC 电商**场景设计的 Web Components 组件库。它不绑定 React、Vue 或任何特定前端框架，而是以浏览器标准能力封装可复用的 `yn-*` 自定义元素，帮助团队在商品站、结账流、运营后台之间共享同一套交互与视觉语言。

独立站往往要面对多语言、多币种、多地区配送、SKU 规格联动、移动端结账等复杂需求。本库将其中高频、难啃、易不一致的部分沉淀为组件——例如跨境地址的多数据源降级、多维 SKU 联动加购、响应式购物车抽屉、SEO 友好导航等——让业务层专注在商品与订单逻辑，而不是反复实现同一套 UI 细节。

### 适用场景

| 场景 | 相关组件 |
| --- | --- |
| 站点导航与品牌入口 | `yn-navigation`、`yn-icon-connect-button`、`yn-search` |
| 商品详情与规格选择 | `yn-sku-selector`、`yn-quantity`、`yn-group-pick`、`yn-pick` |
| 筛选、语言与运营配置 | `yn-dropdown`、`yn-dropdown-pick` |
| 购物车与侧边流程 | `yn-drawer`、`yn-toast` |
| 跨境结账与地址采集 | `yn-checkout-address` |
| 通用表单与操作反馈 | `yn-button`、`yn-input` |
| 主题氛围与特色交互 | `yn-pull-cord-switch` |

### 为什么选择这套方案

- **为电商而生**：覆盖浏览、选购、加购、结账等独立站核心链路，而非通用 UI 拼凑
- **跨境开箱即用**：地址组件内置 Google → dr5hn → Photon → manual 降级策略，适配多地区配送
- **跨框架复用**：基于 Web Components，同一套组件可用于 React / Vue / Angular / 原生页面
- **品牌可定制**：Shadow DOM 隔离样式，通过 `--yn-*` CSS 变量与 `variant` 语义层灵活换肤
- **按需加载**：组件级子路径导入，配合 Tree Shaking 控制首屏体积
- **文档与工程完备**：Storybook 交互文档 + 完整 API 参考 + 测试与 lint 流水线

### 技术特性

- **标准化交付**：ESM / CJS 双格式，支持 npm 发布与 `<script>` 直引
- **样式隔离**：默认 Shadow DOM，减少主题样式与组件内部互相污染
- **扩展友好**：属性、事件、插槽、CSS 变量四层公开 API，满足业务二次封装
- **可维护**：Vite + Vitest + Web Test Runner + Storybook + Changesets

### 打包体积

> 以下数据来自本地 `pnpm build` ESM 产物（v1.0.9，构建日期 2026-07-08）。按需导入路径：`yn-web-component/components/<name>`。完整表格见文档站 `#/bundle-size`。

| 组件 | ESM | gzip | 备注 |
| --- | --- | --- | --- |
| `yn-quantity` | 4.36 kB | 1.51 kB | |
| `yn-group-pick` | 4.60 kB | 1.92 kB | |
| `yn-input` | 4.89 kB | 1.55 kB | |
| `yn-pick` | 7.14 kB | 2.42 kB | |
| `yn-icon-connect-button` | 11.29 kB | 3.82 kB | |
| `yn-drawer` | 11.62 kB | 3.18 kB | |
| `yn-dropdown-pick` | 13.05 kB | 4.19 kB | |
| `yn-button` | 14.35 kB | 3.70 kB | |
| `yn-dropdown` | 16.66 kB | 4.67 kB | |
| `yn-search` | 18.82 kB | 5.17 kB | |
| `yn-toast` | 20.98 kB | 5.27 kB | |
| `yn-navigation` | 21.08 kB | 6.72 kB | |
| `yn-sku-selector` | ~26.8 kB | ~6.8 kB | 入口 + 分包合计 |
| `yn-pull-cord-switch` | ~49.8 kB | ~12.4 kB | 含绳物理引擎分包 |
| `yn-checkout-address` | ~74.6 kB | ~18.0 kB | 入口 + 分包，含 dr5hn 逻辑 |
| `yn-cookie-notice` | 167.17 kB | 114.06 kB | 含内联图片，改版后优化 |
| **全量 IIFE** | **495.81 kB** | **195.93 kB** | `dist/index.iife.js` |

### 在线文档站

线上地址：[web-components.yanan.store](https://web-components.yanan.store/introduction)

```bash
pnpm dev   # http://localhost:5173/introduction — Floema 风格文档，含中英文、Live Preview、Storybook 链接
```

源码位于 `app/`，与 `src/components` 组件库分离。文档站使用 **pathname 路由**（如 `/yn-button`），便于 Google 收录；旧 `#/yn-button` 链接会自动跳转。

### 当前组件一览

| 组件 | 标签名 | 用途摘要 |
| --- | --- | --- |
| 按钮 | `yn-button` | 语义色按钮、加载态、图标插槽 |
| 输入框 | `yn-input` | Floema 风格输入，前后置按钮插槽 |
| 导航 | `yn-navigation` | 胶囊导航，支持 SEO 链接模式 |
| 搜索 | `yn-search` | 可展开搜索框，支持左右展开、datalist、两步关闭 |
| Cookie 同意 | `yn-cookie-notice` | Cookie 横幅，分类偏好与同意持久化 |
| 选项组 | `yn-group-pick` | 单选/多选容器，配合 `yn-pick` |
| 选项 | `yn-pick` | 单个可选项 |
| 下拉弹层 | `yn-dropdown` | 通用下拉定位弹层 |
| 下拉选择 | `yn-dropdown-pick` | 下拉单选器 |
| 抽屉 | `yn-drawer` | 响应式侧滑/底部抽屉 |
| 提示 | `yn-toast` | 灵动岛风格顶部反馈 |
| 图标连接按钮 | `yn-icon-connect-button` | 带图标连接动画的按钮/链接 |
| 抽绳开关 | `yn-pull-cord-switch` | 物理绳动画开关 |
| 数量选择 | `yn-quantity` | 加减数量输入 |
| 结账地址 | `yn-checkout-address` | 跨境地址表单（多数据源降级） |
| SKU 选择器 | `yn-sku-selector` | 多维规格联动与加购 |

## 安装与导入

### 安装

```bash
pnpm add yn-web-component
# 或 npm i yn-web-component
# 或 yarn add yn-web-component
```

### 导入方式

#### 1) 全量注册（最简单）

适合中小项目或后台系统，一次性注册所有组件：

```ts
import "yn-web-component/define";
```

#### 2) 主入口按需导出类

```ts
import { YnSearch, YnNavigation } from "yn-web-component";
```

#### 3) 组件级子路径导入（推荐，Tree Shaking 更友好）

```ts
import { YnSearch } from "yn-web-component/components/yn-search";
import { YnNavigation } from "yn-web-component/components/yn-navigation";
```

#### 4) 浏览器 `<script>` 直引（UMD / IIFE）

适合无打包器场景：

```html
<script src="https://unpkg.com/lit@3/index.js?module"></script>
<script src="https://unpkg.com/yn-web-component/dist/index.iife.js"></script>

<yn-search></yn-search>
```

### Tree Shaking 建议

1. 优先使用 `yn-web-component/components/*` 子路径导入
2. 不要在按需场景里使用 `yn-web-component/define`（它会全量注册）
3. 在业务构建工具中保持 ESM 模式（Vite/Rollup/Webpack5 默认支持）

## 通用约定

### Shadow DOM 样式隔离

所有组件均使用 **Shadow DOM**。外部 CSS 选择器默认**不会穿透**到组件内部，请通过：

- 组件公开 **CSS 变量**（`--yn-*` 前缀）
- 组件 **属性** 控制行为与基础样式

进行定制。可在宿主元素上设置 `style="--yn-button-bg: #22c55e"` 覆写变量。

### 属性绑定

在 Lit / 原生 JS 中，对象与数组属性需使用 **属性绑定**（`.` 前缀），而非字符串属性：

```html
<!-- Lit -->
<yn-navigation .items=${{ HOME: "/", ABOUT: "/about" }} active="HOME"></yn-navigation>

<!-- 原生 JS -->
el.items = { HOME: "/", ABOUT: "/about" };
```

布尔属性可用 `?attr=${true}`（Lit）或 `el.disabled = true`。

### 事件监听

自定义事件通过 `@event-name`（Lit）或 `addEventListener` 监听。本文档中 `detail` 指 `CustomEvent.detail` 结构；原生 DOM 事件（如 `click`）无 `detail` 字段。

### 主题样式

可选引入全局主题：

```ts
import "yn-web-component/theme.css";
```

---

## 组件文档

以下文档与组件实现、Storybook `argTypes` 保持一致。每个组件均标注 **按需导入路径**、**属性**、**事件**、**插槽**、**CSS 变量** 与 **公开方法**（如有）。

---

### yn-button

**标签名**：`yn-button`  
**类名**：`YnButton`  
**导入**：`yn-web-component/components/yn-button`  
**用途**：基础按钮，支持语义色 `variant`、尺寸 `size`、加载态、热区扩展与前后图标插槽。

#### 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `disabled` | `boolean` | `false` | 禁用，阻止点击 |
| `variant` | `"primary" \| "success" \| "warning" \| "danger" \| "neutral" \| "dark" \| "default"` | `"primary"` | 语义色主题 |
| `size` | `"mini" \| "small" \| "medium"` | `"medium"` | 尺寸（影响 padding 与 loading 图标大小） |
| `loading` | `boolean` | `false` | 加载态，禁用点击并展示 loading |
| `loading-type` | `"left" \| "center" \| "right"` | `"left"` | loading 图标相对文案的位置 |
| `hit-slop` | `boolean` | `true` | 是否在四周扩展 5px 可点击热区 |

#### 事件

| 事件 | 类型 | 说明 |
| --- | --- | --- |
| `click` | `MouseEvent` | 点击按钮时触发（`disabled` 或 `loading` 时不触发） |

#### 插槽

| 插槽 | 说明 |
| --- | --- |
| 默认插槽 | 按钮文案 |
| `prefix-icon` | 前缀图标 |
| `suffix-icon` | 后缀图标 |
| `loading` | 自定义 loading 内容（`loading=true` 时展示；动画需自行添加） |

#### CSS 变量

| 变量 | 说明 |
| --- | --- |
| `--yn-button-bg` | 背景色（默认由 `variant` 决定） |
| `--yn-button-hover-bg` | 悬停背景色 |
| `--yn-button-disabled-bg` | 禁用背景色 |
| `--yn-button-disabled-color` | 禁用文字色 |
| `--yn-button-radius` | 圆角 |
| `--yn-button-loading-size` | loading 图标尺寸（随 `size` 变化：14/16/18px） |

#### 示例

```html
<yn-button variant="primary" @click=${onClick}>
  <span slot="prefix-icon">★</span>
  保存
</yn-button>

<!-- 局部覆写颜色 -->
<yn-button
  variant="success"
  style="--yn-button-bg: #22c55e; --yn-button-hover-bg: #16a34a;"
>
  自定义成功色
</yn-button>
```

---

### yn-input

**标签名**：`yn-input`  
**类名**：`YnInput`  
**导入**：`yn-web-component/components/yn-input`  
**用途**：Floema 风格圆角输入框，可选前后置按钮插槽。

#### 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` | `""` | 当前输入值 |
| `placeholder` | `string` | `"请输入内容"` | 占位文案 |
| `disabled` | `boolean` | `false` | 禁用输入与按钮 |

#### 事件

| 事件 | `detail` | 说明 |
| --- | --- | --- |
| `yn-input` | `{ value: string }` | 输入内容变化 |
| `yn-prefix-click` | `{ value: string }` | 点击前置按钮 |
| `yn-suffix-click` | `{ value: string }` | 点击后置按钮 |

#### 插槽

| 插槽 | 说明 |
| --- | --- |
| `prefix-button` | 前置按钮图标；未传入则不渲染 |
| `suffix-button` | 后置按钮图标；未传入则不渲染 |

#### CSS 变量

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `--yn-input-width` | `320px` | 宽度 |
| `--yn-input-height` | `44px` | 高度 |
| `--yn-input-bg` | `rgba(255,255,255,0.62)` | 背景 |
| `--yn-input-bg-hover` | `rgba(255,255,255,0.86)` | 悬停背景 |
| `--yn-input-bg-focus` | `#fffaf2` | 聚焦背景 |
| `--yn-input-bg-disabled` | `rgba(232,225,214,0.76)` | 禁用背景 |
| `--yn-input-border-color` | `rgba(36,31,33,0.22)` | 边框色 |
| `--yn-input-border-color-hover` | `rgba(36,31,33,0.52)` | 悬停边框 |
| `--yn-input-border-color-focus` | `#241f21` | 聚焦边框 |
| `--yn-input-color` | `#241f21` | 文本色 |
| `--yn-input-placeholder-color` | `rgba(36,31,33,0.48)` | 占位色 |
| `--yn-input-disabled-color` | `rgba(36,31,33,0.42)` | 禁用文本色 |
| `--yn-input-focus-ring` | `rgba(36,31,33,0.12)` | 聚焦外圈 |
| `--yn-input-radius` | `999px` | 圆角 |
| `--yn-input-padding` | `0 14px` | 内边距 |
| `--yn-input-button-size` | `28px` | 按钮尺寸 |
| `--yn-input-button-color` | `#241f21` | 按钮图标色 |
| `--yn-input-button-bg-hover` | `rgba(36,31,33,0.08)` | 按钮悬停背景 |
| `--yn-input-font-family` | Zimula 等 | 字体 |
| `--yn-input-font-size` | `16px` | 字号 |
| `--yn-input-letter-spacing` | `-0.01em` | 字距 |

#### 示例

```html
<yn-input placeholder="搜索" @yn-input=${(e) => console.log(e.detail.value)}>
  <span slot="suffix-button"><!-- SVG 图标 --></span>
</yn-input>
```

#### Astro / SSR 首屏（Declarative Shadow DOM）

服务端用 **`renderYnInputShadowHtml`** 生成与组件一致的 Shadow 内容，浏览器在 `define.js` 加载前即可显示完整输入框。

**SSR 辅助 API**（`yn-web-component/ssr/yn-input`）：

| API | 说明 |
| --- | --- |
| `renderYnInputShadowHtml(options)` | 生成 DSD Shadow 内容（含共享样式） |

```ts
import { renderYnInputShadowHtml } from "yn-web-component/ssr/yn-input"

const shadowHtml = renderYnInputShadowHtml({
  placeholder: "搜索",
  value: "",
})
```

```html
<yn-input placeholder="搜索">
  <template shadowrootmode="open" set:html={shadowHtml} />
</yn-input>
```

---

### yn-navigation

**标签名**：`yn-navigation`  
**类名**：`YnNavigation`  
**导入**：`yn-web-component/components/yn-navigation`  
**用途**：胶囊式导航栏，支持受控切换或 SEO 链接模式。SSR 场景推荐 **DSD 视觉层 + light DOM `seo-fallback` 链接层** 双层结构。

#### 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `items` | `Record<string, string>` | 内置 4 项 | `key` 为展示文案，`value` 为路径或上下文标识 |
| `items-json` | `string` | — | SSR 用 JSON 字符串预注入 `items`（见下方 DSD 示例） |
| `active` | `string` | `"PRODUTOS"` | 当前激活项的 key；`seo-mode=true` 时 SSR 初始高亮 + 运行时 URL 匹配 |
| `seo-mode` | `boolean` | `false` | `true` 时渲染 `<a href>` 链接，不派发 `change` |
| `aria-label` | `string` | `"Primary navigation"` | 无障碍标签 |
| `hit-slop` | `boolean` | `false` | 是否扩大可点击热区 |

#### 事件

| 事件 | `detail` | 说明 |
| --- | --- | --- |
| `change` | `{ key: string; node: Record<string, string> }` | 切换导航项（仅 `seo-mode=false` 时触发） |

#### 插槽

| 插槽 | 说明 |
| --- | --- |
| `seo-fallback` | light DOM SEO 链接层（`<nav slot="seo-fallback">` → `ul` → `a href`）。建议配合 `YN_NAVIGATION_SEO_FALLBACK_LIGHT_STYLES` 视觉隐藏，链接仍留在 HTML 源码中供爬虫抓取。 |

#### CSS 变量

| 变量 | 说明 |
| --- | --- |
| `--yn-navigation-fill-color` | 背景填充色 |
| `--yn-navigation-text-color` | 普通文本色 |
| `--yn-navigation-active-text-color` | 激活项文本色 |
| `--yn-navigation-indicator-color` | 激活圆点颜色 |
| `--yn-navigation-focus-color` | 键盘 focus 描边色 |
| `--yn-navigation-glow-color` | 发光效果中心色 |
| `--yn-navigation-glow-fade` | 发光渐隐色 |

#### 示例

```html
<!-- 受控模式 -->
<yn-navigation
  .items=${{ HOME: "/", ABOUT: "/about" }}
  active="HOME"
  @change=${(e) => { active = e.detail.key; }}
></yn-navigation>

<!-- SEO 链接模式 -->
<yn-navigation
  seo-mode
  .items=${{ Home: "/home", Products: "/products" }}
  aria-label="Primary navigation"
></yn-navigation>
```

#### Astro / SSR 首屏（Declarative Shadow DOM + SEO 链接层）

服务端用 **`renderYnNavigationShadowHtml`** 生成与组件一致的 Shadow 内容，浏览器在 `define.js` 加载前即可显示完整导航。同时在 light DOM 保留 **`slot="seo-fallback"`** 真实链接，供不解析 Shadow DOM 的爬虫使用。

**SSR 辅助 API**（`yn-web-component/ssr/yn-navigation`）：

| 导出 | 说明 |
| --- | --- |
| `renderYnNavigationShadowHtml(options)` | 生成 DSD Shadow 内容（含 `<slot name="seo-fallback">`） |
| `renderYnNavigationSeoFallbackHtml(options)` | 生成带 `slot="seo-fallback"` 的 `<nav>` 链接 HTML（可选，也可手写 Astro 模板） |
| `YN_NAVIGATION_SEO_FALLBACK_LIGHT_STYLES` | light DOM 视觉隐藏样式，写入页面 `<style>` |
| `YN_NAVIGATION_SEO_FALLBACK_CLASS` | 隐藏层 class 名（`yn-navigation-seo-fallback`） |

```astro
---
import {
  renderYnNavigationShadowHtml,
  YN_NAVIGATION_SEO_FALLBACK_LIGHT_STYLES,
} from "yn-web-component/ssr/yn-navigation"

const items = [
  { label: "首页", href: "/zh/" },
  { label: "系列", href: "/zh/collections" },
]
const itemsJson = JSON.stringify(Object.fromEntries(items.map(({ label, href }) => [label, href])))
const shadowHtml = renderYnNavigationShadowHtml({
  items,
  activeLabel: "首页",
  seoMode: true,
})
---
<style is:global set:html={YN_NAVIGATION_SEO_FALLBACK_LIGHT_STYLES}></style>

<yn-navigation seo-mode items-json={itemsJson} active="首页">
  <template shadowrootmode="open" set:html={shadowHtml} />
  <nav slot="seo-fallback" class="yn-navigation-seo-fallback" aria-label="站点导航">
    <ul>
      <li><a href="/zh/" aria-current="page">首页</a></li>
      <li><a href="/zh/collections">系列</a></li>
    </ul>
  </nav>
</yn-navigation>
```

> **双层分工**：DSD / Shadow 负责首屏视觉与交互；`seo-fallback` 在 light DOM 保留真实 `<a href>`。`items-json` 与两层链接的 `href` 需保持一致。

---

### yn-search

**标签名**：`yn-search`  
**类名**：`YnSearch`  
**导入**（推荐按需）：`yn-web-component/components/yn-search`  
**用途**：可展开/收起的搜索框，支持原生 `datalist` 候选项。

> **样式隔离**：组件使用 Shadow DOM，外部样式默认不穿透；请通过下方 CSS 变量定制外观。

#### 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `input-width` | `number` | `514` | 输入区域宽度（px，最小 80） |
| `placeholder` | `string` | `"O que estás à procura?"` | 占位文案 |
| `disabled` | `boolean` | `false` | 禁用交互 |
| `close` | `boolean` | `true` | 关闭行为：`true` 时有值首次点击仅清空并派发 `input`，无值再收起；`false` 时点击即清空并收起 |
| `open` | `boolean` | `false` | 是否默认展开；`true` 时初始为展开态（无入场动画） |
| `expand-direction` | `"left" \| "right"` | `"right"` | 展开方向：`right` 向右展开并顶开右侧兄弟元素；`left` 向左展开并顶开左侧兄弟元素 |

#### 展开尺寸

展开总宽度 = **44（按钮区）+ 10（间距）+ input-width**（`input-width` 参与计算时最小按 80 处理）。

#### 事件

| 事件 | `detail` | 说明 |
| --- | --- | --- |
| `input` | `{ value: string }` | 输入内容变化（含清空时 `{ value: "" }`） |
| `enter` | `{ value: string }` | 按下回车键 |

#### 插槽

| 插槽 | 说明 |
| --- | --- |
| 默认插槽 | 传入 `<datalist><option value="...">` 提供原生候选项 |

#### CSS 变量

| 变量 | 说明 | 默认值 |
| --- | --- | --- |
| `--yn-search-bg-active` | 展开/悬停时壳层背景色 | `rgba(255, 255, 255, 0.96)` |
| `--yn-search-bg-idle` | 收起时壳层背景色 | `transparent` |
| `--yn-search-field-bg` | 输入框背景色（建议与壳层一致） | `var(--bg-fill)` |
| `--yn-search-icon-color` | 搜索/关闭图标颜色 | `#241f21` |
| `--yn-search-field-color` | 输入文字颜色 | `rgba(36, 31, 33, 0.7)` |
| `--yn-search-caret-color` | 光标颜色 | `#241f21` |
| `--yn-search-placeholder-color` | 占位符颜色 | `rgba(36, 31, 33, 0.6)` |
| `--yn-search-fill-duration` | 背景 fill/stroke 过渡时长 | `220ms` |
| `--yn-search-fill-ease` | 背景 fill/stroke 过渡曲线 | `cubic-bezier(0.4, 0, 1, 1)` |
| `--yn-search-icon-duration` | 图标切换过渡时长 | `220ms` |
| `--yn-search-icon-ease` | 图标切换过渡曲线 | `cubic-bezier(0.4, 0, 1, 1)` |

#### 示例

**按需导入（推荐 Tree Shaking）**

```ts
import "yn-web-component/components/yn-search";
// 或
import { YnSearch } from "yn-web-component/components/yn-search";
```

**基础用法 + datalist**

```html
<yn-search
  input-width="240"
  placeholder="搜索商品"
  style="--yn-search-field-bg: var(--bg-fill);"
  @input=${(e) => console.log(e.detail.value)}
  @enter=${(e) => search(e.detail.value)}
>
  <datalist>
    <option value="Sofa"></option>
    <option value="Chair"></option>
  </datalist>
</yn-search>
```

**向右展开，顶开右侧导航项（flex 布局）**

```html
<div style="display:flex;align-items:center;gap:12px;width:fit-content;">
  <yn-search expand-direction="right" input-width="240"></yn-search>
  <button type="button">Cart</button>
  <span>Menu</span>
</div>
```

**向左展开，顶开左侧 Brand（右对齐容器）**

```html
<div style="display:flex;align-items:center;justify-content:flex-end;gap:12px;width:fit-content;margin-left:auto;">
  <span>Brand</span>
  <yn-search expand-direction="left" input-width="240"></yn-search>
</div>
```

**默认展开（无入场动画）**

```html
<yn-search open input-width="240"></yn-search>
```

**两步关闭（`close` 默认 `true`）**

展开后输入内容时：首次点击关闭按钮仅清空并派发 `input`；再次点击才播放收起动画。若希望点击即收起，设置 `close="false"`。

---

### yn-cookie-notice

**标签名**：`yn-cookie-notice`  
**类名**：`YnCookieNotice`  
**导入**（推荐按需）：`yn-web-component/components/yn-cookie-notice`  
**用途**：Cookie 同意横幅，支持接受/拒绝全部、分类偏好设置，并将同意结果写入 `document.cookie`。可监听 `preference-change` 对接 Google Consent Mode 等广告合规逻辑。

> **样式隔离**：组件使用 Shadow DOM，外部样式默认不穿透；请通过 CSS 变量定制外观。

#### 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `storage-key` | `string` | `"cookie_consent_v1"` | 同意记录 Cookie 键名 |
| `auto-show-delay` | `number` | `800` | 无历史同意时自动显示延迟（ms） |
| `auto-show` | `boolean` | `true` | 是否自动弹出 |
| `visible` | `boolean` | `false` | 是否显示横幅 |
| `max-age` | `number` | `31536000` | Cookie Max-Age（秒） |
| `default-functional` | `boolean` | `false` | 默认 Functional 勾选 |
| `default-analytics` | `boolean` | `false` | 默认 Analytics 勾选 |
| `default-marketing` | `boolean` | `true` | 默认 Marketing 勾选 |
| `title` | `string` | `"We use cookies to improve your experience"` | 标题（可被插槽覆盖） |
| `policy-line-1` | `string` | `"By continuing, you"` | 政策文案第一行 |
| `policy-line-2` | `string` | `"cookie policy."` | 政策文案第二行 |

#### 事件

| 事件 | `detail` | 说明 |
| --- | --- | --- |
| `preference-change` | `{ prefs, source, changedKey }` | 偏好变化；`source` 含 `accept-all` / `reject-all` / `save` / `checkbox-change` 等 |

#### 插槽

| 插槽 | 说明 |
| --- | --- |
| `title` | 自定义标题 |
| `policy` | 自定义政策说明 |

#### 公开方法

| 方法 | 说明 |
| --- | --- |
| `show()` | 显示横幅 |
| `hide()` | 隐藏横幅 |
| `openSettings()` | 显示并展开偏好设置 |
| `resetConsent()` | 清除同意记录并重新显示 |
| `getPreferences()` | 读取当前偏好 |
| `setPreferences(prefs)` | 设置表单偏好（不写 Cookie） |

#### CSS 变量

| 变量 | 说明 | 默认值 |
| --- | --- | --- |
| `--yn-cookie-notice-bg` | 横幅背景 | `#fff` |
| `--yn-cookie-notice-border-color` | 外边框色 | `#eedfdf` |
| `--yn-cookie-notice-accent-color` | 政策强调色 | `#ed3833` |
| `--yn-cookie-notice-z-index` | 层级 | `1000` |
| `--yn-cookie-notice-bottom` / `--yn-cookie-notice-right` | 定位 | 响应式 em 值 |
| `--yn-cookie-notice-width` | 横幅宽度 | 响应式 em 值 |

#### 示例

```ts
import "yn-web-component/components/yn-cookie-notice";
```

```html
<yn-cookie-notice
  storage-key="cookie_consent_v1"
  @preference-change=${(e) => {
    const { functional, analytics, marketing } = e.detail.prefs;
    // 对接 gtag('consent', 'update', { ... })
  }}
></yn-cookie-notice>
```

---

### yn-group-pick

**标签名**：`yn-group-pick`  
**类名**：`YnGroupPick`  
**导入**：`yn-web-component/components/yn-group-pick`  
**用途**：选项组容器，配合子组件 `yn-pick` 实现单选或多选。

#### 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `string \| number \| Array<string \| number>` | `""` | 当前选中值（回显） |
| `multiple` | `boolean` | `false` | 是否多选 |
| `selected-icon` | `string` | 内置勾选 SVG | 组级默认选中图标 |
| `unselected-icon` | `string` | `""` | 组级默认未选中图标 |
| `show-unselected-icon` | `boolean` | `false` | 组级默认是否在未选中时显示图标 |

> **优先级**：子 `yn-pick` 上显式设置的 `selected-icon` / `unselected-icon` / `show-unselected-icon` **优先于**组级默认值。

#### 事件

| 事件 | `detail` | 说明 |
| --- | --- | --- |
| `change` | `{ ids: Array<string \| number>; flag: boolean }` | 点击任意子项时触发；`flag` 为当前点击项的选中状态 |

#### 插槽

| 插槽 | 说明 |
| --- | --- |
| 默认插槽 | 放置 `yn-pick` 子项列表 |

#### CSS 变量

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `--yn-group-pick-gap` | `12px` | 选项间距 |

#### 示例

```html
<yn-group-pick multiple .value=${["A", "B"]} @change=${onChange}>
  <yn-pick value="A">选项 A</yn-pick>
  <yn-pick value="B">选项 B</yn-pick>
</yn-group-pick>
```

---

### yn-pick

**标签名**：`yn-pick`  
**类名**：`YnPick`  
**导入**：`yn-web-component/components/yn-pick`  
**用途**：单个可选项，可独立使用或作为 `yn-group-pick` / `yn-dropdown-pick` 的子项。

#### 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `string \| number` | `""` | 选项唯一标识 |
| `selected` | `boolean` | `false` | 是否选中 |
| `border` | `boolean` | `true` | 是否显示覆盖边框动画 |
| `selected-icon` | `string` | 内置勾选 SVG | 选中态图标 |
| `unselected-icon` | `string` | 内置描边圆环 SVG | 未选中态图标 |
| `show-unselected-icon` | `boolean` | `false` | 未选中时是否显示图标 |

#### 事件

| 事件 | `detail` | 说明 |
| --- | --- | --- |
| `toggle` | `{ id: string \| number; flag: boolean }` | 点击选项；`flag` 为点击后的选中状态 |

#### 插槽

| 插槽 | 说明 |
| --- | --- |
| 默认插槽 | 选项内容（任意 HTML） |

#### CSS 变量

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `--yn-pick-border-width` | `2px` | 边框宽度 |
| `--yn-pick-border-color` | `#241f21` | 边框颜色 |
| `--yn-pick-border-radius` | `8px` | 圆角 |

#### 示例

```html
<yn-pick value="nature" ?selected=${true} @toggle=${onToggle}>
  <div>Nature</div>
</yn-pick>
```

---

### yn-dropdown

**标签名**：`yn-dropdown`  
**类名**：`YnDropdown`  
**导入**：`yn-web-component/components/yn-dropdown`  
**用途**：通用下拉弹层。默认插槽为触发器，`content` 插槽为面板内容。

#### 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `placement` | 12 方向枚举 | `"bottom-start"` | 弹层固定弹出方向（当前不自动翻转） |
| `open` | `boolean` | `false` | 受控展开状态 |
| `offset` | `number` | `12` | 触发器与弹层间距（px） |
| `motion-distance` | `number` | `14` | 触发器文本/关闭图标位移（px） |
| `panel-open-distance` | `number` | `16` | 弹层打开位移（px） |
| `panel-close-distance` | `number` | `20` | 弹层关闭位移（px） |
| `viewport-padding` | `number` | `12` | 保留字段，当前不参与定位 |
| `auto-flip` | `boolean` | `false` | 保留字段，当前不参与方向计算 |
| `close-on-outside-click` | `boolean` | `true` | 点击外部是否关闭 |

`placement` 可选值：`top-start` / `top` / `top-end` / `bottom-start` / `bottom` / `bottom-end` / `left-start` / `left` / `left-end` / `right-start` / `right` / `right-end`

#### 事件

| 事件 | `detail` | 说明 |
| --- | --- | --- |
| `open-change` | `{ open: boolean; placement: YnDropdownPlacement }` | 展开状态变化 |

#### 插槽

| 插槽 | 说明 |
| --- | --- |
| 默认插槽 | 触发器（如 `yn-button`） |
| `content` | 下拉面板内容 |
| `close-icon` | 关闭图标；未提供时使用内置 SVG |

#### 公开方法

| 方法 | 说明 |
| --- | --- |
| `close()` | 主动关闭弹层 |

#### CSS 变量

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `--yn-dropdown-panel-min-width` | `280px` | 面板最小宽度 |
| `--yn-dropdown-panel-radius` | `12px` | 面板圆角 |
| `--yn-dropdown-panel-padding` | `12px` | 面板内边距 |
| `--yn-dropdown-panel-shadow` | `0 12px 36px rgba(36,31,33,0.18)` | 面板阴影 |

#### 示例

```html
<yn-dropdown placement="bottom-start" @open-change=${onOpenChange}>
  <yn-button>筛选</yn-button>
  <div slot="content">面板内容</div>
</yn-dropdown>
```

---

### yn-dropdown-pick

**标签名**：`yn-dropdown-pick`  
**类名**：`YnDropdownPick`  
**导入**：`yn-web-component/components/yn-dropdown-pick`  
**用途**：独立下拉单选器。通过插槽传入 `yn-pick` 列表，选中后自动收起。

#### 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `string \| number` | `""` | 当前选中值 |
| `value-field` | `string` | `"id"` | 节点数据中的值字段名 |
| `button-display-field` | `string` | `"label"` | 按钮上展示的字段名 |
| `placeholder` | `string` | `"Select"` | 未选中时的占位文案 |
| `close-on-outside-click` | `boolean` | `true` | 点击外部关闭 |
| `disabled` | `boolean` | `false` | 禁用 |
| `button-bg` | `string` | `#f8f6f2` | 收起态按钮背景 |
| `button-color` | `string` | `#241f21` | 收起态文字色 |
| `open-button-bg` | `string` | `#241f21` | 展开态按钮背景 |
| `open-button-color` | `string` | `#ffffff` | 展开态文字色 |
| `panel-min-width` | `string` | `132px` | 面板最小宽度 |
| `show-selected-icon` | `boolean` | `true` | 选中项右侧是否显示勾选图标 |

#### 事件

| 事件 | `detail` | 说明 |
| --- | --- | --- |
| `change` | `{ id: string \| number \| ""; node: Record<string, unknown> \| null }` | 选中值变化 |
| `open-change` | `{ open: boolean }` | 展开状态变化 |

#### 插槽

| 插槽 | 说明 |
| --- | --- |
| 默认插槽 | `yn-pick` 列表；建议每项设置 `data-node` JSON 属性携带完整节点数据 |

#### CSS 变量

| 变量 | 说明 |
| --- | --- |
| `--yn-dropdown-pick-panel-bg` | 面板背景 |
| `--yn-dropdown-pick-panel-radius` | 面板圆角 |
| `--yn-dropdown-pick-panel-padding` | 面板内边距 |
| `--yn-dropdown-pick-gap` | 选项垂直间距 |

#### 示例

```html
<yn-dropdown-pick
  value="en"
  button-display-field="code"
  placeholder="Language"
  @change=${onChange}
>
  <yn-pick value="en" data-node='{"id":"en","code":"EN","label":"English"}'>
    English
  </yn-pick>
  <yn-pick value="zh" data-node='{"id":"zh","code":"ZH","label":"中文"}'>
    中文
  </yn-pick>
</yn-dropdown-pick>
```

---

### yn-drawer

**标签名**：`yn-drawer`  
**类名**：`YnDrawer`  
**导入**：`yn-web-component/components/yn-drawer`  
**用途**：基于原生 Popover API 的抽屉，响应式支持右侧滑出或底部弹出。

#### 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `open` | `boolean` | `false` | 受控开关 |
| `width` | `number` | `420` | 抽屉宽度（px，最小 260） |
| `title` | `string` | `""` | 标题文案；`header` 插槽为空时作为回退 |
| `close-on-backdrop` | `boolean` | `true` | 点击遮罩是否关闭 |
| `placement` | `"auto" \| "right" \| "bottom"` | `"auto"` | 弹出方向 |
| `sheet-height` | `string` | `"90vh"` | 底部弹出时的高度；`auto` 随内容自适应 |

#### 事件

生命周期事件均携带 `detail`：

```ts
{
  open: boolean;
  source: "trigger" | "close-button" | "backdrop" | "escape" | "api" | ...;
  payload?: unknown;        // 触发器上的 drawer-payload
  triggerPayload?: unknown; // 触发器上的 trigger-payload
}
```

| 事件 | 说明 |
| --- | --- |
| `open-change` | 开关状态变化 |
| `before-open` | 打开前；可 `event.preventDefault()` 阻止 |
| `after-open` | 打开动画完成 |
| `before-close` | 关闭前；可 `event.preventDefault()` 阻止 |
| `after-close` | 关闭动画完成 |

#### 插槽

| 插槽 | 说明 | 优先级 |
| --- | --- | --- |
| `trigger` | 触发器；支持 `drawer-payload` / `trigger-payload` / `data-drawer-payload` 传参 | 未提供时使用内置按钮 |
| `header` | 自定义头部 | **优先于** `title` 属性 |
| `header-actions` | 头部右侧操作区 | — |
| `content` | 主体内容 | — |
| `footer` | 底部区域 | — |
| `backdrop-extra` | 宽屏（≥1024px）右侧抽屉时，遮罩左侧扩展区内容 | 窄屏自动隐藏 |

#### 公开方法

| 方法 | 说明 |
| --- | --- |
| `show(payload?)` | 打开抽屉，`payload` 透传到生命周期事件 |
| `close(payload?)` | 关闭抽屉 |
| `toggle(payload?)` | 切换开关 |

#### CSS 变量

| 变量 | 说明 |
| --- | --- |
| `--yn-drawer-z-index` | 层级（默认 `1500`） |
| `--yn-drawer-bg` | 面板背景 |
| `--yn-drawer-shadow` | 面板阴影 |
| `--yn-drawer-backdrop` | 遮罩颜色 |
| `--yn-drawer-header-border` | 头部下边框 |
| `--yn-drawer-footer-border` | 底部上边框 |
| `--yn-drawer-title-color` | 标题颜色 |
| `--yn-drawer-close-color` | 关闭按钮颜色 |
| `--yn-drawer-close-hover-bg` | 关闭按钮悬停背景 |
| `--yn-drawer-content-color` | 正文颜色 |
| `--yn-drawer-footer-bg` | 底部背景 |
| `--yn-drawer-open-duration` | 打开动画时长 |
| `--yn-drawer-close-duration` | 关闭动画时长 |
| `--yn-drawer-open-ease` | 打开缓动曲线 |
| `--yn-drawer-close-ease` | 关闭缓动曲线 |
| `--yn-drawer-body-padding` | 内容区内边距 |
| `--yn-drawer-sheet-height` | 底部弹出高度（由 `sheet-height` 同步） |
| `--yn-drawer-width` | 面板宽度（由 `width` 属性写入） |
| `--yn-drawer-mobile-radius` | 移动端圆角 |
| `--yn-drawer-breakpoint` | 响应式断点（默认 `1024px`） |

#### 示例

```html
<yn-drawer placement="auto" sheet-height="auto" @open-change=${onOpenChange}>
  <yn-button slot="trigger" drawer-payload='{"scene":"cart"}'>购物车</yn-button>
  <span slot="header">Your bag</span>
  <div slot="content">内容区域</div>
  <div slot="footer">底部操作</div>
</yn-drawer>
```

---

### yn-toast

**标签名**：`yn-toast`  
**类名**：`YnToast`  
**导入**：`yn-web-component/components/yn-toast`  
**用途**：灵动岛风格顶部反馈。支持 loading → 状态形变动画，以及异步 callback 模式。

#### 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `type` | `"success" \| "info" \| "warning" \| "error"` | `"success"` | 默认提示类型 |
| `message` | `string` | `""` | 默认文案（支持可信 HTML 片段） |
| `duration` | `number` | `2600` | 最终态展示时长（ms） |
| `loading-duration` | `number` | `1400` | loading 阶段时长（ms） |
| `persist` | `boolean` | `false` | 是否保持最终态不自动关闭 |

#### 事件

| 事件 | `detail` | 说明 |
| --- | --- | --- |
| `show` | `{ type, message, source }` | 调用 `show()` 后触发 |
| `close` | `{ type, message, source }` | 关闭时触发；`source` 可为 `api` / `swipe` / `timer` / `property` |

#### 公开方法

| 方法 | 说明 |
| --- | --- |
| `show(type?, message?, options?)` | 展示提示；第三参数 `{ duration, loadingDuration, persist }` |
| `show(callback, mask?)` | 异步任务模式；callback 内调用 `instance.done(type, message)`；`await` 返回 callback 结果 |
| `success(message?, options?)` | 快捷展示 success |
| `info(message?, options?)` | 快捷展示 info |
| `warning(message?, options?)` | 快捷展示 warning |
| `error(message?, options?)` | 快捷展示 error |
| `success(callback, mask?)` 等 | 快捷 callback 模式；`instance.done(message)` 完成 |
| `done(type, message?, options?)` | 外部完成 loading 阶段 |
| `hide(source?)` | 主动关闭 |

#### CSS 变量

| 变量 | 说明 |
| --- | --- |
| `--yn-toast-top` | 距顶部距离 |
| `--yn-toast-z-index` | 层级 |
| `--yn-toast-height` | 胶囊高度 |
| `--yn-toast-bg` | 背景色 |
| `--yn-toast-text-color` | 文本/弧线颜色 |
| `--yn-toast-success-color` | success 状态球色 |
| `--yn-toast-info-color` | info 状态球色 |
| `--yn-toast-warning-color` | warning 状态球色 |
| `--yn-toast-error-color` | error 状态球色 |
| `--yn-toast-paper-color` | 状态图标线条色 |
| `--yn-toast-max-width` | 最大宽度 |
| `--yn-toast-message-padding` | 消息区内边距 |
| `--yn-toast-message-font-size` | 消息字号 |
| `--yn-toast-message-letter-spacing` | 消息字距 |
| `--yn-toast-mask-bg` | callback 模式遮罩背景 |
| `--yn-toast-shadow` | 阴影 |

#### 示例

```html
<yn-toast id="toast"></yn-toast>

<script type="module">
  const toast = document.getElementById("toast");

  // 普通提示
  toast.success("保存成功");

  // 异步 callback 模式
  await toast.success(async (instance) => {
    await saveData();
    instance.done("保存成功");
  }, true); // 第二参数 true 显示遮罩
</script>
```

---

### yn-icon-connect-button

**标签名**：`yn-icon-connect-button`  
**类名**：`YnIconConnectButton`  
**导入**：`yn-web-component/components/yn-icon-connect-button`  
**用途**：带图标连接动画的按钮或链接，视觉风格参考 Floema。

#### 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `label` | `string` | `"VER PRODUTOS URBAN"` | 按钮文案（插槽回退） |
| `size` | `"mini" \| "small" \| "normal"` | `"normal"` | 尺寸 |
| `icon` | `string` | 内置 SVG | 图标 HTML（插槽回退） |
| `uppercase` | `boolean` | `true` | 是否默认大写 |
| `link` | `string` | `""` | 有值时渲染 `<a>`，无值时渲染 `<button>` |
| `disabled` | `boolean` | `false` | 禁用 |

#### 事件

| 事件 | 类型 | 说明 |
| --- | --- | --- |
| `click` | `MouseEvent` | 点击时触发 |

#### 插槽

| 插槽 | 说明 | 优先级 |
| --- | --- | --- |
| `icon` | 自定义图标 | **优先于** `icon` 属性 |
| `label` | 自定义文案 | **优先于** `label` 属性 |

#### CSS 变量

| 变量 | 说明 |
| --- | --- |
| `--yn-icon-connect-button-bg` | 背景色 |
| `--yn-icon-connect-button-color` | 文本/图标颜色 |

#### 示例

```html
<yn-icon-connect-button label="查看产品" size="normal">
  <svg slot="icon" viewBox="0 0 24 24">...</svg>
</yn-icon-connect-button>
```

---

### yn-pull-cord-switch

**标签名**：`yn-pull-cord-switch`  
**类名**：`YnPullCordSwitch`  
**导入**：`yn-web-component/components/yn-pull-cord-switch`  
**用途**：抽绳开关交互。基于 Verlet 绳物理模拟，支持 fixed 吸顶模式与双插槽内容切换。

> 组件不绘制区域背景。内嵌用法需在外层容器调用 `applyPullCordShellBackground()` 同步背景色。

#### 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `checked` | `boolean` | `false` | 开关状态 |
| `glow-up` | `boolean` | `false` | 开启且 checked 时顶灯向上扩散 |
| `disabled` | `boolean` | `false` | 禁用拖拽 |
| `fixed` | `boolean` | `false` | 吸附视口顶部 |
| `fixed-x` | `number` | 居中 | 水平偏移（可为负值，hover 时露出） |
| `top` | `number` | `0` | 距顶部距离（可为负值） |
| `reverse` | `boolean` | `false` | `fixed-x` 是否自右侧起算 |
| `variant` | `"default" \| "floema"` | `"default"` | 视觉变体 |
| `size` | `"mini" \| "small" \| "medium"` | `"mini"` | 卡片/绳粗细（不控制绳长） |
| `rope-length` | `number` | `260` | 绳长（px） |
| `card-offset` | `number` | 随绳长缩放 | 绳头到卡片的间距（可为负值） |
| `z-index` | `number` | `1` | 层级，写入 `--yn-pull-cord-switch-z-index` |
| `toggle-threshold` | `number` | 随绳长缩放 | 拉动切换阈值（px） |

#### 事件

| 事件 | `detail` | 说明 |
| --- | --- | --- |
| `change` | `{ checked: boolean }` | 拉过阈值切换状态时 |
| `fixed-move` | `{ x: number; reverse: boolean }` | fixed 模式水平拖动结束时 |

#### 插槽

| 插槽 | 说明 | 优先级 |
| --- | --- | --- |
| 默认插槽 | 关闭态（`checked=false`）绳端内容，推荐 `yn-button` | 无插槽时显示内置 ON/OFF |
| `activated` | 开启态（`checked=true`）绳端内容 | 与默认插槽按状态切换 |

#### CSS 变量

| 变量 | 说明 |
| --- | --- |
| `--yn-pull-cord-switch-z-index` | 层级 |
| `--yn-pull-cord-switch-anchor-y` | 锚点额外下移比例 |
| `--yn-pull-cord-switch-glow-up-bleed` | glow-up 画布向上延展 |
| `--yn-pull-cord-switch-slot-transition-duration` | 双插槽切换动画时长 |
| `--yn-pull-cord-switch-fixed-peek-transition-duration` | 负值 peek 动画时长 |
| `--yn-pull-cord-switch-slot-button-scale` | 插槽内按钮缩放 |
| `--yn-pull-cord-switch-accent` | 灯光强调色（随 `variant` 变化） |

#### 示例

```html
<yn-pull-cord-switch
  ?checked=${false}
  rope-length="260"
  @change=${(e) => console.log(e.detail.checked)}
>
  <yn-button>夜间</yn-button>
  <yn-button slot="activated" variant="success">日间</yn-button>
</yn-pull-cord-switch>
```

---

### yn-quantity

**标签名**：`yn-quantity`  
**类名**：`YnQuantity`  
**导入**：`yn-web-component/components/yn-quantity`  
**用途**：Floema 风格数量选择器（减号 / 数字输入 / 加号）。

#### 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `number` | `1` | 当前数量 |
| `min` | `number` | `1` | 最小值 |
| `max` | `number` | `99` | 最大值 |
| `step` | `number` | `1` | 步进值 |
| `disabled` | `boolean` | `false` | 禁用 |

#### 事件

| 事件 | `detail` | 说明 |
| --- | --- | --- |
| `change` | `{ value: number }` | 数量变化 |

#### CSS 变量

| 变量 | 说明 |
| --- | --- |
| `--yn-quantity-width` | 宽度 |
| `--yn-quantity-height` | 高度 |
| `--yn-quantity-bg` | 背景 |
| `--yn-quantity-bg-hover` | 悬停背景 |
| `--yn-quantity-bg-focus` | 聚焦背景 |
| `--yn-quantity-border-color` | 边框色 |
| `--yn-quantity-border-color-hover` | 悬停边框 |
| `--yn-quantity-border-color-focus` | 聚焦边框 |
| `--yn-quantity-focus-ring` | 聚焦外圈 |
| `--yn-quantity-color` | 数字/图标色 |
| `--yn-quantity-muted-color` | 禁用按钮色 |
| `--yn-quantity-divider-color` | 分隔线颜色 |
| `--yn-quantity-button-size` | 按钮尺寸 |
| `--yn-quantity-button-bg-hover` | 按钮悬停背景 |
| `--yn-quantity-button-bg-active` | 按钮按下背景 |
| `--yn-quantity-button-hover-radius` | 按钮悬停圆角 |
| `--yn-quantity-inner-gap` | 内部间距 |
| `--yn-quantity-padding` | 内边距 |
| `--yn-quantity-radius` | 圆角 |
| `--yn-quantity-font-family` | 字体 |
| `--yn-quantity-font-size` | 字号 |
| `--yn-quantity-letter-spacing` | 字距 |
| `--yn-quantity-value-min-width` | 数字区最小宽度 |

#### 示例

```html
<yn-quantity .value=${1} .min=${1} .max=${99} @change=${onChange}></yn-quantity>
```

#### Astro / SSR 首屏（Declarative Shadow DOM）

**SSR 辅助 API**（`yn-web-component/ssr/yn-quantity`）：

| API | 说明 |
| --- | --- |
| `renderYnQuantityShadowHtml(options)` | 生成 DSD Shadow 内容（减号/数字/加号首帧） |

```ts
import { renderYnQuantityShadowHtml } from "yn-web-component/ssr/yn-quantity"

const shadowHtml = renderYnQuantityShadowHtml({ value: 1, min: 1, max: 99 })
```

```html
<yn-quantity value="1" min="1" max="99">
  <template shadowrootmode="open" set:html={shadowHtml} />
</yn-quantity>
```

---

### yn-checkout-address

**标签名**：`yn-checkout-address`  
**类名**：`YnCheckoutAddress`  
**导入**：`yn-web-component/components/yn-checkout-address`  
**用途**：跨境独立站结账地址表单。数据源按优先级自动降级：

**Google API Key** → **dr5hn CDN** → **Photon** → **manual 手动填写**

表单分步展示（先选地区，再填联系方式与详细地址）。运行中若 dr5hn 搜索失败会降级 Photon；Photon 仍失败则切至 manual。

#### 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `dev` | `boolean` | `false` | 显示 JSON 调试面板 |
| `disabled` | `boolean` | `false` | 禁用表单 |
| `locale` | `"en" \| "zh-CN"` | `"en"` | 界面语言 |
| `google-maps-api-key` | `string` | `""` | Google Maps API Key；变更会重新探测数据源 |
| `excludeRegions` | `YnCheckoutExcludeRegions` | — | 排除指定国家/州/城市 |
| `includeCountries` | `string[]` | — | 仅允许的国家 ISO2 列表 |
| `value` | `YnCheckoutAddressValue \| null` | `null` | 受控回显；绑定后不会重新探测 |
| `messages` | `Partial<YnCheckoutAddressMessages>` | — | 局部文案覆盖 |
| `show-email` | `boolean` | `false` | 是否展示邮箱输入 |
| `email-required` | `boolean` | `false` | 邮箱是否必填 |
| `show-whatsapp` | `boolean` | `false` | 是否展示 WhatsApp 输入 |
| `whatsapp-required` | `boolean` | `false` | WhatsApp 是否必填（6–15 位数字） |

#### 事件

| 事件 | `detail` | 说明 |
| --- | --- | --- |
| `change` | `YnCheckoutAddressChangeDetail` | 地址任意字段变化 |

`change.detail` 结构：

```ts
{
  value: YnCheckoutAddressValue;       // 当前地址快照
  validation: {
    valid: boolean;                    // 硬校验是否通过（提交前应为此 true）
    regionComplete: boolean;           // 配送地区是否已确认
    formReady: boolean;                // 软就绪（可预启用下单按钮）
    errors: YnCheckoutAddressValidationError[];
  };
  changedFields: YnCheckoutAddressValueKey[]; // 相对上次 change 变更的字段
}
```

`YnCheckoutAddressValue` 主要字段：`provider`、`countryCode`、`countryName`、`stateCode`、`stateName`、`cityName`、`phonecode`、`phoneNumber`、`firstName`、`lastName`、`email`、`whatsapp`、`line1`、`line2`、`postalCode`、`notes` 等。

#### 公开方法

| 方法 | 返回 | 说明 |
| --- | --- | --- |
| `validate()` | `YnCheckoutAddressValidateResult` | 执行校验，不修改 UI |
| `reportValidity()` | `boolean` | 标红无效字段并聚焦首项；`true` 通过，`false` 未通过 |
| `setValue(value)` | `void` | 编程式回显/清空；不重新探测、不触发搜索 |

#### CSS 变量

| 变量 | 说明 |
| --- | --- |
| `--yn-checkout-address-bg` | 组件背景 |
| `--yn-checkout-address-bg-muted` | 页面底衬色 |
| `--yn-checkout-address-primary` | 主色 |
| `--yn-checkout-address-outline` | 输入框描边 |
| `--yn-checkout-address-label` | 标签颜色 |
| `--yn-checkout-address-padding` | 内容区内边距 |
| `--yn-checkout-address-field-height` | 输入框高度 |
| `--yn-checkout-address-radius` | 圆角 |
| `--yn-checkout-address-surface` | 卡片表面色 |
| `--yn-checkout-address-card-bg` | 卡片背景 |
| `--yn-checkout-address-color` | 正文颜色 |

#### 示例

```html
<yn-checkout-address
  locale="zh-CN"
  .value=${address}
  show-email
  email-required
  @change=${(e) => { address = e.detail.value; }}
></yn-checkout-address>

<script>
  // 提交前校验
  if (!addressEl.reportValidity()) return;
  const { valid, value } = addressEl.validate();
  if (!valid) return;
  submitOrder({ shippingAddress: value });
</script>
```

主入口还导出校验工具：`validateCheckoutAddress`、`emptyCheckoutAddressValue`、`POSTAL_REQUIRED_COUNTRIES` 等。

---

### yn-sku-selector

**标签名**：`yn-sku-selector`  
**类名**：`YnSkuSelector`  
**导入**：`yn-web-component/components/yn-sku-selector`  
**用途**：多维 SKU 规格联动选择、库存/价格展示、加购校验与 loading 反馈。

同路径还导出 SKU 算法工具（`getSpecKeys`、`buildFirstAvailableCurs`、`findMatchedSku` 等），可单独 Tree Shaking 使用。

#### 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `skus` | `YnSkuItem[]` | `[]` | SKU 列表；`price` / `id` / `stock` / `skuId` 为元数据 |
| `currency` | `string` | `"€"` | 货币字符 |
| `currency-icon` | `string` | `""` | 货币 SVG（优先于 `currency` 文本） |
| `simple` | `boolean` | `false` | 仅显示规格按钮，选齐后自动 submit |
| `pick-one` | `boolean` | `false` | 默认选中第一组可用 SKU 并触发 `init` |
| `submit-label` | `string` | `"ADD TO CART"` | 加购按钮文案 |
| `loading-text` | `string` | `""` | 设置后进入文案替换 loading 模式 |
| `loading-mode` | `"icon" \| "overlay"` | `"icon"` | spinner 展示方式 |
| `cart-icon` | `string` | 内置 SVG | 加购按钮图标 |
| `show-cart-icon` | `boolean` | `true` | 是否显示加购图标 |
| `incomplete-hint` | `string` | `"请选择 {label}"` | 未选齐提示模板，`{label}` 为维度名 |
| `labels` | `Record<string, string>` | `{}` | 维度展示名映射 |
| `spec-key-whitelist` | `string[]` | `[]` | 维度白名单（按顺序） |
| `spec-key-exclude` | `string[]` | `[]` | 额外排除的维度 |
| `disabled` | `boolean` | `false` | 禁用整组 |

#### 事件

| 事件 | `detail` | 说明 |
| --- | --- | --- |
| `change` | `{ selections, sku, ready, missingKeys }` | 规格选择变化 |
| `init` | 同 `change` | `pick-one` 初始化完成时 |
| `submit` | `{ selections, sku }` + `event.instance` | 满足加购条件时；异步完成后调用 `instance.done()` |

#### 插槽

| 插槽 | 说明 | 优先级 |
| --- | --- | --- |
| `title` | 标题区（`simple` 模式不渲染） | — |
| `submit-icon` | 加购按钮左侧图标 | **优先于** `cart-icon` 属性 |

#### CSS 变量

| 变量 | 说明 |
| --- | --- |
| `--yn-sku-selector-row-height` | 规格行高度 |
| `--yn-sku-selector-row-gap` | 维度行间距 |
| `--yn-sku-selector-label-row-gap` | label 与按钮行间距 |
| `--yn-sku-selector-option-min-width` | 规格按钮最小宽度 |
| `--yn-sku-selector-option-border-color` | 边框色 |
| `--yn-sku-selector-option-active-bg` | 选中背景 |
| `--yn-sku-selector-option-active-color` | 选中文字色 |
| `--yn-sku-selector-submit-height` | 加购按钮高度 |
| `--yn-sku-selector-submit-margin-top` | 规格区与按钮间距 |
| `--yn-sku-selector-submit-outer-gap` | 外圈留白 |
| `--yn-sku-selector-submit-inner-height` | 内内容区高度 |
| `--yn-sku-selector-submit-inset-color` | 内描边色 |
| `--yn-sku-selector-submit-divider-color` | 价格区分隔线 |
| `--yn-sku-selector-submit-price-width` | 价格区宽度 |
| `--yn-sku-selector-price-font-weight` | 价格字重 |
| `--yn-sku-selector-submit-bg` | 加购背景 |
| `--yn-sku-selector-submit-color` | 加购文字/图标色 |
| `--yn-sku-selector-hint-color` | 校验提示色 |
| `--yn-sku-selector-submit-loading-size` | spinner 通用尺寸 |
| `--yn-sku-selector-submit-loading-icon-size` | icon 模式 spinner 尺寸 |

兼容旧名：`--yn-sku-selector-option-height`、`--yn-sku-selector-label-gap`、`--yn-sku-selector-section-gap`。

#### 内部子组件 yn-sku-cart-button

`yn-sku-cart-button` 无独立 `package.json` exports，随选择器内部注册。若需单独了解其 API：

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `label` | `string` | `"ADD TO CART"` | 按钮文案 |
| `price` | `string` | `"—"` | 价格展示 |
| `cart-icon` | `string` | 内置 SVG | 图标 |
| `currency-icon` | `string` | `""` | 货币 SVG |
| `show-cart-icon` | `boolean` | `true` | 显示图标 |
| `loading` | `boolean` | `false` | loading 态 |
| `loading-text` | `string` | `""` | 文案替换 loading |
| `loading-mode` | `"icon" \| "overlay"` | `"icon"` | spinner 模式 |
| `disabled` | `boolean` | `false` | 禁用 |

事件：`click`（原生点击）。插槽：`icon`（优先于 `cart-icon`）。

#### 示例

```html
<yn-sku-selector
  .skus=${skus}
  pick-one
  .labels=${{ color: "颜色", size: "尺码" }}
  @init=${onInit}
  @change=${onChange}
  @submit=${async (e) => {
    await addToCart(e.detail.sku);
    e.instance.done();
  }}
>
  <h1 slot="title">Product Name</h1>
</yn-sku-selector>
```

---

## 导入路径速查

| 组件 | 按需导入路径 |
| --- | --- |
| yn-button | `yn-web-component/components/yn-button` |
| yn-input | `yn-web-component/components/yn-input` |
| yn-input SSR | `yn-web-component/ssr/yn-input`（`renderYnInputShadowHtml`） |
| yn-navigation | `yn-web-component/components/yn-navigation` |
| yn-navigation SSR | `yn-web-component/ssr/yn-navigation`（`renderYnNavigationShadowHtml`、`renderYnNavigationSeoFallbackHtml`、`YN_NAVIGATION_SEO_FALLBACK_LIGHT_STYLES`） |
| yn-search | `yn-web-component/components/yn-search` |
| yn-search SSR | `yn-web-component/ssr/yn-search`（`renderYnSearchShadowHtml`） |
| yn-cookie-notice | `yn-web-component/components/yn-cookie-notice` |
| yn-group-pick | `yn-web-component/components/yn-group-pick` |
| yn-pick | `yn-web-component/components/yn-pick` |
| yn-dropdown | `yn-web-component/components/yn-dropdown` |
| yn-dropdown-pick | `yn-web-component/components/yn-dropdown-pick` |
| yn-dropdown-pick SSR | `yn-web-component/ssr/yn-dropdown-pick`（`renderYnDropdownPickShadowHtml`） |
| yn-drawer | `yn-web-component/components/yn-drawer` |
| yn-drawer SSR | `yn-web-component/ssr/yn-drawer`（`renderYnDrawerShadowHtml`） |
| yn-button SSR | `yn-web-component/ssr/yn-button`（`renderYnButtonShadowHtml`） |
| yn-toast | `yn-web-component/components/yn-toast` |
| yn-icon-connect-button | `yn-web-component/components/yn-icon-connect-button` |
| yn-pull-cord-switch | `yn-web-component/components/yn-pull-cord-switch` |
| yn-quantity | `yn-web-component/components/yn-quantity` |
| yn-quantity SSR | `yn-web-component/ssr/yn-quantity`（`renderYnQuantityShadowHtml`） |
| yn-checkout-address | `yn-web-component/components/yn-checkout-address` |
| yn-sku-selector | `yn-web-component/components/yn-sku-selector` |

其他导出：

| 路径 | 说明 |
| --- | --- |
| `yn-web-component` | 主入口，导出所有组件类与类型 |
| `yn-web-component/define` | 全量注册所有自定义元素 |
| `yn-web-component/ssr/yn-navigation` | Astro DSD 首屏导航 + light DOM SEO 链接层 |
| `yn-web-component/ssr/yn-search` | Astro DSD 首屏搜索框 |
| `yn-web-component/ssr/yn-button` | Astro DSD 首屏按钮 |
| `yn-web-component/ssr/yn-drawer` | Astro DSD 首屏抽屉 |
| `yn-web-component/ssr/yn-dropdown-pick` | Astro DSD 首屏下拉选择 |
| `yn-web-component/ssr/yn-input` | Astro DSD 首屏输入框 |
| `yn-web-component/ssr/yn-quantity` | Astro DSD 首屏数量选择器 |
| `yn-web-component/theme.css` | 全局主题样式 |
| `yn-web-component/asset/svg` | SVG 资源 |

## 主题与样式

### 按钮主题推荐（variant + CSS 变量）

推荐两层控制：

1. **语义层**：`variant` 表达按钮语义（`primary`、`danger` 等）
2. **视觉层**：CSS 变量覆写具体色值，满足品牌定制

### Tailwind 使用边界

Tailwind 仅用于 Storybook 演示层（`*.stories.ts`、`.storybook/`），**不会**打入组件库发布产物。组件样式通过 Shadow DOM 内 `css` 与 `--yn-*` 变量实现。

## 版本与兼容性

| 项 | 说明 |
| --- | --- |
| ESM | `dist/index.js` |
| CJS | `dist/index.cjs` |
| UMD | `dist/index.umd.js` |
| IIFE | `dist/index.iife.js` |
| Types | `dist/types/*` |
| Node.js | 建议 `>= 18` |
| 包管理器 | 推荐 `pnpm 10+` |
| 浏览器 | 支持 Custom Elements v1 / Shadow DOM 的现代浏览器 |

依赖基线：`lit ^3.3.2`

## 开发命令

```bash
pnpm dev              # 启动文档站（app/，http://localhost:5173）
pnpm storybook        # Storybook 开发调试（端口 6006）
pnpm build            # 构建产物
pnpm build-storybook  # 构建静态 Storybook
pnpm test             # 单元测试
pnpm test:browser     # 浏览器测试
pnpm typecheck        # 类型检查
pnpm lint             # ESLint
pnpm format           # Prettier
```

更完整的交互演示与 Controls 面板，请运行 `pnpm storybook` 查看。

## 发布

```bash
pnpm build
pnpm changeset
pnpm release
```

## License

MIT
