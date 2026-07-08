import fs from "node:fs";
import path from "node:path";

const VIEW_H = 40;
const CAP_W = 34;
const CENTER_W = 38;
const ICONS_OUT = path.join(
  path.resolve(import.meta.dirname, ".."),
  "src/components/yn-cookie-notice/cookie-notice-icons.ts",
);

const MODAL_HOLDER_SVG = `<svg viewBox="0 0 857 108" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<defs>
  <linearGradient id="yn-cookie-ring" x1="0.15" y1="0.1" x2="0.9" y2="0.95">
    <stop offset="0%" stop-color="#ff7a75"/>
    <stop offset="42%" stop-color="#ed3833"/>
    <stop offset="100%" stop-color="#a82420"/>
  </linearGradient>
  <linearGradient id="yn-cookie-cord" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ef4a44"/>
    <stop offset="100%" stop-color="#c72f2a"/>
  </linearGradient>
</defs>
<circle cx="41" cy="54" r="21.5" stroke="url(#yn-cookie-ring)" stroke-width="3.2" fill="none"/>
<circle cx="41" cy="54" r="9.5" fill="#ed3833"/>
<path d="M58 47.5 C 170 38, 310 34, 470 40 C 610 45, 730 42, 842 46" stroke="url(#yn-cookie-cord)" stroke-width="2.6" stroke-linecap="round"/>
<path d="M58 60.5 C 180 68, 330 72, 500 66 C 640 62, 760 68, 836 58" stroke="url(#yn-cookie-cord)" stroke-width="2.6" stroke-linecap="round"/>
<path d="M700 44 C 760 52, 800 58, 842 46" stroke="url(#yn-cookie-cord)" stroke-width="2.4" stroke-linecap="round"/>
<path d="M688 66 C 748 58, 792 52, 836 58" stroke="url(#yn-cookie-cord)" stroke-width="2.4" stroke-linecap="round"/>
</svg>`;

function f(n) {
  return Number(n).toFixed(2);
}

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Palette-knife smear outline — thick horizontal band, torn sides on caps. */
function smearOutline(w, seed, side) {
  const rand = rng(seed);
  const steps = Math.max(10, Math.ceil(w / 2.2));
  const top = [];
  const bot = [];

  for (let i = 0; i <= steps; i += 1) {
    const x = (w * i) / steps;
    const belly = Math.sin((x / Math.max(w, 1)) * Math.PI) * 1.15;
    const ty = 10.8 - belly * 1.05 + Math.sin(x * 0.82 + seed * 0.17) * 0.95 + (rand() - 0.5) * 0.35;
    const by = 29.2 + belly * 0.85 + Math.sin(x * 0.76 + seed * 0.23 + 1.4) * 0.9 + (rand() - 0.5) * 0.35;
    top.push([x, ty]);
    bot.push([x, by]);
  }

  if (side === "left") {
    const lobe = [];
    for (let i = 6; i >= 0; i -= 1) {
      const t = i / 6;
      const y = top[0][1] + (bot[0][1] - top[0][1]) * t;
      const lx = Math.max(-0.35, -0.15 - rand() * 0.55 - Math.sin(t * Math.PI) * 0.35);
      lobe.push([lx, y + (rand() - 0.5) * 0.45]);
    }
    top.unshift(...lobe.slice(0, 3).reverse());
    bot.unshift(...lobe.slice(4).reverse());
  }

  if (side === "right") {
    const last = top.length - 1;
    const rlobe = [];
    for (let i = 0; i <= 6; i += 1) {
      const t = i / 6;
      const y = top[last][1] + (bot[last][1] - top[last][1]) * t;
      const rx = Math.min(w + 0.35, w + 0.15 + rand() * 0.55 + Math.sin(t * Math.PI) * 0.35);
      rlobe.push([rx, y + (rand() - 0.5) * 0.45]);
    }
    top.push(...rlobe.slice(1, 4));
    bot.push(...rlobe.slice(4));
  }

  let d = `M${f(top[0][0])} ${f(top[0][1])}`;
  for (let i = 1; i < top.length; i += 1) {
    d += ` L${f(top[i][0])} ${f(top[i][1])}`;
  }
  for (let i = bot.length - 1; i >= 0; i -= 1) {
    d += ` L${f(bot[i][0])} ${f(bot[i][1])}`;
  }
  d += " Z";
  return d;
}

function sharedDefs(id, outline) {
  return `<defs>
<path id="o-${id}" d="${outline}"/>
<linearGradient id="g-${id}" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stop-color="#2a2a2a"/>
  <stop offset="22%" stop-color="#141414"/>
  <stop offset="58%" stop-color="#050505"/>
  <stop offset="100%" stop-color="#101010"/>
</linearGradient>
<filter id="sf-${id}" x="-4%" y="-8%" width="108%" height="116%" color-interpolation-filters="sRGB">
  <feTurbulence type="fractalNoise" baseFrequency="0.055 0.62" numOctaves="2" seed="7" result="t"/>
  <feDisplacementMap in="SourceGraphic" in2="t" scale="1.15" xChannelSelector="R" yChannelSelector="G" result="d"/>
  <feTurbulence type="fractalNoise" baseFrequency="0.85 0.35" numOctaves="2" seed="11" result="g"/>
  <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.09 0" result="a"/>
  <feBlend in="d" in2="a" mode="multiply"/>
</filter>
<clipPath id="c-${id}"><use href="#o-${id}"/></clipPath>
</defs>`;
}

/** Horizontal blade striations — dark grooves only (no white bleed). */
function knifeStrokes(w, seed, id) {
  const rand = rng(seed);
  const out = [];
  const count = 22 + Math.floor(w / 3);

  for (let i = 0; i < count; i += 1) {
    const y = 11.8 + (i / count) * 16.2 + (rand() - 0.5) * 0.45;
    const x0 = 0.4 + rand() * 0.8;
    const x1 = w - 0.4 - rand() * 0.6;
    const kind = rand();

    if (kind > 0.35) {
      out.push(
        `<path d="M${f(x0)} ${f(y)} H${f(x1)}" stroke="#000" stroke-width="${f(0.28 + rand() * 0.42)}" stroke-linecap="butt" opacity="${f(0.14 + rand() * 0.2)}"/>`,
      );
    }
    if (kind > 0.62) {
      out.push(
        `<path d="M${f(x0 + rand())} ${f(y + 0.28)} H${f(x1 - rand())}" stroke="#2b2b2b" stroke-width="${f(0.18 + rand() * 0.22)}" stroke-linecap="butt" opacity="${f(0.2 + rand() * 0.22)}"/>`,
      );
    }
    if (kind > 0.8 && x1 - x0 > 6) {
      let x = x0 + rand() * 2;
      while (x < x1 - 1) {
        const seg = 2.5 + rand() * 8;
        const xe = Math.min(x + seg, x1);
        out.push(
          `<path d="M${f(x)} ${f(y + (rand() - 0.5) * 0.2)} H${f(xe)}" stroke="#151515" stroke-width="${f(0.2 + rand() * 0.18)}" stroke-linecap="butt" opacity="${f(0.18 + rand() * 0.16)}"/>`,
        );
        x = xe + 0.8 + rand() * 2.4;
      }
    }
  }

  return out.join("");
}

function edgeFlecks(w, seed, side, id) {
  const rand = rng(seed);
  const out = [];
  const n = side === "center" ? 3 : 7;
  for (let i = 0; i < n; i += 1) {
    const t = rand();
    const y = 10 + t * 20;
    const x =
      side === "left"
        ? rand() * 4.5
        : side === "right"
          ? w - rand() * 4.5
          : rand() * w;
    const rx = 0.35 + rand() * 1.1;
    const ry = 0.18 + rand() * 0.55;
    out.push(
      `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" fill="#000" opacity="${f(0.35 + rand() * 0.45)}"/>`,
    );
  }
  return `<g clip-path="url(#c-${id})">${out.join("")}</g>`;
}

function buildTile(w, seed, side, id) {
  const outline = smearOutline(w, seed, side);
  const painted = [
    `<use href="#o-${id}" fill="#000" opacity="0.9" transform="translate(0.1,-0.06)"/>`,
    `<use href="#o-${id}" fill="url(#g-${id})" filter="url(#sf-${id})"/>`,
    knifeStrokes(w, seed + 17, id),
    edgeFlecks(w, seed + 29, side, id),
  ].join("");
  const body = [
    sharedDefs(id, outline),
    `<g clip-path="url(#c-${id})">${painted}</g>`,
  ].join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${VIEW_H}" preserveAspectRatio="none" overflow="hidden" aria-hidden="true">${body}</svg>`;
}

const buttonBgLeftSvg = buildTile(CAP_W, 13, "left", "l");
const buttonBgCenterSvg = buildTile(CENTER_W, 47, "center", "c");
const buttonBgRightSvg = buildTile(CAP_W, 79, "right", "r");

const out = `import type { YnSvgSource } from "../../asset/svg/index.js";

/** Palette-knife paint smear tiles — impasto fill + horizontal blade marks. */
const buttonBgLeftSvg = ${JSON.stringify(buttonBgLeftSvg)};
const buttonBgCenterSvg = ${JSON.stringify(buttonBgCenterSvg)};
const buttonBgRightSvg = ${JSON.stringify(buttonBgRightSvg)};

export const YN_COOKIE_NOTICE_BUTTON_BG_LEFT_URI = \`url("data:image/svg+xml,\${encodeURIComponent(buttonBgLeftSvg)}")\`;
export const YN_COOKIE_NOTICE_BUTTON_BG_CENTER_URI = \`url("data:image/svg+xml,\${encodeURIComponent(buttonBgCenterSvg)}")\`;
export const YN_COOKIE_NOTICE_BUTTON_BG_RIGHT_URI = \`url("data:image/svg+xml,\${encodeURIComponent(buttonBgRightSvg)}")\`;

export const YN_COOKIE_NOTICE_MODAL_HOLDER_SVG: YnSvgSource = ${JSON.stringify(MODAL_HOLDER_SVG)};
`;

fs.writeFileSync(ICONS_OUT, out);
console.log("Updated palette-knife button tiles", {
  left: buttonBgLeftSvg.length,
  center: buttonBgCenterSvg.length,
  right: buttonBgRightSvg.length,
  total: buttonBgLeftSvg.length + buttonBgCenterSvg.length + buttonBgRightSvg.length,
});
