import gsap from "gsap";

export type YnDrawerMotionCallbacks = {
  onEnterComplete: () => void;
  onExitComplete: () => void;
};

export type YnDrawerMotionOptions = {
  exitSpeed?: number;
  easeReverse?: boolean;
  reduceMotion?: boolean;
};

export type YnDrawerMotionTargets = {
  panels: HTMLElement[];
  /** backdrop-extra 内参与动画的商品卡 */
  reco: HTMLElement[];
  recoRoot?: HTMLElement | null;
};

export type YnDrawerMotionController = {
  open: () => void;
  close: () => void;
  dispose: () => void;
  setTargets: (targets: YnDrawerMotionTargets) => void;
  setOptions: (options: YnDrawerMotionOptions) => void;
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

/**
 * 单时间轴：enter → pause → exit。
 * 面板与推荐卡共用同一套侧滑入 / 坠落出。
 */
export function createYnDrawerMotion(
  scope: HTMLElement,
  backdrop: HTMLElement,
  targets: YnDrawerMotionTargets,
  callbacks: YnDrawerMotionCallbacks,
  options: YnDrawerMotionOptions = {}
): YnDrawerMotionController {
  let ctx: gsap.Context | undefined;
  let tl: gsap.core.Timeline | undefined;
  let enterEndTime = 0;
  let cards: HTMLElement[] = [];
  let recoRoot: HTMLElement | null = null;
  let isOpen = false;
  let enterDone = false;
  let exitDone = false;
  let opts = { ...options };

  const durationScale = () =>
    (opts.reduceMotion ?? prefersReducedMotion()) ? 0.01 : 1;

  const easeRev = (ease: string) => (opts.easeReverse === false ? false : ease);

  const collectCards = (next: YnDrawerMotionTargets) => [
    ...next.panels,
    ...next.reco
  ];

  const paintClosed = () => {
    gsap.set(scope, { autoAlpha: 0, force3D: true });
    gsap.set(backdrop, { opacity: 0 });
    if (recoRoot) gsap.set(recoRoot, { autoAlpha: 1, x: 0, y: 0 });
    if (cards.length) {
      gsap.set(cards, {
        x: "110%",
        y: 0,
        rotation: 0,
        opacity: 0,
        force3D: true,
        transformOrigin: "50% 50%"
      });
    }
  };

  const paintOpen = () => {
    gsap.set(scope, { autoAlpha: 1, force3D: true });
    gsap.set(backdrop, { opacity: 1 });
    if (recoRoot) gsap.set(recoRoot, { autoAlpha: 1, x: 0, y: 0 });
    if (cards.length) {
      gsap.set(cards, {
        x: 0,
        y: 0,
        rotation: 0,
        opacity: 1,
        force3D: true
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
          onReverseComplete: onExit
        })
        .set(scope, { autoAlpha: 1 })
        .to(
          backdrop,
          {
            opacity: 1,
            duration: 0.4 * d,
            ease: "power2.out",
            easeReverse: easeRev("power4.out")
          },
          0
        );

      if (cards.length) {
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
            immediateRender: false
          },
          0
        );
      }

      tl.addPause("+=0", onEnter);
      enterEndTime = Math.max(tl.duration(), EPS);

      if (cards.length) {
        // 固定角度，避免每帧函数取值
        const spins = cards.map((_, i) => ((i % 2 === 0 ? -12 : 12) - i * 3));
        tl.to(
          cards,
          {
            y: "110vh",
            rotation: (i: number) => spins[i] ?? 0,
            duration: 1 * d,
            ease: "power3.in",
            stagger: { from: "end", each: 0.02 * d }
          },
          enterEndTime
        );
      }

      tl.to(
        backdrop,
        { opacity: 0, duration: 0.3 * d, ease: "power2.in" },
        enterEndTime + 0.1 * d
      ).set(scope, { autoAlpha: 0 });
    }, scope);
  };

  cards = collectCards(targets);
  recoRoot = targets.recoRoot ?? null;
  build();

  return {
    setOptions(next) {
      opts = { ...opts, ...next };
    },
    setTargets(next) {
      const nextCards = collectCards(next);
      const nextRoot = next.recoRoot ?? null;
      if (sameElements(nextCards, cards) && nextRoot === recoRoot) return;

      const keepOpen = isOpen && enterDone;
      cards = nextCards;
      recoRoot = nextRoot;
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

      // 退场结束后 pause(0)，直接 restart；中途打断则继续 play
      if (tl.time() > EPS && tl.time() < enterEndTime - EPS) {
        tl.play();
        return;
      }

      enterDone = false;
      tl.restart(true, false);
    },
    close() {
      if (!tl || !isOpen) return;

      isOpen = false;
      enterDone = false;
      exitDone = false;

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
    }
  };
}
