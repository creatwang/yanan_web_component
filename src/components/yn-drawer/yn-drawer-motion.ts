import gsap from "gsap";

export type YnDrawerMotionCallbacks = {
  onEnterComplete: () => void;
  onExitComplete: () => void;
};

export type YnDrawerMotionOptions = {
  reduceMotion: boolean;
  exitSpeed: number;
  easeReverse: boolean;
};

export type YnDrawerMotionExtras = {
  root: HTMLElement;
  items: HTMLElement[];
};

export type YnDrawerMotionTargets = {
  panels: HTMLElement[];
  extras: YnDrawerMotionExtras | null;
};

export type YnDrawerMotionController = {
  open: () => void;
  close: () => void;
  dispose: () => void;
  rebuild: (targets: YnDrawerMotionTargets) => void;
  seekOpenImmediate: () => void;
};

function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function extrasSignature(extras: YnDrawerMotionExtras | null) {
  if (!extras) return "none";
  return `${extras.root.tagName}:${extras.items.length}:${extras.items
    .map((item) => item.tagName)
    .join(",")}`;
}

const cardEnterFrom = { x: "110%", y: 0, opacity: 0, rotation: 0 };
const cardEnterTo = {
  x: "0%",
  y: 0,
  rotation: 0,
  opacity: 1
};

/**
 * basetest panel cards + backdrop reco cards share the same enter/exit language.
 */
export function createYnDrawerMotion(
  scope: HTMLElement,
  backdrop: HTMLElement,
  targets: YnDrawerMotionTargets,
  callbacks: YnDrawerMotionCallbacks,
  options: Partial<YnDrawerMotionOptions> = {}
): YnDrawerMotionController {
  let ctx: gsap.Context | undefined;
  let tl: gsap.core.Timeline | undefined;
  let enterEndTime = 0;
  let activePanels = targets.panels.slice();
  let activeExtras = targets.extras;
  let isOpen = false;
  let enterNotified = false;
  let exitNotified = false;

  const exitSpeed = options.exitSpeed ?? 1.5;
  const useEaseReverse = options.easeReverse ?? true;
  const er = (value: string | true) => (useEaseReverse ? value : false);

  const recoCards = () => activeExtras?.items ?? [];

  const allCards = () => [...activePanels, ...recoCards()];

  const resetClosedVisual = () => {
    gsap.set(scope, { autoAlpha: 0 });
    gsap.set(backdrop, { opacity: 0 });
    if (activeExtras) {
      // 容器本身不参与飞入，只负责布局；卡片与面板同款位移
      gsap.set(activeExtras.root, { autoAlpha: 1, x: 0, y: 0 });
    }
    const cards = allCards();
    if (cards.length) {
      gsap.set(cards, {
        ...cardEnterFrom,
        transformOrigin: "50% 50%"
      });
    }
  };

  const notifyEnter = () => {
    if (enterNotified) return;
    enterNotified = true;
    callbacks.onEnterComplete();
  };

  const notifyExit = () => {
    if (exitNotified) return;
    exitNotified = true;
    isOpen = false;
    tl?.pause(0);
    resetClosedVisual();
    callbacks.onExitComplete();
  };

  const build = () => {
    ctx?.revert();
    enterNotified = false;
    exitNotified = false;

    ctx = gsap.context(() => {
      const reduceMotion = options.reduceMotion ?? prefersReducedMotion();
      const d = reduceMotion ? 0.01 : 1;
      const cards = allCards();

      resetClosedVisual();

      tl = gsap.timeline({
        paused: true,
        onComplete: notifyExit,
        onReverseComplete: notifyExit
      });

      tl.set(scope, { autoAlpha: 1 }).to(
        backdrop,
        {
          opacity: 1,
          duration: 0.4 * d,
          ease: "power2.out",
          easeReverse: er("power4.out")
        },
        0
      );

      // 面板 + 推荐卡：同一套侧滑入场（错落）
      if (cards.length) {
        tl.fromTo(
          cards,
          { ...cardEnterFrom },
          {
            ...cardEnterTo,
            duration: 0.6 * d,
            ease: "back.out",
            easeReverse: er("power3.in"),
            stagger: 0.1 * d
          },
          0
        );
      }

      tl.addPause("+=0", notifyEnter);
      enterEndTime = Math.max(tl.duration(), 0.01);

      // 面板 + 推荐卡：同一套坠落退场
      if (cards.length) {
        tl.to(
          cards,
          {
            y: "110vh",
            rotation: (index: number) => (index % 2 === 0 ? -12 : 12) - index * 3,
            duration: 1 * d,
            ease: "power3.in",
            stagger: {
              from: "end",
              each: 0.02 * d
            }
          },
          enterEndTime
        );
      }

      tl.to(
        backdrop,
        {
          opacity: 0,
          duration: 0.3 * d,
          ease: "power2.in"
        },
        enterEndTime + 0.1 * d
      ).set(scope, { autoAlpha: 0 });
    }, scope);
  };

  build();

  return {
    open() {
      if (!tl) return;
      if (isOpen && enterNotified && tl.paused() && tl.time() >= enterEndTime - 0.001) {
        return;
      }

      isOpen = true;
      exitNotified = false;

      if (tl.progress() > 0.999 || tl.time() > enterEndTime + 0.001) {
        enterNotified = false;
        build();
      }

      if (!tl) return;
      tl.reversed(false).timeScale(1);

      if (tl.time() > 0.001 && tl.time() < enterEndTime - 0.001) {
        tl.play();
        return;
      }

      enterNotified = false;
      tl.restart(true, false);
    },
    close() {
      if (!tl) return;
      if (!isOpen && tl.time() <= 0.001) return;

      isOpen = false;
      enterNotified = false;
      exitNotified = false;
      tl.timeScale(1);

      if (tl.time() < enterEndTime - 0.001) {
        tl.timeScale(exitSpeed).reverse();
        return;
      }

      tl.play(enterEndTime + 0.001);
    },
    seekOpenImmediate() {
      if (!tl) return;
      isOpen = true;
      exitNotified = false;
      enterNotified = false;
      tl.pause(enterEndTime);
      gsap.set(scope, { autoAlpha: 1 });
      gsap.set(backdrop, { opacity: 1 });
      if (activeExtras) {
        gsap.set(activeExtras.root, { autoAlpha: 1, x: 0, y: 0 });
      }
      const cards = allCards();
      if (cards.length) {
        gsap.set(cards, { x: 0, y: 0, rotation: 0, opacity: 1 });
      }
      notifyEnter();
    },
    rebuild(nextTargets: YnDrawerMotionTargets) {
      const samePanels =
        nextTargets.panels.length === activePanels.length &&
        nextTargets.panels.every((panel, index) => panel === activePanels[index]);
      const sameExtras =
        extrasSignature(nextTargets.extras) === extrasSignature(activeExtras) &&
        nextTargets.extras?.root === activeExtras?.root &&
        Boolean(
          nextTargets.extras?.items.every(
            (item, index) => item === activeExtras?.items[index]
          )
        );

      if (samePanels && sameExtras) return;

      activePanels = nextTargets.panels.slice();
      activeExtras = nextTargets.extras
        ? {
            root: nextTargets.extras.root,
            items: nextTargets.extras.items.slice()
          }
        : null;
      const keepOpen = isOpen && enterNotified;
      build();
      if (keepOpen) {
        this.seekOpenImmediate();
      }
    },
    dispose() {
      isOpen = false;
      tl?.kill();
      tl = undefined;
      ctx?.revert();
      ctx = undefined;
    }
  };
}
