import { LitElement } from "lit";
import type { PropertyValues } from "lit";

type LitUpdateHost = LitElement & {
  renderRoot?: ShadowRoot;
  isUpdatePending: boolean;
  _$AL: PropertyValues;
  _$EM?(): void;
  updated(changed: PropertyValues): void;
};

export type LitDsdOptions = {
  /** 去重选择器列表：保留首个 SSR 节点，移除 Lit 重复 render 产生的副本 */
  dedupe?: string[];
};

/** Lit 在 DSD 首帧需手动绑定 renderRoot（TS 声明为 readonly，运行时可写） */
export function ensureRenderRoot(host: LitElement): void {
  if (!host.renderRoot && host.shadowRoot) {
    (host as LitUpdateHost).renderRoot = host.shadowRoot;
  }
}

/** 移除 Lit 误 render 产生的重复 DSD 节点（保留首个 SSR 节点） */
export function dedupeShadowDsdContent(root: ShadowRoot, selectors: string | string[]) {
  const list = Array.isArray(selectors) ? selectors : [selectors];
  for (const selector of list) {
    const trimmed = selector.trim();
    if (!trimmed) continue;
    const nodes = root.querySelectorAll(trimmed);
    for (let i = nodes.length - 1; i >= 1; i -= 1) {
      nodes[i].remove();
    }
  }
}

/** DSD 已接管 shadow 后禁止 Lit 再次 render，交互改由组件内 DOM 同步 */
function shouldBlockLitRenderAfterDsd(host: { dsdRenderSkipped?: boolean }) {
  return Boolean(host.dsdRenderSkipped);
}

function hasDsdMarker(root: ShadowRoot | null, markerSelector: string): boolean {
  return Boolean(root?.querySelector(markerSelector));
}

/** Lit 2.x：shouldUpdate 返回 false 时不会调用 firstUpdated/updated，需手动补全 */
function finishUpdateWithoutRender(host: LitUpdateHost, changed: PropertyValues) {
  ensureRenderRoot(host);
  const lifecycle = host as unknown as {
    firstUpdated(changed?: PropertyValues): void;
    updated(changed: PropertyValues): void;
  };
  if (!host.hasUpdated) {
    host.hasUpdated = true;
    lifecycle.firstUpdated(changed);
  }
  if (changed) {
    lifecycle.updated(changed);
  }
  if (typeof host._$EM === "function") {
    host._$EM();
  } else {
    host.isUpdatePending = false;
    host._$AL = new Map();
  }
}

/**
 * Lit DSD 首帧：复用 Declarative Shadow Root，跳过 render 但保留更新生命周期。
 * 须在 @customElement 注册之后调用（会 patch prototype）。
 */
export function applyLitDsd<T extends LitElement>(
  proto: { prototype: T },
  markerSelector: string,
  bootstrap: (el: T) => void,
  options: LitDsdOptions = {},
) {
  const dedupeSelectors = options.dedupe ?? [markerSelector];

  type Host = T & {
    shadowRoot: ShadowRoot | null;
    hasUpdated: boolean;
    dsdInitialBootstrapped?: boolean;
    dsdRenderSkipped?: boolean;
    dsdGeometryBootstrapped?: boolean;
    createRenderRoot(): ShadowRoot;
    shouldUpdate(changed: PropertyValues): boolean;
    firstUpdated?(changed: PropertyValues): void;
    performUpdate(): void;
  };

  const hostProto = proto.prototype as Host;
  const originalFirstUpdated = hostProto.firstUpdated;
  const originalPerformUpdate = hostProto.performUpdate;

  const runBootstrap = (host: Host) => {
    if (host.shadowRoot) {
      dedupeShadowDsdContent(host.shadowRoot, dedupeSelectors);
    }
    bootstrap(host);
  };

  hostProto.createRenderRoot = function (this: Host) {
    if (this.shadowRoot) {
      if (hasDsdMarker(this.shadowRoot, markerSelector)) {
        this.dsdInitialBootstrapped = true;
        this.dsdRenderSkipped = true;
      }
      return this.shadowRoot;
    }
    return (LitElement.prototype as Host).createRenderRoot.call(this);
  };

  hostProto.shouldUpdate = function (this: Host, changed: PropertyValues) {
    if (shouldBlockLitRenderAfterDsd(this)) {
      return false;
    }
    return (LitElement.prototype as Host).shouldUpdate.call(this, changed);
  };

  hostProto.firstUpdated = function (this: Host, changed: PropertyValues) {
    if (this.dsdInitialBootstrapped) {
      return;
    }
    originalFirstUpdated?.call(this, changed);
  };

  hostProto.performUpdate = function (this: Host) {
    const changed = (this as unknown as LitUpdateHost)._$AL;
    ensureRenderRoot(this);
    const shouldRender = hostProto.shouldUpdate!.call(this, changed);
    if (!shouldRender) {
      if (this.dsdInitialBootstrapped && !this.dsdGeometryBootstrapped) {
        this.dsdGeometryBootstrapped = true;
        runBootstrap(this);
      }
      finishUpdateWithoutRender(this as unknown as LitUpdateHost, changed);
      return;
    }
    const result = originalPerformUpdate?.call(this);
    if (this.shadowRoot && (this.dsdRenderSkipped || hasDsdMarker(this.shadowRoot, markerSelector))) {
      dedupeShadowDsdContent(this.shadowRoot, dedupeSelectors);
    }
    return result;
  };
}
