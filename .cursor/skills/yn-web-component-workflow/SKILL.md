---
name: yn-web-component-workflow
description: 为 yn-web-component 项目执行组件开发与 Storybook 文档联动流程。适用于新增或修改 Lit Web Component、更新 stories、补齐 argTypes/Events/Slots/CSS Variables、编写 play 交互、检查 exports 子路径与 Tree Shaking、并在交付前运行 typecheck/lint/build-storybook。
---

# Yn Web Component Workflow

## 适用场景

当用户提到以下任务时使用本 skill：
- 新增/重构/修复 `src/components` 下的 Lit 组件
- 调整 Storybook 文档、Controls、Events、Slots、CSS Variables
- 用户反馈 “interactions 面板为空/没有 interactions”
- 新增组件需要支持按需导入（Tree Shaking）

## 目标

在本项目内保证“组件实现、Storybook 文档、交互验证、导出路径”四者一致，避免只改代码不改文档或只写文档不接真实事件。

## 执行流程

复制并维护此清单：

```md
任务进度：
- [ ] 1. 明确改动范围（组件 / stories / exports）
- [ ] 2. 对齐组件公开 API（属性、事件、插槽、CSS 变量）
- [ ] 3. 同步 Storybook argTypes 和 meta.args 默认值
- [ ] 4. 为主故事补充 play + step 真实交互（必要时）
- [ ] 5. 校验 Tree Shaking 导出（新增组件时）
- [ ] 6. 运行验证命令并报告结果
```

### 1) 明确改动范围

- 先定位对应组件目录和 story 文件：
  - 组件：`src/components/<component>/`
  - Story：`src/components/<component>/<component>.stories.ts`
- 如果修改组件行为但未修改 story，必须补齐 story 改动。

### 2) 对齐公开 API

- 列出组件真实公开能力：props / attrs / events / slots / CSS variables。
- 不要编造未实现能力；事件名和 `CustomEvent.detail` 结构必须与实现一致。

### 3) Storybook 文档联动

- `argTypes` 中每个公开属性必须包含：
  - `description`
  - `table.defaultValue.summary`
- `meta.args` 默认值必须与组件真实默认值一致。
- 事件条目要求：
  - 放在 `table.category: "Events"`
  - 配置 `action`
  - 在 `render` 模板中显式绑定真实事件并回传 `args.onXxx`
- 插槽条目要求：
  - 放在 `Slots` 分类并说明用途和最小示例
  - 若“插槽优先、属性回退”，写明优先级
- CSS 变量条目要求：
  - 放在 `CSS Variables` 分类
  - 使用 `--yn-*` 前缀，解释用途与默认值
- 文档必须说明 Shadow DOM 样式隔离与外部样式不默认穿透。

### 4) Interactions 面板要求

- 若组件存在公开交互或关键状态切换，至少给主故事（如 `Default`）提供 `play`。
- `play` 必须用 `step(...)` 执行真实操作并校验结果，确保 addon-interactions 面板可见且非空。
- 新增独立 `Interactions` story 时，主故事也要保留同类 `play`，避免默认页空面板。

### 5) 新增组件的 Tree Shaking 交付

- 新增组件时，必须在 `package.json` 的 `exports` 添加组件级子路径。
- 确保 `types/import/require` 路径一一对应。
- 文档示例同时给出全量入口与按需入口，并推荐按需入口。

### 6) 交付前验证

默认依次执行：

```bash
pnpm run typecheck
pnpm run lint
```

若 story 渲染或 `play` 被修改，再执行：

```bash
pnpm run build-storybook
```

报告时必须明确：
- 哪些命令已执行
- 成功/失败结果
- 若未执行，说明原因和建议补跑命令

## 输出约定

- 先给改动要点（组件行为 + story 对齐点）
- 再给验证结果
- 最后给剩余风险（若有）

## 额外约束

- 不要使用与项目前缀冲突的 CSS 变量命名（如 `--icon-color`）。
- 不提交“代码已改但文档未改”的状态。
- 事件接线顺序若涉及内部联动与 Actions 记录，先做内部联动，再回传 `args.onXxx`。
