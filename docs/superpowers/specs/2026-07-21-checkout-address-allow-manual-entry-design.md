# yn-checkout-address：可选手动填写入口

日期：2026-07-21  
状态：已实现

## 背景

`yn-checkout-address` 已有服务不可用时的 **被迫** `manual` 降级（Google → dr5hn → Photon → manual）。业务需要在联想可用时，也让用户 **主动** 切换到手填，并支持切回搜索。

## 目标

1. 组件新增布尔属性 `allow-manual-entry`（默认 `false`，默认行为不变）。
2. 开启后：搜索模式显示「手动填写」；手填模式显示「使用地址搜索」。
3. Storybook 增加使用示例。
4. `my-medusa-store-hono` storefront 结算页开启该选项。

## 非目标

- 不强制默认手填、不跳过首屏探测。
- 不改动 Medusa cart payload 字段映射。
- 不做分段控件（Tab）式切换 UI。

## API

| 项 | 说明 |
| --- | --- |
| 属性 | `allowManualEntry` / `allow-manual-entry`，`Boolean`，默认 `false`，`reflect: true` 可选 |
| 文案 | `enterManualEntry`、`useAddressSearch`（`en` / `zh-CN`，可被 `messages` 覆盖） |
| 方法 | 无需新增公开方法；内部 `enterManualMode` / 恢复 provider |

## 行为

### 搜索模式（google / dr5hn / photon）且 `allowManualEntry`

- 在地区搜索卡片引导区显示链接/按钮「手动填写」。
- 点击后：
  - `activeProvider = "manual"`
  - 记录此前探测成功的 provider 为 `lastProbedProvider`（若尚未记录，探测成功时写入）
  - 清空搜索 query / suggestions / 未确认地区字段（country/state/city 等按现有 `clearRegion` 语义）
  - **保留** 姓名、电话、email、详细地址、notes 等已填明细
  - banner 使用可选手填说明（可复用/微调 `usageHintManual`，或单独文案表示「您选择了手动填写」）

### 手填模式且 `allowManualEntry`

- 显示「使用地址搜索」。
- 点击后：
  - 优先恢复 `lastProbedProvider` 并 `syncGoogleMode` / 恢复 dr5hn 视图（**不**整轮 `runProbe`，除非 `lastProbedProvider` 为空）
  - 清空手填地区未确认态，回到搜索编辑 UI
  - 明细字段仍保留

### 被迫手填（探测失败 / 服务全挂）

- 继续显示现有「重试」`runProbe`。
- 若 `allowManualEntry`：可同时显示「使用地址搜索」（与重试等价走探测或恢复 `lastProbedProvider`；若从未成功探测过则 `runProbe`）。

### 默认关闭

- `allow-manual-entry` 未开时：无主动入口；被迫 manual 行为与现网一致。

## UI 文案（默认）

| key | en | zh-CN |
| --- | --- | --- |
| `enterManualEntry` | Enter manually | 手动填写 |
| `useAddressSearch` | Use address search | 使用地址搜索 |

## Storybook

新增 Story（建议名 `AllowManualEntry`）：

- 设置 `allow-manual-entry`
- 文档说明：可在搜索与手填间切换；默认关闭不影响其他 Story

## Storefront（my-medusa-store-hono）

- `mountCheckoutAddress`：挂载时 `el.allowManualEntry = true`（或等价 attribute）
- `YnCheckoutAddressElement` 类型补全 `allowManualEntry?: boolean`

## 测试要点

1. 默认关闭：界面无「手动填写」。
2. 开启：搜索区可见入口；点击进入 manual 且明细保留。
3. 手填区「使用地址搜索」回到非 manual provider。
4. `validate()` 在主动 manual 下仍要求国家/省/城市齐全。
5. Story 可交互演示切换。

## 风险

- 切回搜索时若仍用缓存 provider，网络已恢复前的 provider 可能立刻再失败 → 可接受，用户仍可选手填或点重试。
- 与 `filterRefreshing` 遮罩交互：切换时沿用现有「避免闪 manual」逻辑，主动选手填不受 filter 刷新遮挡误伤。
