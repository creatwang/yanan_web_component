import type { Locale } from "../i18n/locale";
import type { GuideDocPage } from "../types";

export function getGuidePage(id: string, locale: Locale): GuideDocPage | undefined {
  const zh = locale === "zh-CN";
  if (id === "introduction") {
    return {
      kind: "guide",
      id: "introduction",
      title: zh ? "介绍" : "Introduction",
      description: zh
        ? "yn-web-component 是面向独立站电商平台的 Lit Web Components 组件库，视觉与交互参考 Floema。"
        : "yn-web-component is a Lit Web Components library for DTC storefronts, inspired by Floema.",
      sections: [
        {
          id: "overview",
          title: zh ? "概述" : "Overview",
          body: zh
            ? "本库提供 `yn-*` 自定义元素，覆盖浏览、选购、跨境结账等场景。基于 Custom Elements + Shadow DOM，跨框架复用。"
            : "`yn-*` custom elements for browse, purchase, and checkout. Standards-based, framework-agnostic."
        },
        { id: "features", title: zh ? "特性" : "Features", body: "" },
        {
          id: "inspiration",
          title: zh ? "设计灵感" : "Design",
          body: zh
            ? "Floema 克制细腻的电商体验；文档排版参考 shadcn-docs 三栏结构，色彩遵循暖纸色体系。"
            : "Floema-like restraint; shadcn-docs-inspired layout with warm paper palette."
        },
        {
          id: "storybook",
          title: zh ? "与 Storybook 分工" : "Storybook",
          body: zh
            ? "Storybook：Controls / Events / play 调试。本文档站：完整 API + Live Preview + 打包体积。"
            : "Storybook for dev controls; this site for API reference, live previews, and bundle sizes."
        }
      ]
    };
  }
  if (id === "installation") {
    return {
      kind: "guide",
      id: "installation",
      title: zh ? "安装与导入" : "Installation",
      description: zh ? "npm 安装与按需导入。" : "Install via npm and import on demand.",
      sections: [
        {
          id: "install",
          title: zh ? "安装" : "Install",
          body: zh ? "使用包管理器安装：" : "Install with your package manager:",
          code: "pnpm add yn-web-component",
          lang: "bash"
        },
        {
          id: "define",
          title: zh ? "全量注册" : "Full register",
          body: zh ? "一次性注册所有组件：" : "Register all components:",
          code: 'import "yn-web-component/define";',
          lang: "ts"
        },
        {
          id: "tree-shaking",
          title: zh ? "按需导入" : "On-demand",
          body: zh ? "推荐子路径，利于 Tree Shaking：" : "Recommended subpaths for tree shaking:",
          code: `import { YnButton } from "yn-web-component/components/yn-button";`,
          lang: "ts"
        },
        {
          id: "theme",
          title: zh ? "主题" : "Theme",
          body: zh ? "可选全局主题：" : "Optional global theme:",
          code: 'import "yn-web-component/theme.css";',
          lang: "ts"
        },
        {
          id: "shadow",
          title: zh ? "样式定制" : "Styling",
          body: zh
            ? "Shadow DOM 隔离；通过 `--yn-*` CSS 变量定制。"
            : "Shadow DOM isolation; customize via `--yn-*` CSS variables."
        }
      ]
    };
  }
  return undefined;
}
