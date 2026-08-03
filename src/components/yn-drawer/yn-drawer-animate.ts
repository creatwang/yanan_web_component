import gsap from "gsap";
import type { YnDrawerMotionMode } from "./yn-drawer-motion-resolve.js";

export type YnDrawerAnimateCallbacks = {
  onEnterComplete: () => void;
  onExitComplete: () => void;
};

export type YnDrawerAnimateOptions = {
  exitSpeed?: number;
  easeReverse?: boolean;
  reduceMotion?: boolean;
  mode?: YnDrawerMotionMode;
};

export type YnDrawerAnimateTargets = {
  panels: HTMLElement[];
  reco: HTMLElement[];
  recoRoot?: HTMLElement | null;
  stack?: HTMLElement | null;
};

export type YnDrawerAnimator = {
  open: () => void;
  close: () => void;
  dispose: () => void;
  setTargets: (targets: YnDrawerAnimateTargets) => void;
  setOptions: (options: YnDrawerAnimateOptions) => void;
  seekOpenImmediate: () => void;
};

const EPS = 0.001;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)
  );
}

function sameElements(a: HTMLElement[], b: HTMLElement[]) {
  return a.length === b.length && a.every((el, i) => el === b[i]);
}

/** 固定层 + GSAP 单时间轴：入场 pause → 退场，无 popover 双段 */
export function createYnDrawerAnimator(
  scope: HTMLElement,
  backdrop: HTMLElement,
  targets: YnDrawerAnimateTargets,
  callbacks: YnDrawerAnimateCallbacks,
  options: YnDrawerAnimateOptions = {},
): YnDrawerAnimator {
  let ctx: gsap.Context | undefined;
  let tl: gsap.core.Timeline | undefined;
  let enterEndTime = 0;
  let cards: HTMLElement[] = [];
  let recoRoot: HTMLElement | null = null;
  let stack: HTMLElement | null = null;
  let isOpen = false;
  let enterDone = false;
  let exitDone = false;
  let opts = { ...options };

  const durationScale = () =>
    (opts.reduceMotion ?? prefersReducedMotion()) ? 0.01 : 1;

  const easeRev = (ease: string) => (opts.easeReverse === false ? false : ease);
  const mode = () => opts.mode ?? "side";

  const collectCards = (next: YnDrawerAnimateTargets) => [
    ...next.panels,
    ...next.reco,
  ];

  const collectSheetTargets = () => (stack ? [stack] : targets.panels);

  const paintClosed = () => {
    gsap.set(scope, { autoAlpha: 0, force3D: true });
    gsap.set(backdrop, { opacity: 0 });
    if (recoRoot) gsap.set(recoRoot, { autoAlpha: 1, x: 0, y: 0 });
    const sheetTargets = collectSheetTargets();
    if (mode() === "sheet" && sheetTargets.length) {
      gsap.set(sheetTargets, {
        x: 0,
        y: "110%",
        rotation: 0,
        opacity: 1,
        force3D: true,
        transformOrigin: "50% 50%",
      });
    } else if (cards.length) {
      gsap.set(cards, {
        x: "110%",
        y: 0,
        rotation: 0,
        opacity: 0,
        force3D: true,
        transformOrigin: "50% 50%",
      });
    }
  };

  const paintOpen = () => {
    gsap.set(scope, { autoAlpha: 1, force3D: true });
    gsap.set(backdrop, { opacity: 1 });
    if (recoRoot) gsap.set(recoRoot, { autoAlpha: 1, x: 0, y: 0 });
    const motionTargets = mode() === "sheet" ? collectSheetTargets() : cards;
    if (motionTargets.length) {
      gsap.set(motionTargets, {
        x: 0,
        y: 0,
        rotation: 0,
        opacity: 1,
        force3D: true,
      });
    }
  };

  const onEnter = () => {
    if (enterDone) return;
    enterDone = true;
    callbacks.onEnterComplete();
  };

  const onExit = () => {
    if (exitDone) return;
    exitDone = true;
    isOpen = false;
    tl?.pause(0);
    paintClosed();
    callbacks.onExitComplete();
  };

  const build = () => {
    ctx?.revert();
    enterDone = false;
    exitDone = false;
    const d = durationScale();

    ctx = gsap.context(() => {
      paintClosed();

      tl = gsap
        .timeline({
          paused: true,
          defaults: { force3D: true },
          onComplete: onExit,
          onReverseComplete: onExit,
        })
        .set(scope, { autoAlpha: 1 })
        .to(
          backdrop,
          {
            opacity: 1,
            duration: 0.4 * d,
            ease: "power2.out",
            easeReverse: easeRev("power4.out"),
          },
          0,
        );

      const sheetTargets = collectSheetTargets();
      if (mode() === "sheet" && sheetTargets.length) {
        tl.fromTo(
          sheetTargets,
          { x: 0, y: "110%", opacity: 1, rotation: 0 },
          {
            x: 0,
            y: 0,
            rotation: 0,
            opacity: 1,
            duration: 0.45 * d,
            ease: "power3.out",
            immediateRender: false,
          },
          0,
        );
      } else if (cards.length) {
        tl.fromTo(
          cards,
          { x: "110%", y: 0, opacity: 0, rotation: 0 },
          {
            x: "0%",
            y: 0,
            rotation: 0,
            opacity: 1,
            duration: 0.6 * d,
            ease: "back.out",
            easeReverse: easeRev("power3.in"),
            stagger: 0.1 * d,
            immediateRender: false,
          },
          0,
        );
      }

      tl.addPause("+=0", onEnter);
      enterEndTime = Math.max(tl.duration(), EPS);

      if (mode() === "sheet" && sheetTargets.length) {
        tl.to(
          sheetTargets,
          {
            x: 0,
            y: "110%",
            rotation: 0,
            opacity: 1,
            duration: 0.32 * d,
            ease: "power2.in",
          },
          enterEndTime,
        );
      } else if (cards.length) {
        const spins = cards.map((_, i) => ((i % 2 === 0 ? -12 : 12) - i * 3));
        tl.to(
          cards,
          {
            y: "110vh",
            rotation: (i: number) => spins[i] ?? 0,
            duration: 1 * d,
            ease: "power3.in",
            stagger: { from: "end", each: 0.02 * d },
          },
          enterEndTime,
        );
      }

      tl.to(
        backdrop,
        { opacity: 0, duration: 0.3 * d, ease: "power2.in" },
        enterEndTime + 0.1 * d,
      ).set(scope, { autoAlpha: 0 });
    }, scope);
  };

  cards = collectCards(targets);
  recoRoot = targets.recoRoot ?? null;
  stack = targets.stack ?? null;
  build();

  return {
    setOptions(next) {
      const previousMode = mode();
      opts = { ...opts, ...next };
      if (mode() !== previousMode) build();
    },
    setTargets(next) {
      const nextCards = collectCards(next);
      const nextRoot = next.recoRoot ?? null;
      const nextStack = next.stack ?? null;
      if (
        sameElements(nextCards, cards) &&
        nextRoot === recoRoot &&
        nextStack === stack
      ) {
        return;
      }

      const keepOpen = isOpen;
      cards = nextCards;
      recoRoot = nextRoot;
      stack = nextStack;
      targets = next;
      build();
      if (keepOpen) this.seekOpenImmediate();
    },
    open() {
      if (!tl) return;
      if (isOpen && enterDone && tl.paused() && tl.time() >= enterEndTime - EPS) {
        return;
      }

      isOpen = true;
      exitDone = false;
      tl.reversed(false).timeScale(1);

      if (tl.time() > EPS && tl.time() < enterEndTime - EPS) {
        tl.play();
        return;
      }

      enterDone = false;
      tl.restart(true, false);
    },
    close() {
      if (!tl) {
        onExit();
        return;
      }

      if (!isOpen) {
        paintClosed();
        onExit();
        return;
      }

      isOpen = false;
      enterDone = false;
      exitDone = false;

      if (tl.time() <= EPS) {
        paintClosed();
        onExit();
        return;
      }

      if (tl.time() < enterEndTime - EPS) {
        tl.timeScale(opts.exitSpeed ?? 1.5).reverse();
        return;
      }

      tl.timeScale(1).play(enterEndTime + EPS);
    },
    seekOpenImmediate() {
      if (!tl) return;
      isOpen = true;
      exitDone = false;
      enterDone = false;
      tl.pause(enterEndTime);
      paintOpen();
      onEnter();
    },
    dispose() {
      isOpen = false;
      tl?.kill();
      tl = undefined;
      ctx?.revert();
      ctx = undefined;
      cards = [];
      recoRoot = null;
      stack = null;
    },
  };
}
