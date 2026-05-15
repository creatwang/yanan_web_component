import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./yn-toast";
import "../yn-button/yn-button";
import type { YnToast, YnToastDetail, YnToastType } from "./yn-toast";

type Args = {
  type: YnToastType;
  message: string;
  duration: number;
  loadingDuration: number;
  persist: boolean;
  top: string;
  zIndex: number;
  height: string;
  bg: string;
  textColor: string;
  successColor: string;
  infoColor: string;
  warningColor: string;
  errorColor: string;
  paperColor: string;
  maxWidth: string;
  messagePadding: string;
  messageFontSize: string;
  messageLetterSpacing: string;
  maskBg: string;
  shadow: string;
  show?: YnToast["show"];
  success?: YnToast["success"];
  info?: YnToast["info"];
  warning?: YnToast["warning"];
  error?: YnToast["error"];
  close?: (source?: "api" | "swipe" | "timer" | "property") => void;
  onShow?: (event: CustomEvent<YnToastDetail>) => void;
  onClose?: (event: CustomEvent<YnToastDetail>) => void;
};

const longMessage =
  "lorm lasjdf lskdjf lsf lksd fskdjfla ksdfj fsdflsadkjfl sjadklfj salkdfjlksdjf lorm lasjdf lskdjf lsf lksd fskdjfla ksdfj fsdflsadkjfl sjadklfj salkdfjlksdjf!";

const noopShow = (() => Promise.resolve(undefined)) as YnToast["show"];
const noopSuccess = (() => Promise.resolve(undefined)) as YnToast["success"];
const noopInfo = (() => Promise.resolve(undefined)) as YnToast["info"];
const noopWarning = (() => Promise.resolve(undefined)) as YnToast["warning"];
const noopError = (() => Promise.resolve(undefined)) as YnToast["error"];

const meta = {
  title: "Components/YnToast",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "灵动岛风格顶部反馈组件。调用 `show(type, message)` 后先展示加速双段弧 loading，再形变为状态提示；也可以使用 `success(message)`、`info(message)`、`warning(message)`、`error(message)` 快捷方法。`message` 支持 HTML 片段字符串，适合放 `<strong>`、`<span>`、`<br>` 等简单可信内容。调用 `show(callback, mask?)` 时执行 `instance.done(type, message)` 展示最终状态；调用 `success(callback, mask?)` 等快捷 callback 时执行 `instance.done(message)` 即可，`mask=true` 会在 loading 阶段显示遮罩。`await show(callback)` / `await success(callback)` 会得到 callback 的返回值。支持 success/info/warning/error、空文案仅展示状态球、长文案超过最大宽度后先横向展开再纵向展开。\n\n样式隔离：组件使用 Shadow DOM，外部样式默认不穿透；请通过公开 CSS 变量定制。HTML 片段会按 HTML 渲染，请只传入可信内容。\n\nTree Shaking 导入：\n- 全量入口：`import \"yn-web-component/define\"`\n- 按需入口（推荐）：`import \"yn-web-component/components/yn-toast\"`"
      }
    }
  },
  args: {
    type: "success",
    message: "success!",
    duration: 2600,
    loadingDuration: 1400,
    persist: false,
    top: "26px",
    zIndex: 1600,
    height: "36px",
    bg: "rgba(246, 241, 230, 0.92)",
    textColor: "#20231d",
    successColor: "#667a48",
    infoColor: "#5f6f86",
    warningColor: "#b87d55",
    errorColor: "#9a4f43",
    paperColor: "#f3eddf",
    maxWidth: "90vw",
    messagePadding: "0 14px 0 6px",
    messageFontSize: "0.8rem",
    messageLetterSpacing: "0.18em",
    maskBg: "rgba(32, 35, 29, 0.18)",
    shadow:
      "inset 0 0 0 1px rgba(255, 255, 255, 0.48), inset 0 -1px 0 rgba(32, 35, 29, 0.06), 0 18px 45px rgba(62, 55, 42, 0.14), 0 5px 16px rgba(62, 55, 42, 0.08)",
    show: noopShow,
    success: noopSuccess,
    info: noopInfo,
    warning: noopWarning,
    error: noopError,
    close: () => undefined
  },
  argTypes: {
    type: {
      control: "radio",
      options: ["success", "info", "warning", "error"],
      description: "默认提示类型。调用 `show()` 未传 `type` 时使用。",
      table: { defaultValue: { summary: "success" }, type: { summary: '"success" | "info" | "warning" | "error"' } }
    },
    message: {
      control: "text",
      description: "默认提示文案，支持 HTML 片段字符串。调用 `show()` 未传 `message` 时使用；空字符串时最终态只展示状态球。HTML 内容请确保可信。",
      table: { defaultValue: { summary: '""（未设置时按 type 使用内置文案）' }, type: { summary: "string | HTML fragment string" } }
    },
    duration: {
      control: { type: "number", min: 0, step: 100 },
      description: "最终态展示时长，单位 ms。`persist=true` 或 `show(type, message, { persist: true })` 时不自动关闭。",
      table: { defaultValue: { summary: "2600" }, type: { summary: "number" } }
    },
    loadingDuration: {
      name: "loading-duration",
      control: { type: "number", min: 0, step: 100 },
      description: "loading 阶段时长，单位 ms。",
      table: { defaultValue: { summary: "1400" }, type: { summary: "number" } }
    },
    persist: {
      control: "boolean",
      description: "是否保持最终态不自动关闭。仍可通过上滑或 `hide()` 关闭。",
      table: { defaultValue: { summary: "false" }, type: { summary: "boolean" } }
    },
    show: {
      name: "show(type, message?) / show(callback)",
      control: false,
      description:
        "交互方法：展示提示。`show(type, message)` 用于普通提示；`show(callback, mask?)` 用于异步任务，开始后立即 loading，第二个参数 `mask` 控制 loading 阶段是否展示遮罩。执行 `instance.done(type, message)` 后进入最终态，callback 返回值会作为 `await show(...)` 的结果。普通调用可在第三个参数传 `{ duration, loadingDuration, persist }`。",
      table: {
        category: "Interactions",
        type: {
          summary:
            "(type: YnToastType, message?: string, options?: { duration?: number; loadingDuration?: number; persist?: boolean }) => Promise<void>; <T>(callback: (instance) => T | Promise<T>, mask?: boolean) => Promise<T>"
        }
      }
    },
    success: {
      name: "success(message?) / success(callback)",
      control: false,
      description:
        "success 快捷方法。普通调用：`success(message, options?)`，只传消息即可，消息支持可信 HTML 片段。callback 调用：`success(callback, mask?)`，第二个参数控制 loading 阶段是否展示遮罩；在 callback 中执行 `instance.done(message, options?)` 完成 success 状态；callback 返回值会作为 `await success(...)` 的结果。",
      table: {
        category: "Interactions",
        type: {
          summary:
            "(message?: string, options?: { duration?: number; loadingDuration?: number; persist?: boolean }) => Promise<void>; <T>(callback: (instance: { done(message?: string, options?: { duration?: number; persist?: boolean }): void }) => T | Promise<T>, mask?: boolean) => Promise<T>"
        }
      }
    },
    info: {
      name: "info(message?) / info(callback)",
      control: false,
      description:
        "info 快捷方法。普通调用：`info(message, options?)`，只传消息即可，消息支持可信 HTML 片段。callback 调用：`info(callback, mask?)`，第二个参数控制 loading 阶段是否展示遮罩；在 callback 中执行 `instance.done(message, options?)` 完成 info 状态；callback 返回值会作为 `await info(...)` 的结果。",
      table: {
        category: "Interactions",
        type: {
          summary:
            "(message?: string, options?: { duration?: number; loadingDuration?: number; persist?: boolean }) => Promise<void>; <T>(callback: (instance: { done(message?: string, options?: { duration?: number; persist?: boolean }): void }) => T | Promise<T>, mask?: boolean) => Promise<T>"
        }
      }
    },
    warning: {
      name: "warning(message?) / warning(callback)",
      control: false,
      description:
        "warning 快捷方法。普通调用：`warning(message, options?)`，只传消息即可，消息支持可信 HTML 片段。callback 调用：`warning(callback, mask?)`，第二个参数控制 loading 阶段是否展示遮罩；在 callback 中执行 `instance.done(message, options?)` 完成 warning 状态；callback 返回值会作为 `await warning(...)` 的结果。",
      table: {
        category: "Interactions",
        type: {
          summary:
            "(message?: string, options?: { duration?: number; loadingDuration?: number; persist?: boolean }) => Promise<void>; <T>(callback: (instance: { done(message?: string, options?: { duration?: number; persist?: boolean }): void }) => T | Promise<T>, mask?: boolean) => Promise<T>"
        }
      }
    },
    error: {
      name: "error(message?) / error(callback)",
      control: false,
      description:
        "error 快捷方法。普通调用：`error(message, options?)`，只传消息即可，消息支持可信 HTML 片段。callback 调用：`error(callback, mask?)`，第二个参数控制 loading 阶段是否展示遮罩；在 callback 中执行 `instance.done(message, options?)` 完成 error 状态；callback 返回值会作为 `await error(...)` 的结果。",
      table: {
        category: "Interactions",
        type: {
          summary:
            "(message?: string, options?: { duration?: number; loadingDuration?: number; persist?: boolean }) => Promise<void>; <T>(callback: (instance: { done(message?: string, options?: { duration?: number; persist?: boolean }): void }) => T | Promise<T>, mask?: boolean) => Promise<T>"
        }
      }
    },
    close: {
      name: "hide(source?)",
      control: false,
      description: "交互方法：关闭当前提示。`source` 默认为 `api`，关闭后触发 `close` 事件。",
      table: {
        category: "Interactions",
        type: { summary: '(source?: "api" | "swipe" | "timer" | "property") => void' }
      }
    },
    onShow: {
      name: "show",
      control: false,
      action: "show",
      description: "调用 `show()` 后触发。`event.detail` 结构：`{ type, message, source }`。",
      table: {
        category: "Events",
        type: { summary: "CustomEvent<{ type: YnToastType; message: string; source: string }>" }
      }
    },
    onClose: {
      name: "close",
      control: false,
      action: "close",
      description: "关闭时触发。`source` 可能为 `api`、`swipe`、`timer` 或 `property`。",
      table: {
        category: "Events",
        type: { summary: "CustomEvent<{ type: YnToastType; message: string; source: string }>" }
      }
    },
    top: {
      name: "--yn-toast-top",
      control: "text",
      description: "提示框距离视口顶部的位置。",
      table: { category: "CSS Variables", defaultValue: { summary: "26px" } }
    },
    zIndex: {
      name: "--yn-toast-z-index",
      control: { type: "number", min: 1, step: 1 },
      description: "提示框层级。",
      table: { category: "CSS Variables", defaultValue: { summary: "1600" } }
    },
    height: {
      name: "--yn-toast-height",
      control: "text",
      description: "状态球与默认胶囊高度。",
      table: { category: "CSS Variables", defaultValue: { summary: "36px" } }
    },
    bg: {
      name: "--yn-toast-bg",
      control: "text",
      description: "提示框背景色。",
      table: { category: "CSS Variables", defaultValue: { summary: "rgba(246, 241, 230, 0.92)" } }
    },
    textColor: {
      name: "--yn-toast-text-color",
      control: "color",
      description: "文本与 loading 弧线颜色。",
      table: { category: "CSS Variables", defaultValue: { summary: "#20231d" } }
    },
    successColor: {
      name: "--yn-toast-success-color",
      control: "color",
      description: "success 状态球颜色。",
      table: { category: "CSS Variables", defaultValue: { summary: "#667a48" } }
    },
    infoColor: {
      name: "--yn-toast-info-color",
      control: "color",
      description: "info 状态球颜色。",
      table: { category: "CSS Variables", defaultValue: { summary: "#5f6f86" } }
    },
    warningColor: {
      name: "--yn-toast-warning-color",
      control: "color",
      description: "warning 状态球颜色。",
      table: { category: "CSS Variables", defaultValue: { summary: "#b87d55" } }
    },
    errorColor: {
      name: "--yn-toast-error-color",
      control: "color",
      description: "error 状态球颜色。",
      table: { category: "CSS Variables", defaultValue: { summary: "#9a4f43" } }
    },
    paperColor: {
      name: "--yn-toast-paper-color",
      control: "color",
      description: "状态图标线条颜色。",
      table: { category: "CSS Variables", defaultValue: { summary: "#f3eddf" } }
    },
    maxWidth: {
      name: "--yn-toast-max-width",
      control: "text",
      description: "提示框最大宽度。长文案超过该宽度后触发先宽后高的展开动画。",
      table: { category: "CSS Variables", defaultValue: { summary: "90vw" } }
    },
    messagePadding: {
      name: "--yn-toast-message-padding",
      control: "text",
      description: "消息文本内边距。",
      table: { category: "CSS Variables", defaultValue: { summary: "0 14px 0 6px" } }
    },
    messageFontSize: {
      name: "--yn-toast-message-font-size",
      control: "text",
      description: "消息文本字号。",
      table: { category: "CSS Variables", defaultValue: { summary: "0.8rem" } }
    },
    messageLetterSpacing: {
      name: "--yn-toast-message-letter-spacing",
      control: "text",
      description: "消息文本字距。",
      table: { category: "CSS Variables", defaultValue: { summary: "0.18em" } }
    },
    maskBg: {
      name: "--yn-toast-mask-bg",
      control: "color",
      description: "callback 调用传入 `mask=true` 时，loading 阶段遮罩背景色。",
      table: { category: "CSS Variables", defaultValue: { summary: "rgba(32, 35, 29, 0.18)" } }
    },
    shadow: {
      name: "--yn-toast-shadow",
      control: "text",
      description: "提示框阴影。",
      table: { category: "CSS Variables", defaultValue: { summary: "内置多层柔和阴影" } }
    }
  }
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

const buildStyleVars = (args: Args) => `
  --yn-toast-top:${args.top};
  --yn-toast-z-index:${args.zIndex};
  --yn-toast-height:${args.height};
  --yn-toast-bg:${args.bg};
  --yn-toast-text-color:${args.textColor};
  --yn-toast-success-color:${args.successColor};
  --yn-toast-info-color:${args.infoColor};
  --yn-toast-warning-color:${args.warningColor};
  --yn-toast-error-color:${args.errorColor};
  --yn-toast-paper-color:${args.paperColor};
  --yn-toast-max-width:${args.maxWidth};
  --yn-toast-message-padding:${args.messagePadding};
  --yn-toast-message-font-size:${args.messageFontSize};
  --yn-toast-message-letter-spacing:${args.messageLetterSpacing};
  --yn-toast-mask-bg:${args.maskBg};
  --yn-toast-shadow:${args.shadow};
`;

const getRootFromEvent = (event: Event) => (event.currentTarget as HTMLElement).closest(".toast-demo-root");

const getToastFromEvent = (event: Event) => {
  const root = getRootFromEvent(event);
  return root?.querySelector("yn-toast") as YnToast | null;
};

const setResultFromRoot = (root: Element | null | undefined, result: unknown) => {
  const resultEl = root?.querySelector(".toast-demo-result");
  if (resultEl) resultEl.textContent = `await show(...) 返回值：${String(result)}`;
};

const waitForCondition = async (condition: () => boolean, message: string, timeout = 3000) => {
  const start = performance.now();
  while (performance.now() - start < timeout) {
    if (condition()) return;
    await sleep(50);
  }
  throw new Error(message);
};

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

const clickDemoButton = (root: Element, label: string) => {
  const button = Array.from(root.querySelectorAll("yn-button")).find((item) => item.textContent?.trim() === label);
  const innerButton = button?.shadowRoot?.querySelector("button");
  if (!(innerButton instanceof HTMLButtonElement)) {
    throw new Error(`未找到 ${label} 按钮`);
  }
  innerButton.click();
};

type ToastStep = (label: string, play: () => Promise<void>) => void | Promise<void>;

type ShortcutDoneController = {
  done: (message?: string, options?: { duration?: number; persist?: boolean }) => void;
  hide: () => void;
};

type ShortcutInvoker = (
  input?: string | ((instance: ShortcutDoneController) => unknown | Promise<unknown>),
  optionsOrMask?: { duration?: number; loadingDuration?: number; persist?: boolean } | boolean
) => Promise<unknown>;

const toastTypes: YnToastType[] = ["success", "info", "warning", "error"];

const getShortcutInvoker = (toast: YnToast, type: YnToastType): ShortcutInvoker => {
  const shortcutMap: Record<YnToastType, ShortcutInvoker> = {
    success: toast.success.bind(toast) as ShortcutInvoker,
    info: toast.info.bind(toast) as ShortcutInvoker,
    warning: toast.warning.bind(toast) as ShortcutInvoker,
    error: toast.error.bind(toast) as ShortcutInvoker
  };
  return shortcutMap[type];
};

const expectToastState = async (toast: YnToast, type: YnToastType, message: string) => {
  await waitForCondition(() => {
    const pill = toast.shadowRoot?.querySelector<HTMLElement>(".pill");
    const msg = toast.shadowRoot?.querySelector<HTMLElement>(".msg");
    return pill?.dataset.phase === "success" && pill.dataset.variant === type && msg?.textContent?.includes(message) === true;
  }, `${type} 状态应展示文案：${message}`);
};

const resetToast = async (toast: YnToast) => {
  toast.hide();
  await toast.updateComplete;
};

const runToastPlay = async (canvasElement: HTMLElement, step: ToastStep, options: { includeMask?: boolean } = {}) => {
  const root = canvasElement.querySelector(".toast-demo-root");
  if (!root) throw new Error("未找到 toast demo 根节点");

  const toast = root.querySelector("yn-toast") as YnToast | null;
  if (!toast) throw new Error("未找到 yn-toast 实例");

  await step("点击 Success 后触发 show 事件", async () => {
    const showEvent = new Promise<CustomEvent<YnToastDetail>>((resolve) => {
      toast.addEventListener("show", (event) => resolve(event as CustomEvent<YnToastDetail>), { once: true });
    });
    clickDemoButton(root, "Success");
    const event = await showEvent;
    if (event.detail.type !== "success") {
      throw new Error("Success 按钮应触发 success 类型 show 事件");
    }
  });

  await step("点击 Async Callback 后展示 await 返回值", async () => {
    clickDemoButton(root, "Async Callback");
    if (toast.shadowRoot?.querySelector(".mask")) {
      throw new Error("Async Callback 未传 mask 时不应展示遮罩");
    }
    await waitForCondition(
      () => root.querySelector(".toast-demo-result")?.textContent?.includes("张三") === true,
      "Async Callback 应展示 await 返回值"
    );
  });

  if (options.includeMask) {
    await step("点击 Async Callback + Mask 后展示 await 返回值", async () => {
      clickDemoButton(root, "Async Callback + Mask");
      await waitForCondition(
        () => root.querySelector(".toast-demo-result")?.textContent?.includes("张三") === true,
        "Async Callback + Mask 应展示 await 返回值"
      );
    });
  }
};

const runFullToastInteractionsPlay = async (canvasElement: HTMLElement, step: ToastStep) => {
  const root = canvasElement.querySelector(".toast-demo-root");
  if (!root) throw new Error("未找到 toast demo 根节点");

  const toast = root.querySelector("yn-toast") as YnToast | null;
  if (!toast) throw new Error("未找到 yn-toast 实例");

  await step("show(type, message) 覆盖 success / info / warning / error", async () => {
    for (const type of toastTypes) {
      const message = `show ${type}`;
      await toast.show(type, message, { persist: true, loadingDuration: 0 });
      await expectToastState(toast, type, message);
      await resetToast(toast);
    }
  });

  await step("show(callback).done(type, message) 覆盖 success / info / warning / error", async () => {
    for (const type of toastTypes) {
      const message = `show done ${type}`;
      const result = await toast.show((instance) => {
        instance.done(type, message, { persist: true });
        return `result-${type}`;
      });
      if (result !== `result-${type}`) {
        throw new Error(`show(callback) 应返回 result-${type}`);
      }
      await expectToastState(toast, type, message);
      await resetToast(toast);
    }
  });

  await step("show(async callback) 无 mask", async () => {
    const resultPromise = toast.show(async (instance) => {
      await sleep(80);
      instance.done("success", "show async no mask", { persist: true });
      return "show-async-no-mask";
    });
    await toast.updateComplete;
    if (toast.shadowRoot?.querySelector(".mask")) {
      throw new Error("show(async callback) 未传 mask 时不应展示遮罩");
    }
    const result = await resultPromise;
    if (result !== "show-async-no-mask") {
      throw new Error("show(async callback) 应返回 callback 结果");
    }
    await expectToastState(toast, "success", "show async no mask");
    await resetToast(toast);
  });

  await step("show(async callback, true) 有 mask", async () => {
    const resultPromise = toast.show(async (instance) => {
      await sleep(80);
      instance.done("success", "show async with mask", { persist: true });
      return "show-async-mask";
    }, true);
    await toast.updateComplete;
    if (!toast.shadowRoot?.querySelector(".mask")) {
      throw new Error("show(async callback, true) 应展示遮罩");
    }
    const result = await resultPromise;
    if (result !== "show-async-mask") {
      throw new Error("show(async callback, true) 应返回 callback 结果");
    }
    await expectToastState(toast, "success", "show async with mask");
    await resetToast(toast);
  });

  await step("success/info/warning/error(message) 普通快捷调用全覆盖", async () => {
    for (const type of toastTypes) {
      const message = `shortcut ${type}`;
      await getShortcutInvoker(toast, type)(message, { persist: true, loadingDuration: 0 });
      await expectToastState(toast, type, message);
      await resetToast(toast);
    }
  });

  await step("success/info/warning/error(callback).done(message) 全覆盖", async () => {
    for (const type of toastTypes) {
      const message = `shortcut done ${type}`;
      const result = await getShortcutInvoker(toast, type)((instance) => {
        instance.done(message, { persist: true });
        return `shortcut-result-${type}`;
      });
      if (result !== `shortcut-result-${type}`) {
        throw new Error(`${type}(callback) 应返回 callback 结果`);
      }
      await expectToastState(toast, type, message);
      await resetToast(toast);
    }
  });

  await step("success/info/warning/error(async callback) 无 mask 全覆盖", async () => {
    for (const type of toastTypes) {
      const message = `shortcut async ${type}`;
      const resultPromise = getShortcutInvoker(toast, type)(async (instance) => {
        await sleep(80);
        instance.done(message, { persist: true });
        return `shortcut-async-${type}`;
      });
      await toast.updateComplete;
      if (toast.shadowRoot?.querySelector(".mask")) {
        throw new Error(`${type}(async callback) 未传 mask 时不应展示遮罩`);
      }
      const result = await resultPromise;
      if (result !== `shortcut-async-${type}`) {
        throw new Error(`${type}(async callback) 应返回 callback 结果`);
      }
      await expectToastState(toast, type, message);
      await resetToast(toast);
    }
  });

  await step("success/info/warning/error(async callback, true) 有 mask 全覆盖", async () => {
    for (const type of toastTypes) {
      const message = `shortcut async mask ${type}`;
      const resultPromise = getShortcutInvoker(toast, type)(async (instance) => {
        await sleep(80);
        instance.done(message, { persist: true });
        return `shortcut-async-mask-${type}`;
      }, true);
      await toast.updateComplete;
      if (!toast.shadowRoot?.querySelector(".mask")) {
        throw new Error(`${type}(async callback, true) 应展示遮罩`);
      }
      const result = await resultPromise;
      if (result !== `shortcut-async-mask-${type}`) {
        throw new Error(`${type}(async callback, true) 应返回 callback 结果`);
      }
      await expectToastState(toast, type, message);
      await resetToast(toast);
    }
  });

  await step("hide() API 关闭当前提示", async () => {
    await toast.success("hide api", { persist: true, loadingDuration: 0 });
    await expectToastState(toast, "success", "hide api");
    toast.hide();
    await waitForCondition(() => {
      const pill = toast.shadowRoot?.querySelector<HTMLElement>(".pill");
      return pill?.dataset.phase === "idle";
    }, "hide() 后应回到 idle 状态");
  });
};

type ToastPlayContext = {
  canvasElement: HTMLElement;
  step: ToastStep;
};

const showFromButton = (event: Event, options: { type: YnToastType; message?: string }) => {
  const toast = getToastFromEvent(event);
  void toast?.[options.type](options.message);
};

const showHtmlMessageFromButton = (event: Event) => {
  const toast = getToastFromEvent(event);
  void toast?.success('saved <strong>successfully</strong> <span style="color:#667a48;">100%</span>');
};

const closeFromButton = (event: Event) => {
  const toast = getToastFromEvent(event);
  toast?.hide();
};

const showSyncCallbackFromButton = async (event: Event) => {
  const root = getRootFromEvent(event);
  const toast = getToastFromEvent(event);
  const result = await toast?.info((instance) => {
    instance.done("同步任务完成");
    return "同步返回：张三";
  });
  setResultFromRoot(root, result);
};

const showAsyncCallbackFromButton = async (event: Event) => {
  const root = getRootFromEvent(event);
  const toast = getToastFromEvent(event);
  const result = await toast?.success(async (instance) => {
    await sleep(1200);
    instance.done("异步保存成功（无遮罩）");
    return "张三";
  });
  setResultFromRoot(root, result);
};

const showAsyncCallbackWithMaskFromButton = async (event: Event) => {
  const root = getRootFromEvent(event);
  const toast = getToastFromEvent(event);
  const result = await toast?.success(async (instance) => {
    await sleep(1200);
    instance.done("异步保存成功（带遮罩）");
    return "张三";
  }, true);
  setResultFromRoot(root, result);
};

const renderDemo = (args: Args) => html`
  <div
    class="toast-demo-root yn-min-h-[520px] yn-overflow-hidden yn-rounded-[28px] yn-p-8"
    style="background:linear-gradient(135deg,#efe8d8 0%,#e8e1d0 48%,#d8d1bd 100%);"
  >
    <yn-toast
      type=${args.type}
      message=${args.message}
      .duration=${args.duration}
      .loadingDuration=${args.loadingDuration}
      ?persist=${args.persist}
      style=${buildStyleVars(args)}
      @show=${(event: Event) => args.onShow?.(event as CustomEvent<YnToastDetail>)}
      @close=${(event: Event) => args.onClose?.(event as CustomEvent<YnToastDetail>)}
    ></yn-toast>

    <div class="yn-flex yn-flex-col yn-items-center yn-justify-center yn-gap-5 yn-pt-28">
      <div class="yn-flex yn-flex-wrap yn-items-center yn-justify-center yn-gap-3">
        <yn-button variant="default" @click=${(event: Event) => showFromButton(event, { type: "success", message: args.message || "success!" })}>Success</yn-button>
        <yn-button variant="default" @click=${(event: Event) => showFromButton(event, { type: "info", message: "info!" })}>Info</yn-button>
        <yn-button variant="default" @click=${(event: Event) => showFromButton(event, { type: "warning", message: "warning!" })}>Warning</yn-button>
        <yn-button variant="default" @click=${(event: Event) => showFromButton(event, { type: "error", message: "error!" })}>Error</yn-button>
        <yn-button variant="default" @click=${(event: Event) => showFromButton(event, { type: "warning", message: "" })}>Only Icon</yn-button>
        <yn-button variant="default" @click=${showHtmlMessageFromButton}>HTML Message</yn-button>
        <yn-button variant="default" @click=${showSyncCallbackFromButton}>Sync Callback</yn-button>
        <yn-button variant="default" @click=${showAsyncCallbackFromButton}>Async Callback</yn-button>
        <yn-button variant="default" @click=${showAsyncCallbackWithMaskFromButton}>Async Callback + Mask</yn-button>
        <yn-button variant="default" @click=${closeFromButton}>API Close</yn-button>
      </div>
      <p class="yn-max-w-md yn-text-center yn-text-sm yn-leading-6 yn-text-[#5f584d]">
        点击按钮查看 success/info/warning/error 快捷方法、HTML message、sync callback、async callback、async callback + mask、状态球形变、短文本宽度自适应、空文案仅展示状态球；向上滑动或点击 API Close 可关闭。
      </p>
      <p class="toast-demo-result yn-min-h-6 yn-text-center yn-text-sm yn-font-semibold yn-text-[#20231d]"></p>
    </div>
  </div>
`;

const renderInteractions = (args: Args) => html`
  <div class="yn-space-y-6">
    ${renderDemo(args)}
    <section class="yn-rounded-3xl yn-bg-[#f7f1e6] yn-p-6 yn-text-[#20231d] yn-shadow-sm">
      <h3 class="yn-m-0 yn-text-base yn-font-semibold">Interactions</h3>
      <p class="yn-mt-2 yn-text-sm yn-leading-6 yn-text-[#5f584d]">
        以下方法都是组件实例方法，可通过 <code>document.querySelector("yn-toast")</code> 或模板引用调用。callback
        模式会先进入 loading，直到调用 <code>instance.done(...)</code> 后切换到最终状态；第二个参数 <code>true</code> 表示开启 mask。
      </p>
      <pre class="yn-mt-4 yn-overflow-auto yn-rounded-2xl yn-bg-[#20231d] yn-p-4 yn-text-xs yn-leading-6 yn-text-[#f7f1e6]"><code>await toast.show("success", "保存成功");
await toast.show((instance) => {
  instance.done("info", "同步任务完成");
  return "张三";
});
await toast.show(async (instance) => {
  await saveData();
  instance.done("success", "异步保存成功");
  return "张三";
});
await toast.show(async (instance) => {
  await saveData();
  instance.done("success", "异步保存成功（带遮罩）");
  return "张三";
}, true);

await toast.success("保存成功");
await toast.info("普通提示");
await toast.warning("请注意");
await toast.error("保存失败");
toast.hide();</code></pre>
    </section>
  </div>
`;

export const Default: Story = {
  render: renderDemo,
  play: async ({ canvasElement, step }: ToastPlayContext) => {
    await runToastPlay(canvasElement, step);
  }
};

export const LongMessage: Story = {
  args: {
    message: longMessage,
    persist: true
  },
  render: renderDemo
};

export const Interactions: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "集中展示并通过 Storybook addon-interactions 验证 `yn-toast` 的公开交互方法，包括 `show(type, message)` 四种状态、`show(callback).done(type, message)` 四种状态、异步 callback 的 mask / non-mask、四个快捷方法的普通调用、callback、async callback 以及 API 关闭。"
      }
    }
  },
  render: renderInteractions,
  play: async ({ canvasElement, step }: ToastPlayContext) => {
    await runFullToastInteractionsPlay(canvasElement, step);
  }
};

export const ApiUsage: Story = {
  parameters: {
    docs: {
      description: {
        story: `演示通过组件方法 \`show(type, message)\` 或 \`success(message)\` 等快捷方法触发普通提示，通过 \`show(callback)\` 内的 \`instance.done(type, message)\` 或快捷 callback 内的 \`instance.done(message)\` 再进入最终态，并通过 \`hide()\` 主动关闭；事件会同步输出到 Actions 面板。

\`\`\`ts
await toast.show("success", "保存成功");
await toast.success("保存成功");
await toast.error("保存失败");
await toast.warning("请注意");
await toast.info("普通提示");
await toast.success('保存 <strong>成功</strong>');

const result = await toast.show((instance) => {
  instance.done("info", "同步任务完成");
  return "张三";
});

const maskedResult = await toast.show((instance) => {
  instance.done("success", "同步任务完成（带遮罩）");
  return "李四";
}, true);

const syncResult = await toast.info((instance) => {
  instance.done("同步任务完成");
  return "张三";
});

const warningResult = await toast.warning((instance) => {
  instance.done("请确认后继续");
  return "warning-done";
});

const errorResult = await toast.error((instance) => {
  instance.done("提交失败");
  return "error-done";
});

const asyncResult = await toast.success(async (instance) => {
  await saveData();
  instance.done("异步保存成功（无遮罩）");
  return "张三";
});

const asyncMaskResult = await toast.success(async (instance) => {
  await saveData();
  instance.done("异步保存成功（带遮罩）");
  return "张三";
}, true);
\`\`\``
      }
    }
  },
  render: renderDemo
};
