/**
 * `YnCheckoutAddress` 组件说明（与类 JSDoc、Storybook docs 保持一致）。
 * 修改后请执行 `npm run analyze` 同步 custom-elements.json、web-types.json（IDEA/WebStorm 提示）、.vscode/html-custom-data.json。
 */

/** Storybook Markdown 首段（可加粗） */
export const CHECKOUT_ADDRESS_COMPONENT_DOC_INTRO = `跨境独立站结账地址：**优先检测 Google API Key** → 无 Key 或 Google 失败则 **探测 dr5hn CDN** → 再不可用则 **探测 Photon** → 三者均不可用则进入 **manual 手动填写**（开放国家/地区、省/州、城市编辑）。运行中若 dr5hn 搜索无匹配或失败，会**清空区域并降级 Photon** 用同一关键词重搜；Photon 搜索仍失败则**切至 manual**。表单**分步展示**（先地区、再联系方式与详细地址）；内置 \`validate()\` / \`reportValidity()\`，\`change\` 的 \`detail\` 为 \`{ value, validation }\`。保存 / 回显 / 编辑均使用 \`YnCheckoutAddressValue\`。`;

/** CEM / 类 JSDoc 用纯文本（无 Markdown） */
export const CHECKOUT_ADDRESS_COMPONENT_DOC_PLAIN = `跨境独立站结账地址：优先检测 Google API Key → 无 Key 或 Google 失败则探测 dr5hn CDN → 再不可用则探测 Photon → 三者均不可用则 manual 手动填写（开放国家/地区、省/州、城市编辑）。运行中 dr5hn 搜索无匹配或失败时清空区域并降级 Photon 用同一关键词重搜；Photon 仍失败则切至 manual。分步表单；内置 validate/reportValidity；change 派发 { value, validation }。统一 YnCheckoutAddressValue 保存、回显与受控 .value。`;
