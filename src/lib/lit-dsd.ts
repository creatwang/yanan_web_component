import { LitElement } from "lit";
import type { PropertyValues } from "lit";

type LitUpdateHost = LitElement & {
  renderRoot?: ShadowRoot;
  isUpdatePending: boolean;
  _$AL: PropertyValues;
  _$EM?(): void;
  updated(changed: PropertyValues): void;
};

/** Lit 在 DSD 首帧需手动绑定 renderRoot（TS 声明为 readonly，运行时可写） */
export function ensureRenderRoot(host: LitElement): void {
  if (!host.renderRoot && host.shadowRoot) {
    (host as LitUpdateHost).renderRoot = host.shadowRoot;
  }
}

/** 移除 Lit 误 render 产生的重复 DSD 节点（保留首个 SSR 节点） */
export function dedupeShadowDsdContent(root: ShadowRoot, markerSelector: string) {
  const marker = markerSelector.trim();
  if (marker.startsWith("#")) {
    const id = marker.slice(1).split(/[\s.[]/)[0];
    const nodes = root.querySelectorAll(`#${id}`);
    for (let i = nodes.length - 1; i >= 1; i -= 1) {
      nodes[i].remove();
    }
    return;
  }
  if (marker.includes(".root")) {
    const roots = root.querySelectorAll(".root");
    for (let i = roots.length - 1; i >= 1; i -= 1) {
      roots[i].remove();
    }
    return;
  }
  if (marker.includes("drawerPopover") || marker.includes("#drawerPopover")) {
    const popovers = root.querySelectorAll("#drawerPopover");
    for (let i = popovers.length - 1; i >= 1; i -= 1) {
      popovers[i].remove();
    }
    const wraps = root.querySelectorAll(".trigger-wrap");
    for (let i = wraps.length - 1; i >= 1; i -= 1) {
      wraps[i].remove();
    }
    return;
  }
  if (marker.includes(".button") || marker.includes("button.button")) {
    const buttons = root.querySelectorAll(":scope > button.button, button.button");
    for (let i = buttons.length - 1; i >= 1; i -= 1) {
      buttons[i].remove();
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
) {
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
      dedupeShadowDsdContent(host.shadowRoot, markerSelector);
    }
    bootstrap(host);
  };

  hostProto.createRenderRoot = function (this: Host) {
    if (this.shadowRoot) return this.shadowRoot;
    return (LitElement.prototype as Host).createRenderRoot.call(this);
  };

  hostProto.shouldUpdate = function (this: Host, changed: PropertyValues) {
    if (shouldBlockLitRenderAfterDsd(this)) {
      return false;
    }
    if (hasDsdMarker(this.shadowRoot, markerSelector)) {
      this.dsdInitialBootstrapped = true;
      this.dsdRenderSkipped = true;
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
    return originalPerformUpdate?.call(this);
  };
}
