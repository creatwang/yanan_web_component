import { PullCordThemeCache } from "./pull-cord-theme-cache";

export type PullCordRopeEngineOptions = {
  canvas: HTMLCanvasElement;
  host: HTMLElement;
  getChecked: () => boolean;
  getDisabled: () => boolean;
  /** 未设置时回退到 CSS `--yn-pull-cord-switch-toggle-threshold` */
  getToggleThreshold: () => number | undefined;
  onCheckedChange: (checked: boolean) => void;
  onCardTransform: (transform: { x: number; y: number; tilt: number }) => void;
};

const SEGMENTS = 10;
const GRAVITY = 0.42;
const FRICTION = 0.988;
const ITERATIONS = 5;
const SPRING_K = 0.11;
const SPRING_DAMP = 0.78;
const BOUNCE = 0.62;
const IDLE_EPS = 0.35;
const IDLE_FRAMES = 24;
const CARD_POS_EPS = 0.4;
const TILT_EPS = 0.002;

export class PullCordRopeEngine {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly options: PullCordRopeEngineOptions;
  private readonly theme: PullCordThemeCache;
  private readonly n: number;
  private readonly px: Float32Array;
  private readonly py: Float32Array;
  private readonly pox: Float32Array;
  private readonly poy: Float32Array;

  private w = 1;
  private h = 1;
  private dpr = 1;
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
  private sleeping = false;
  private idleFrames = 0;
  private lastCardX = 0;
  private lastCardY = 0;
  private lastTilt = 0;
  private resizeObserver: ResizeObserver | null = null;
  private intersectionObserver: IntersectionObserver | null = null;
  private visible = true;

  private bgGrad: CanvasGradient | null = null;
  private ropeGrad: CanvasGradient | null = null;
  private vignetteGrad: CanvasGradient | null = null;
  private glowGrad: CanvasGradient | null = null;
  private themeKey = "";

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
    const ctx = options.canvas.getContext("2d", { alpha: false, desynchronized: true });
    if (!ctx) throw new Error("CANVAS_2D_UNAVAILABLE");
    this.ctx = ctx;
    this.n = SEGMENTS + 1;
    this.px = new Float32Array(this.n);
    this.py = new Float32Array(this.n);
    this.pox = new Float32Array(this.n);
    this.poy = new Float32Array(this.n);
  }

  start() {
    this.resize();
    this.resizeObserver = new ResizeObserver(this.onResize);
    this.resizeObserver.observe(this.canvas);
    if (typeof IntersectionObserver !== "undefined") {
      this.intersectionObserver = new IntersectionObserver(this.onVisibility, { threshold: 0.05 });
      this.intersectionObserver.observe(this.canvas);
    }
    this.canvas.addEventListener("pointerdown", this.onDown, { passive: false });
    this.canvas.addEventListener("pointermove", this.onMove, { passive: false });
    this.canvas.addEventListener("pointerup", this.onUp);
    this.canvas.addEventListener("pointercancel", this.onUp);
    this.wake();
  }

  stop() {
    this.sleep();
    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();
    this.canvas.removeEventListener("pointerdown", this.onDown);
    this.canvas.removeEventListener("pointermove", this.onMove);
    this.canvas.removeEventListener("pointerup", this.onUp);
    this.canvas.removeEventListener("pointercancel", this.onUp);
  }

  invalidateTheme() {
    this.theme.invalidate();
    this.themeKey = "";
  }

  requestFrame() {
    this.wake();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = Math.max(1, rect.width);
    this.h = Math.max(1, rect.height);
    this.canvas.width = Math.floor(this.w * this.dpr);
    this.canvas.height = Math.floor(this.h * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.themeKey = "";
    this.theme.beginFrame(0);
    this.initRope();
    this.wake();
  }

  private segLen() {
    return this.theme.num("--yn-pull-cord-switch-segment-len");
  }

  private cardOff() {
    return this.theme.num("--yn-pull-cord-switch-card-offset");
  }

  private maxPull() {
    return this.theme.num("--yn-pull-cord-switch-max-pull");
  }

  private toggleThreshold() {
    const override = this.options.getToggleThreshold();
    if (override != null && Number.isFinite(override)) return override;
    return this.theme.num("--yn-pull-cord-switch-toggle-threshold");
  }

  private initRope() {
    this.syncAnchor();
    const seg = this.segLen();
    for (let i = 0; i < this.n; i++) {
      this.px[i] = this.anchorX;
      this.py[i] = this.anchorY + i * seg;
      this.pox[i] = this.px[i];
      this.poy[i] = this.py[i];
    }
    this.syncEnd();
  }

  private syncAnchor() {
    const ratio = this.theme.num("--yn-pull-cord-switch-anchor-y");
    this.anchorX = this.w * 0.5;
    this.anchorY = this.h * ratio;
    this.restEndY = this.anchorY + SEGMENTS * this.segLen();
  }

  private syncEnd() {
    const end = this.n - 1;
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

  private cardW() {
    return this.theme.num("--yn-pull-cord-switch-card-width");
  }

  private cardH() {
    return this.theme.num("--yn-pull-cord-switch-card-height");
  }

  private hitTarget(px: number, py: number) {
    const end = this.n - 1;
    const cw = this.cardW();
    const ch = this.cardH();
    const cx = this.px[end];
    const cy = this.py[end] + this.cardOff();
    const pad = Math.max(14, this.cardW() * 0.26);
    const left = cx - cw / 2 - pad;
    const right = cx + cw / 2 + pad;
    const top = cy - ch / 2 - pad;
    const bottom = cy + ch / 2 + pad;
    if (px >= left && px <= right && py >= top && py <= bottom) return true;
    const ropePad = Math.max(16, this.cardW() * 0.24);
    if (px < this.anchorX - ropePad || px > this.anchorX + ropePad) return false;
    return py >= this.py[end] - 12 && py <= bottom;
  }

  private verlet() {
    const end = this.n - 1;
    for (let i = 1; i < this.n; i++) {
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
    const end = this.n - 1;
    const dragIdx = end - 1;
    for (let iter = 0; iter < ITERATIONS; iter++) {
      for (let i = 0; i < end; i++) {
        const dx = this.px[i + 1] - this.px[i];
        const dy = this.py[i + 1] - this.py[i];
        const dist = Math.hypot(dx, dy) || 1e-4;
        const diff = (dist - this.segLen()) / dist;
        const ox = dx * diff * 0.5;
        const oy = dy * diff * 0.5;
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
    const force = -this.pull * SPRING_K;
    this.pullVel = (this.pullVel + force) * SPRING_DAMP;
    this.pull += this.pullVel;
    const end = this.n - 1;
    const targetY = this.restEndY + this.pull;
    this.py[end] += (targetY - this.py[end]) * 0.35;
    this.px[end] += (this.anchorX - this.px[end]) * 0.2;
  }

  private kineticEnergy() {
    let e = Math.abs(this.pullVel);
    const end = this.n - 1;
    for (let i = 1; i < this.n; i++) {
      const vx = this.px[i] - this.pox[i];
      const vy = this.py[i] - this.poy[i];
      e += Math.abs(vx) + Math.abs(vy);
      if (i === end) continue;
    }
    return e;
  }

  private ensureGradients(checked: boolean) {
    const key = `${checked}|${this.w}|${this.h}|${this.theme.revision}`;
    if (key === this.themeKey) return;
    this.themeKey = key;
    const top = this.theme.get(checked ? "--yn-pull-cord-switch-bg-on-top" : "--yn-pull-cord-switch-bg-top");
    const bottom = this.theme.get(
      checked ? "--yn-pull-cord-switch-bg-on-bottom" : "--yn-pull-cord-switch-bg-bottom"
    );
    this.bgGrad = this.ctx.createLinearGradient(0, 0, 0, this.h);
    this.bgGrad.addColorStop(0, top);
    this.bgGrad.addColorStop(1, bottom);

    const end = this.n - 1;
    this.ropeGrad = this.ctx.createLinearGradient(
      this.px[0],
      this.py[0],
      this.px[end],
      this.py[end] + 40
    );
    this.ropeGrad.addColorStop(0, this.theme.get("--yn-pull-cord-switch-rope-start"));
    this.ropeGrad.addColorStop(1, this.theme.get("--yn-pull-cord-switch-rope-end"));

    const vig = Math.min(1, Math.max(0, this.theme.num("--yn-pull-cord-switch-vignette")));
    this.vignetteGrad = this.ctx.createRadialGradient(
      this.w * 0.5,
      this.h * 0.35,
      40,
      this.w * 0.5,
      this.h * 0.5,
      Math.max(this.w, this.h) * 0.75
    );
    this.vignetteGrad.addColorStop(0, "transparent");
    this.vignetteGrad.addColorStop(1, `rgba(0,0,0,${vig})`);

    if (checked) {
      const accent = this.theme.get("--yn-pull-cord-switch-accent");
      this.glowGrad = this.ctx.createRadialGradient(this.anchorX, this.anchorY, 4, this.anchorX, this.anchorY + 40, 120);
      this.glowGrad.addColorStop(0, accent);
      this.glowGrad.addColorStop(1, "rgba(255,214,102,0)");
    } else {
      this.glowGrad = null;
    }
  }

  private traceRope() {
    this.ctx.beginPath();
    this.ctx.moveTo(this.px[0], this.py[0]);
    for (let i = 1; i < this.n; i++) {
      const mx = (this.px[i - 1] + this.px[i]) * 0.5;
      const my = (this.py[i - 1] + this.py[i]) * 0.5;
      this.ctx.quadraticCurveTo(this.px[i - 1], this.py[i - 1], mx, my);
    }
    const end = this.n - 1;
    this.ctx.lineTo(this.px[end], this.py[end]);
  }

  private draw() {
    const checked = this.options.getChecked();
    this.syncAnchor();
    this.ensureGradients(checked);

    const ctx = this.ctx;
    ctx.fillStyle = this.bgGrad!;
    ctx.fillRect(0, 0, this.w, this.h);

    const aw = this.theme.num("--yn-pull-cord-switch-ceiling-width");
    const ceilingH = Math.max(7, aw * 0.18);
    const ceilingLift = ceilingH + 8;
    ctx.fillStyle = this.theme.get("--yn-pull-cord-switch-ceiling-bg");
    ctx.beginPath();
    ctx.roundRect(this.anchorX - aw / 2, this.anchorY - ceilingLift, aw, ceilingH, 4);
    ctx.fill();

    if (this.glowGrad) {
      ctx.fillStyle = this.glowGrad;
      ctx.fillRect(this.anchorX - 140, this.anchorY - 20, 280, 200);
    }

    ctx.fillStyle = this.theme.get("--yn-pull-cord-switch-anchor-color");
    ctx.beginPath();
    ctx.arc(this.anchorX, this.anchorY, Math.max(3.5, aw * 0.09), 0, 6.283);
    ctx.fill();

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    this.traceRope();
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = this.theme.num("--yn-pull-cord-switch-rope-shadow-width");
    ctx.stroke();
    this.traceRope();
    ctx.strokeStyle = this.ropeGrad!;
    ctx.lineWidth = this.theme.num("--yn-pull-cord-switch-rope-width");
    ctx.stroke();

    const end = this.n - 1;
    const cardTop = this.py[end] + this.cardOff() - this.cardH() / 2;
    ctx.strokeStyle = "rgba(0,0,0,0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.px[end], this.py[end]);
    ctx.lineTo(this.px[end], cardTop);
    ctx.stroke();

    if (this.vignetteGrad) {
      ctx.fillStyle = this.vignetteGrad;
      ctx.fillRect(0, 0, this.w, this.h);
    }

    this.emitCard(end);
  }

  private emitCard(end: number) {
    const x = this.px[end];
    const y = this.py[end] + this.cardOff();
    const tilt = Math.max(-0.12, Math.min(0.12, (x - this.anchorX) * 0.004));
    if (
      Math.abs(x - this.lastCardX) < CARD_POS_EPS &&
      Math.abs(y - this.lastCardY) < CARD_POS_EPS &&
      Math.abs(tilt - this.lastTilt) < TILT_EPS
    ) {
      return;
    }
    this.lastCardX = x;
    this.lastCardY = y;
    this.lastTilt = tilt;
    this.options.onCardTransform({ x, y, tilt });
  }

  private step() {
    this.verlet();
    this.constrain();
    this.spring();
    this.constrain();
  }

  private tick = () => {
    if (!this.visible) {
      this.sleeping = true;
      return;
    }
    this.theme.beginFrame(performance.now());
    this.step();
    const energy = this.kineticEnergy();
    const needsDraw = this.dragging || energy > IDLE_EPS || this.idleFrames < 4;
    if (needsDraw) this.draw();

    if (!this.dragging && energy < IDLE_EPS) {
      this.idleFrames++;
      if (this.idleFrames >= IDLE_FRAMES) {
        if (!needsDraw) this.draw();
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

  private pointerPos(e: PointerEvent) {
    const r = this.canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  private handleDown(e: PointerEvent) {
    if (this.options.getDisabled() || e.button !== 0) return;
    const p = this.pointerPos(e);
    if (!this.hitTarget(p.x, p.y)) return;
    e.preventDefault();
    this.wake();
    this.dragging = true;
    this.pointerId = e.pointerId;
    this.canvas.setPointerCapture(e.pointerId);
    this.toggledThisDrag = false;
    const end = this.n - 1;
    this.dragOffsetY = p.y - (this.py[end] + this.cardOff());
    this.dragEndX = this.px[end];
    this.dragEndY = this.py[end];
    this.lastDragY = p.y;
    this.lastDragT = performance.now();
  }

  private handleMove(e: PointerEvent) {
    if (!this.dragging || e.pointerId !== this.pointerId) return;
    e.preventDefault();
    const p = this.pointerPos(e);
    const end = this.n - 1;
    const cardY = p.y - this.dragOffsetY - this.cardOff();
    this.dragEndY = Math.min(this.restEndY + this.maxPull(), Math.max(this.restEndY, cardY));
    this.dragEndX = this.anchorX + (p.x - this.anchorX) * 0.15;
    this.px[end] = this.dragEndX;
    this.py[end] = this.dragEndY;
    this.pox[end] = this.dragEndX;
    this.poy[end] = this.dragEndY;
    this.pull = this.dragEndY - this.restEndY;

    if (!this.toggledThisDrag && this.pull >= this.toggleThreshold()) {
      this.options.onCheckedChange(!this.options.getChecked());
      this.toggledThisDrag = true;
      this.themeKey = "";
    }

    const now = performance.now();
    const dt = Math.max(8, now - this.lastDragT);
    this.lastDragVy = (p.y - this.lastDragY) / dt;
    this.lastDragY = p.y;
    this.lastDragT = now;
  }

  private handleUp(e: PointerEvent) {
    if (!this.dragging || e.pointerId !== this.pointerId) return;
    this.dragging = false;
    this.pointerId = null;
    try {
      this.canvas.releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
    this.pullVel = this.lastDragVy * 28 + this.pull * 0.06;
    const end = this.n - 1;
    const vy = this.py[end] - this.poy[end];
    this.poy[end] = this.py[end] - vy * BOUNCE;
    this.wake();
  }
}
