/**
 * `YnCheckoutAddress` 组件说明（与类 JSDoc、Storybook docs 保持一致）。
 * 修改后请执行 `npm run analyze` 同步 custom-elements.json、web-types.json（IDEA/WebStorm 提示）、.vscode/html-custom-data.json。
 */

/** Storybook Markdown 首段（可加粗） */
export const CHECKOUT_ADDRESS_COMPONENT_DOC_INTRO = `跨境独立站结账地址：**优先探测自建 dr5hn**（\`dr5hn-base-url\`）→ **默认 dr5hn CDN** → 再 **Photon** → 再 **Google**（有 Key 且脚本可加载）→ 均不可用则 **manual 手动填写**（开放国家/地区、省/州、城市编辑）。优先免费源以节省 Google 额度。运行中若 dr5hn 搜索无匹配或失败，会**清空区域并降级 Photon** 用同一关键词重搜；Photon 搜索仍失败则**切至 manual**。开启 \`allow-manual-entry\` 后，用户可在搜索与手填间双向切换。表单**分步展示**（先地区、再联系方式与详细地址；手填模式一次展开全部字段）；内置 \`validate()\` / \`reportValidity()\`，\`change\` 的 \`detail\` 为 \`{ value, validation, changedFields }\`。保存 / 回显 / 编辑均使用 \`YnCheckoutAddressValue\`。`;

/** CEM / 类 JSDoc 用纯文本（无 Markdown） */
export const CHECKOUT_ADDRESS_COMPONENT_DOC_PLAIN = `跨境独立站结账地址：优先探测自建 dr5hn（dr5hn-base-url）→ 默认 dr5hn CDN → Photon → Google（有 Key 且脚本可加载）→ 均不可用则 manual 手动填写。优先免费源以节省 Google 额度。运行中 dr5hn 搜索无匹配或失败时清空区域并降级 Photon 用同一关键词重搜；Photon 仍失败则切至 manual。allow-manual-entry 开启后可在搜索与手填间双向切换。文案：内置仅 en/zh-CN，默认 en 缺 key 兜底；新语言由宿主 messages 传入，勿扩展 locale。分步表单（手填一次展开）；内置 validate/reportValidity；change 派发 { value, validation, changedFields }。统一 YnCheckoutAddressValue 保存、回显与受控 .value。`;

/** Storybook Docs：公开方法与校验结构 */
export const CHECKOUT_ADDRESS_METHODS_DOC = `## 公开方法

### \`validate()\`

执行内置校验，**不**标红字段、**不**自动聚焦。适合在 \`change\` 里读取结果，或提交前与 \`reportValidity()\` 配合使用。

**返回** \`YnCheckoutAddressValidateResult\`（在 \`YnCheckoutAddressValidation\` 基础上增加 \`value\`）：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| \`valid\` | \`boolean\` | 是否通过硬校验；**提交订单前应为此 \`true\`** |
| \`regionComplete\` | \`boolean\` | 配送地区是否已确认（dr5hn 需选到城市级） |
| \`formReady\` | \`boolean\` | 软就绪：主要必填已填，可用于预启用下单按钮；可能仍缺邮编等，以 \`valid\` 为准 |
| \`errors\` | \`YnCheckoutAddressValidationError[]\` | 未通过项：\`{ field, code, message }\`，如 \`PHONE_REQUIRED\`、\`FIRST_NAME_REQUIRED\` |
| \`value\` | \`YnCheckoutAddressValue\` | 当前地址快照，与 \`change\` 的 \`detail.value\`、\`.value\` 同结构 |

### \`reportValidity()\`

展示字段级错误（标红 + 错误文案），并 **focus** 第一个无效字段。语义类似原生 \`HTMLInputElement.reportValidity()\`。

**返回** \`boolean\`：\`true\` 表示当前通过校验；\`false\` 表示已展示错误且应阻止提交。

**典型用法**（下单按钮）：

\`\`\`js
if (!addressEl.reportValidity()) return;
const { valid, value } = addressEl.validate();
if (!valid) return;
submitOrder({ shippingAddress: value });
\`\`\`

### \`setValue(value)\`

编程式写入受控值，与设置 \`.value\` 属性等效。**不会**重新探测数据源，**不会**触发地区搜索。

**参数** \`YnCheckoutAddressValue | null\` — 传入 \`null\` 清空表单。

## \`change\` 与校验

每次 \`change\` 的 \`detail\` 为 \`{ value, validation, changedFields }\`。\`changedFields\` 为相对上一次 \`change\` 变更的 \`YnCheckoutAddressValue\` 字段名（选地区时可能多项同时出现）。实时 \`validation\` 用于联动按钮；界面标红需在提交时调用 \`reportValidity()\`。

完整交互演示见 Story **「结账校验（完整演示）」**。`;

/** Storybook argTypes：公开方法（仅文档，Controls 不绑定） */
export const checkoutAddressMethodArgTypes = {
  validate: {
    name: "validate()",
    control: false,
    description:
      "执行内置校验，不修改界面。返回 YnCheckoutAddressValidateResult：valid、regionComplete、formReady、errors[]、value。",
    table: {
      category: "Interactions",
      type: { summary: "() => YnCheckoutAddressValidateResult" },
    },
  },
  reportValidity: {
    name: "reportValidity()",
    control: false,
    description:
      "标红无效字段并聚焦第一项。返回 boolean：true 通过，false 未通过（已展示错误）。下单前推荐调用。",
    table: {
      category: "Interactions",
      type: { summary: "() => boolean" },
    },
  },
  setValue: {
    name: "setValue(value)",
    control: false,
    description:
      "编程式回显/清空，与 .value 属性等效。参数 YnCheckoutAddressValue | null；不重新探测、不触发搜索。",
    table: {
      category: "Interactions",
      type: { summary: "(value: YnCheckoutAddressValue | null) => void" },
    },
  },
} as const;

/** 结账校验 Story：Actions 面板用（须 `on*` 前缀 + 在 render 里手动调用） */
export const checkoutAddressMethodActionArgTypes = {
  onValidate: {
    name: "validate()",
    control: false,
    action: "validate",
    description:
      "演示按钮调用 `validate()` 的返回值（`YnCheckoutAddressValidateResult`）。",
    table: {
      category: "Interactions",
      type: { summary: "() => YnCheckoutAddressValidateResult" },
    },
  },
  onReportValidity: {
    name: "reportValidity()",
    control: false,
    action: "reportValidity",
    description: "演示按钮调用 `reportValidity()` 的返回值（boolean）。",
    table: {
      category: "Interactions",
      type: { summary: "() => boolean" },
    },
  },
  onSetValue: {
    name: "setValue(value)",
    control: false,
    action: "setValue",
    description: "演示「填入示例」调用 `setValue(value)` 时传入的 `YnCheckoutAddressValue`。",
    table: {
      category: "Interactions",
      type: { summary: "(value: YnCheckoutAddressValue | null) => void" },
    },
  },
} as const;
