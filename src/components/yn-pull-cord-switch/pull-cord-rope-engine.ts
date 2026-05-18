import { PullCordThemeCache } from "./pull-cord-theme-cache";

export type PullCordCardMetrics = { width: number; height: number };

export type PullCordCardAnchor = "center" | "top";

export type PullCordRopeEngineOptions = {
  canvas: HTMLCanvasElement;
  host: HTMLElement;
  getChecked: () => boolean;
  getDisabled: () => boolean;
  getToggleThreshold?: () => number | undefined;
  getCardMetrics?: () => PullCordCardMetrics | null;
  getCardAnchor?: () => PullCordCardAnchor;
  onCheckedChange: (checked: boolean) => void;
  onCardTransform: (transform: { x: number; y: number; tilt: number }) => void;
};

const MAX_SEG = 14;
const GRAVITY = 0.42;
const FRICTION = 0.988;
const ITER = 5;
const SPRING_K = 0.11;
const SPRING_DAMP = 0.78;
const BOUNCE = 0.62;
const IDLE_EPS = 0.35;
const IDLE_FRAMES = 24;
const CARD_EPS = 0.4;
const TILT_EPS = 0.002;
const TAU = 6.283;

const resolveAnchor = (canvasH: number, ceilingW: number, extra: number) => {
  const ceilingH = Math.max(7, ceilingW * 0.18);
  const anchorR = Math.max(3.5, ceilingW * 0.09);
  const ceilingTop = canvasH * Math.max(0, extra);
  const anchorCenterY = ceilingTop + ceilingH + anchorR;
  return { ceilingH, anchorR, ceilingTop, anchorCenterY };
};

type FrameSnap = {
  seg: number;
  segLen: number;
  cardOff: number;
  maxPull: number;
  toggleTh: number;
  cardW: number;
  cardH: number;
  ceilingW: number;
  ropeW: number;
  ropeShadowW: number;
  card: PullCordCardMetrics;
  checked: boolean;
  cardTopAnchor: boolean;
  ceilingH: number;
  anchorR: number;
  ceilingTop: number;
};

export class PullCordRopeEngine {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly options: PullCordRopeEngineOptions;
  private readonly theme: PullCordThemeCache;
  private readonly px = new Float32Array(MAX_SEG + 1);
  private readonly py = new Float32Array(MAX_SEG + 1);
  private readonly pox = new Float32Array(MAX_SEG + 1);
  private readonly poy = new Float32Array(MAX_SEG + 1);

  private w = 1;
  private h = 1;
  private layoutW = 0;
  private layoutH = 0;
  private anchorExtra = -1;
  private anchorX = 0;
  private anchorY = 0;
  private restEndY = 0;
  private pull = 0;
  private pullVel = 0;
  private dragging = false;
  private dragOffsetY = 0;
  private pointerId: number | null = null;
  private toggledThisDrag = false;
  private lastDragY = 0;
  private lastDragT = 0;
  private lastDragVy = 0;
  private dragEndX = 0;
  private dragEndY = 0;
  private rafId = 0;
  private sleeping = true;
  private idleFrames = 0;
  private lastCardX = 0;
  private lastCardY = 0;
  private lastTilt = 0;
  private pointerLeft = 0;
  private pointerTop = 0;
  private frameId = -1;
  private gradKey = "";
  private ropeGrad: CanvasGradient | null = null;
  private glowGrad: CanvasGradient | null = null;
  private snap!: FrameSnap;

  private resizeObserver: ResizeObserver | null = null;
  private intersectionObserver: IntersectionObserver | null = null;
  private visible = true;
  private interactionTargets: HTMLElement[] = [];

  private readonly onDown = (e: PointerEvent) => this.handleDown(e);
  private readonly onMove = (e: PointerEvent) => this.handleMove(e);
  private readonly onUp = (e: PointerEvent) => this.handleUp(e);
  private readonly onResize = () => this.resize();
  private readonly onVisibility = (entries: IntersectionObserverEntry[]) => {
    this.visible = entries[0]?.isIntersecting ?? true;
    if (this.visible) this.wake();
    else this.sleep();
  };

  constructor(options: PullCordRopeEngineOptions) {
    this.options = options;
    this.canvas = options.canvas;
    this.theme = new PullCordThemeCache(options.host);
    const ctx = options.canvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!ctx) throw new Error("CANVAS_2D_UNAVAILABLE");
    this.ctx = ctx;
  }

  start() {
    this.resize();
    this.resizeObserver = new ResizeObserver(this.onResize);
    this.resizeObserver.observe(this.canvas);
    if (typeof IntersectionObserver !== "undefined") {
      this.intersectionObserver = new IntersectionObserver(this.onVisibility, { threshold: 0.05 });
      this.intersectionObserver.observe(this.canvas);
    }
    this.interactionTargets = [this.canvas];
    this.bindPointers();
    this.wake();
  }

  stop() {
    this.sleep();
    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();
    this.unbindPointers();
  }

  setInteractionTargets(targets: HTMLElement[]) {
    this.unbindPointers();
    this.interactionTargets = targets.length ? targets : [this.canvas];
    this.bindPointers();
  }

  invalidateTheme() {
    this.theme.invalidate();
    this.gradKey = "";
  }

  requestFrame() {
    this.wake();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = Math.max(1, rect.width);
    this.h = Math.max(1, rect.height);
    this.canvas.width = Math.floor(this.w * dpr);
    this.canvas.height = Math.floor(this.h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.layoutW = 0;
    this.frameId = -1;
    this.gradKey = "";
    this.beginSnap(performance.now());
    this.relayout();
    this.wake();
  }

  private bindPointers() {
    for (const t of this.interactionTargets) {
      const capture = t !== this.canvas;
      t.addEventListener("pointerdown", this.onDown, { passive: false, capture });
      t.addEventListener("pointermove", this.onMove, { passive: false, capture });
      t.addEventListener("pointerup", this.onUp, { capture });
      t.addEventListener("pointercancel", this.onUp, { capture });
    }
  }

  private unbindPointers() {
    for (const t of this.interactionTargets) {
      const capture = t !== this.canvas;
      t.removeEventListener("pointerdown", this.onDown, capture);
      t.removeEventListener("pointermove", this.onMove, capture);
      t.removeEventListener("pointerup", this.onUp, capture);
      t.removeEventListener("pointercancel", this.onUp, capture);
    }
  }

  private beginSnap(now: number) {
    if (this.frameId === now) return;
    this.frameId = now;
    this.theme.beginFrame(now);
    const t = this.theme;
    const rawSeg = Math.round(t.num("--yn-pull-cord-switch-segment-count"));
    const seg = rawSeg >= 4 && rawSeg <= MAX_SEG ? rawSeg : 10;
    const cardW = t.num("--yn-pull-cord-switch-card-width");
    const cardH = t.num("--yn-pull-cord-switch-card-height");
    const measured = this.options.getCardMetrics?.();
    const card =
      measured && measured.width > 0 && measured.height > 0
        ? measured
        : { width: cardW, height: cardH };
    const override = this.options.getToggleThreshold?.();
    const extra = t.num("--yn-pull-cord-switch-anchor-y");
    if (this.anchorExtra !== extra) {
      this.anchorExtra = extra;
      this.layoutW = 0;
    }
    const ceilingW = t.num("--yn-pull-cord-switch-ceiling-width");
    const anchor = resolveAnchor(this.h, ceilingW, extra);
    this.snap = {
      seg,
      segLen: t.num("--yn-pull-cord-switch-segment-len"),
      cardOff: t.num("--yn-pull-cord-switch-card-offset"),
      maxPull: t.num("--yn-pull-cord-switch-max-pull"),
      toggleTh:
        override != null && Number.isFinite(override)
          ? override
          : t.num("--yn-pull-cord-switch-toggle-threshold"),
      cardW,
      cardH,
      ceilingW,
      ropeW: t.num("--yn-pull-cord-switch-rope-width"),
      ropeShadowW: t.num("--yn-pull-cord-switch-rope-shadow-width"),
      card,
      checked: this.options.getChecked(),
      cardTopAnchor: (this.options.getCardAnchor?.() ?? "center") === "top",
      ceilingH: anchor.ceilingH,
      anchorR: anchor.anchorR,
      ceilingTop: anchor.ceilingTop
    };
  }

  private relayout() {
    const { ceilingW } = this.snap;
    const layout = resolveAnchor(this.h, ceilingW, this.anchorExtra);
    this.anchorX = this.w * 0.5;
    this.anchorY = layout.anchorCenterY;
    this.restEndY = this.anchorY + this.snap.seg * this.snap.segLen;
    this.layoutW = this.w;
    this.layoutH = this.h;
    this.snap.ceilingH = layout.ceilingH;
    this.snap.anchorR = layout.anchorR;
    this.snap.ceilingTop = layout.ceilingTop;
    const { seg, segLen } = this.snap;
    for (let i = 0; i <= seg; i++) {
      this.px[i] = this.anchorX;
      this.py[i] = this.anchorY + i * segLen;
      this.pox[i] = this.px[i];
      this.poy[i] = this.py[i];
    }
    this.syncEnd();
  }

  private syncLayout() {
    if (this.layoutW === this.w && this.layoutH === this.h) return;
    this.relayout();
  }

  private syncEnd() {
    const end = this.snap.seg;
    const y = this.restEndY + this.pull;
    this.px[end] = this.anchorX;
    this.py[end] = y;
    this.pox[end] = this.px[end];
    this.poy[end] = y;
    this.px[0] = this.anchorX;
    this.py[0] = this.anchorY;
    this.pox[0] = this.anchorX;
    this.poy[0] = this.anchorY;
  }

  private cardLayout(end: number) {
    const { card, cardOff, cardTopAnchor } = this.snap;
    const cx = this.px[end];
    const ropeY = this.py[end];
    if (cardTopAnchor) {
      const top = ropeY + cardOff;
      return { cx, top, bottom: top + card.height, attachY: top };
    }
    const cy = ropeY + cardOff;
    return { cx, top: cy - card.height / 2, bottom: cy + card.height / 2, attachY: cy };
  }

  private hitTarget(px: number, py: number) {
    const end = this.snap.seg;
    const { cardW } = this.snap;
    const { cx, top, bottom } = this.cardLayout(end);
    const hw = this.snap.card.width / 2;
    const pad = Math.max(14, cardW * 0.26);
    if (px >= cx - hw - pad && px <= cx + hw + pad && py >= top - pad && py <= bottom + pad) {
      return true;
    }
    const ropePad = Math.max(16, cardW * 0.24);
    return (
      px >= this.anchorX - ropePad &&
      px <= this.anchorX + ropePad &&
      py >= this.py[end] - 12 &&
      py <= bottom + pad
    );
  }

  private verlet() {
    const end = this.snap.seg;
    for (let i = 1; i <= end; i++) {
      if (this.dragging && i === end) continue;
      const vx = (this.px[i] - this.pox[i]) * FRICTION;
      const vy = (this.py[i] - this.poy[i]) * FRICTION;
      this.pox[i] = this.px[i];
      this.poy[i] = this.py[i];
      this.px[i] += vx;
      this.py[i] += vy + GRAVITY;
    }
  }

  private constrain() {
    const end = this.snap.seg;
    const dragIdx = end - 1;
    const segLen = this.snap.segLen;
    for (let iter = 0; iter < ITER; iter++) {
      for (let i = 0; i < end; i++) {
        const dx = this.px[i + 1] - this.px[i];
        const dy = this.py[i + 1] - this.py[i];
        const dist = Math.hypot(dx, dy) || 1e-4;
        const half = ((dist - segLen) / dist) * 0.5;
        const ox = dx * half;
        const oy = dy * half;
        if (i !== 0) {
          this.px[i] += ox;
          this.py[i] += oy;
        }
        if (!(this.dragging && i === dragIdx)) {
          this.px[i + 1] -= ox;
          this.py[i + 1] -= oy;
        }
      }
      this.px[0] = this.anchorX;
      this.py[0] = this.anchorY;
    }
    if (this.dragging) {
      this.px[end] = this.dragEndX;
      this.py[end] = this.dragEndY;
      this.pull = this.dragEndY - this.restEndY;
    }
  }

  private spring() {
    if (this.dragging) return;
    this.pullVel = (-this.pull * SPRING_K + this.pullVel) * SPRING_DAMP;
    this.pull += this.pullVel;
    const end = this.snap.seg;
    const targetY = this.restEndY + this.pull;
    this.py[end] += (targetY - this.py[end]) * 0.35;
    this.px[end] += (this.anchorX - this.px[end]) * 0.2;
  }

  private kineticEnergy() {
    let e = Math.abs(this.pullVel);
    const end = this.snap.seg;
    for (let i = 1; i <= end; i++) {
      e += Math.abs(this.px[i] - this.pox[i]) + Math.abs(this.py[i] - this.poy[i]);
    }
    return e;
  }

  private ensureGradients() {
    const { checked, seg } = this.snap;
    const key = `${checked}|${this.w}|${this.h}|${this.theme.token}`;
    if (key === this.gradKey) return;
    this.gradKey = key;
    const end = seg;
    this.ropeGrad = this.ctx.createLinearGradient(
      this.px[0],
      this.py[0],
      this.px[end],
      this.py[end] + 40
    );
    this.ropeGrad.addColorStop(0, this.theme.get("--yn-pull-cord-switch-rope-start"));
    this.ropeGrad.addColorStop(1, this.theme.get("--yn-pull-cord-switch-rope-end"));
    if (!checked) {
      this.glowGrad = null;
      return;
    }
    this.glowGrad = this.ctx.createRadialGradient(
      this.anchorX,
      this.anchorY,
      4,
      this.anchorX,
      this.anchorY + 40,
      120
    );
    this.glowGrad.addColorStop(0, this.theme.get("--yn-pull-cord-switch-accent"));
    this.glowGrad.addColorStop(1, "rgba(255,214,102,0)");
  }

  private strokeRope(shadow: boolean) {
    const end = this.snap.seg;
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(this.px[0], this.py[0]);
    for (let i = 1; i <= end; i++) {
      const mx = (this.px[i - 1] + this.px[i]) * 0.5;
      const my = (this.py[i - 1] + this.py[i]) * 0.5;
      ctx.quadraticCurveTo(this.px[i - 1], this.py[i - 1], mx, my);
    }
    ctx.lineTo(this.px[end], this.py[end]);
    ctx.strokeStyle = shadow ? "rgba(0,0,0,0.35)" : this.ropeGrad!;
    ctx.lineWidth = shadow ? this.snap.ropeShadowW : this.snap.ropeW;
    ctx.stroke();
  }

  private draw() {
    this.syncLayout();
    this.ensureGradients();
    const ctx = this.ctx;
    const { seg, ceilingW, ceilingH, anchorR, ceilingTop } = this.snap;

    ctx.clearRect(0, 0, this.w, this.h);
    ctx.fillStyle = this.theme.get("--yn-pull-cord-switch-ceiling-bg");
    ctx.beginPath();
    ctx.roundRect(this.anchorX - ceilingW / 2, ceilingTop, ceilingW, ceilingH, 4);
    ctx.fill();

    if (this.glowGrad) {
      const glowW = Math.max(280, this.theme.num("--yn-pull-cord-switch-glow-width") || 280);
      const glowH = Math.max(200, this.theme.num("--yn-pull-cord-switch-glow-height") || 200);
      ctx.fillStyle = this.glowGrad;
      ctx.fillRect(this.anchorX - glowW / 2, this.anchorY - 20, glowW, glowH);
    }

    ctx.fillStyle = this.theme.get("--yn-pull-cord-switch-anchor-color");
    ctx.beginPath();
    ctx.arc(this.anchorX, this.anchorY, anchorR, 0, TAU);
    ctx.fill();

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    this.strokeRope(true);
    this.strokeRope(false);

    const end = seg;
    const { attachY } = this.cardLayout(end);
    ctx.strokeStyle = "rgba(0,0,0,0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.px[end], this.py[end]);
    ctx.lineTo(this.px[end], attachY);
    ctx.stroke();

    this.emitCard(end);
  }

  private emitCard(end: number) {
    const x = this.px[end];
    const y = this.py[end] + this.snap.cardOff;
    const tilt = Math.max(-0.12, Math.min(0.12, (x - this.anchorX) * 0.004));
    if (
      Math.abs(x - this.lastCardX) < CARD_EPS &&
      Math.abs(y - this.lastCardY) < CARD_EPS &&
      Math.abs(tilt - this.lastTilt) < TILT_EPS
    ) {
      return;
    }
    this.lastCardX = x;
    this.lastCardY = y;
    this.lastTilt = tilt;
    this.options.onCardTransform({ x, y, tilt });
  }

  private tick = () => {
    if (!this.visible) {
      this.sleeping = true;
      return;
    }
    const now = performance.now();
    this.beginSnap(now);
    this.verlet();
    this.constrain();
    this.spring();
    this.constrain();

    const energy = this.kineticEnergy();
    const settling = this.idleFrames < 4;
    const active = this.dragging || energy > IDLE_EPS || settling;
    if (active) this.draw();

    if (!this.dragging && energy < IDLE_EPS) {
      if (++this.idleFrames >= IDLE_FRAMES) {
        if (!active) this.draw();
        this.sleeping = true;
        return;
      }
    } else {
      this.idleFrames = 0;
    }

    this.rafId = requestAnimationFrame(this.tick);
  };

  private wake() {
    if (!this.sleeping && this.rafId) return;
    this.sleeping = false;
    this.idleFrames = 0;
    cancelAnimationFrame(this.rafId);
    this.rafId = requestAnimationFrame(this.tick);
  }

  private sleep() {
    this.sleeping = true;
    cancelAnimationFrame(this.rafId);
    this.rafId = 0;
  }

  private cachePointerRect() {
    const r = this.canvas.getBoundingClientRect();
    this.pointerLeft = r.left;
    this.pointerTop = r.top;
  }

  private pointerPos(e: PointerEvent) {
    return { x: e.clientX - this.pointerLeft, y: e.clientY - this.pointerTop };
  }

  private handleDown(e: PointerEvent) {
    if (this.options.getDisabled() || e.button !== 0) return;
    this.cachePointerRect();
    this.beginSnap(performance.now());
    const p = this.pointerPos(e);
    if (!this.hitTarget(p.x, p.y)) return;
    e.preventDefault();
    this.wake();
    this.dragging = true;
    this.pointerId = e.pointerId;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    this.toggledThisDrag = false;
    const end = this.snap.seg;
    this.dragOffsetY = p.y - (this.py[end] + this.snap.cardOff);
    this.dragEndX = this.px[end];
    this.dragEndY = this.py[end];
    this.lastDragY = p.y;
    this.lastDragT = performance.now();
  }

  private handleMove(e: PointerEvent) {
    if (!this.dragging || e.pointerId !== this.pointerId) return;
    e.preventDefault();
    const p = this.pointerPos(e);
    const end = this.snap.seg;
    const { cardOff, maxPull, toggleTh } = this.snap;
    const cardY = p.y - this.dragOffsetY - cardOff;
    this.dragEndY = Math.min(this.restEndY + maxPull, Math.max(this.restEndY, cardY));
    this.dragEndX = this.anchorX + (p.x - this.anchorX) * 0.15;
    this.px[end] = this.dragEndX;
    this.py[end] = this.dragEndY;
    this.pox[end] = this.dragEndX;
    this.poy[end] = this.dragEndY;
    this.pull = this.dragEndY - this.restEndY;

    if (!this.toggledThisDrag && this.pull >= toggleTh) {
      this.options.onCheckedChange(!this.options.getChecked());
      this.toggledThisDrag = true;
      this.gradKey = "";
    }

    const now = performance.now();
    this.lastDragVy = (p.y - this.lastDragY) / Math.max(8, now - this.lastDragT);
    this.lastDragY = p.y;
    this.lastDragT = now;
  }

  private handleUp(e: PointerEvent) {
    if (!this.dragging || e.pointerId !== this.pointerId) return;
    this.dragging = false;
    this.pointerId = null;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
    this.pullVel = this.lastDragVy * 28 + this.pull * 0.06;
    const end = this.snap.seg;
    const vy = this.py[end] - this.poy[end];
    this.poy[end] = this.py[end] - vy * BOUNCE;
    this.wake();
  }
}
