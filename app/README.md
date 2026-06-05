# 组件文档站（`app/`）

本目录是 **独立站组件库的对外文档 SPA**，与 `src/components/` 组件源码分离，不随 npm 包发布。

## 启动

```bash
pnpm dev
# 浏览器打开 http://localhost:5173/
```

## 目录说明

| 路径 | 说明 |
| --- | --- |
| `main.ts` | 文档站入口 |
| `docs-app.ts` | 三栏布局主应用（侧栏 / 正文 / TOC） |
| `i18n/` | 中英文文案（`zh-CN` / `en`） |
| `data/` | 组件 API、Storybook 介绍、打包体积 |
| `demos/` | Live Preview 与展示变体（如 Pick 色块/图片卡片） |
| `ui/` | 代码块、预览面板等文档 UI |
| `styles/docs.css` | Floema 文档站样式 |

## 功能

- 中英文切换（右上角，localStorage 记忆）
- 每组件：详细介绍、展示形式、Storybook 链接、Live Demo、打包体积
- `#/bundle-size` 打包体积总览页

## 与 `src/docs/` 的区别

- **`app/`**：可运行的文档网站代码
- **`src/docs/`**：项目内部 Markdown（开发规范、进度等），不参与文档站构建
