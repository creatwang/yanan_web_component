import type { GuideDocPage } from "../types";

export const GUIDE_PAGES: GuideDocPage[] = [
  {
    kind: "guide",
    id: "introduction",
    title: "介绍",
    description:
      "yn-web-component 是面向独立站电商平台的 Lit Web Components 组件库，视觉与交互参考 Floema 品牌站。",
    sections: [
      {
        id: "overview",
        title: "概述",
        body: "本库提供一组 `yn-*` 自定义元素，覆盖独立站从浏览、选购到跨境结账的核心 UI 场景。组件基于浏览器标准（Custom Elements + Shadow DOM），不绑定 React / Vue，可在任意前端技术栈中复用。"
      },
      {
        id: "features",
        title: "特性",
        body: "",
      },
      {
        id: "inspiration",
        title: "设计灵感",
        body: "交互动效与视觉质感参考 Floema —— 克制、细腻、有呼吸感的电商体验。文档站排版参考 shadcn-docs 的三栏结构与 Prose 排版，色彩与圆角遵循 Floema 暖纸色体系。"
      },
      {
        id: "storybook",
        title: "与 Storybook 的分工",
        body: "Storybook 用于开发调试（Controls、Events、Interactions play）。本站点用于对外展示完整 API 与 Live Preview，两者内容应与组件实现保持同步。"
      }
    ]
  },
  {
    kind: "guide",
    id: "installation",
    title: "安装与导入",
    description: "通过 npm 安装，并按需或全量注册组件。",
    sections: [
      {
        id: "install",
        title: "安装",
        body: "使用你喜欢的包管理器安装：",
        code: "pnpm add yn-web-component\n# npm i yn-web-component\n# yarn add yn-web-component",
        lang: "bash"
      },
      {
        id: "define",
        title: "全量注册",
        body: "适合中小项目，一次性注册所有自定义元素：",
        code: 'import "yn-web-component/define";',
        lang: "ts"
      },
      {
        id: "tree-shaking",
        title: "按需导入（推荐）",
        body: "组件级子路径导入，便于 Tree Shaking：",
        code: `import { YnButton } from "yn-web-component/components/yn-button";
import { YnSkuSelector } from "yn-web-component/components/yn-sku-selector";`,
        lang: "ts"
      },
      {
        id: "theme",
        title: "主题样式",
        body: "可选引入全局主题 token：",
        code: 'import "yn-web-component/theme.css";',
        lang: "ts"
      },
      {
        id: "shadow",
        title: "样式定制",
        body: "所有组件使用 Shadow DOM，外部 CSS 默认不穿透。请通过 `--yn-*` CSS 变量或组件属性定制外观。"
      }
    ]
  }
];
