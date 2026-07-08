import fs from "node:fs";
import path from "node:path";

const VIEW_H = 40;
const CAP_W = 36;
const CENTER_W = 18;
const ICONS_OUT = path.join(
  path.resolve(import.meta.dirname, ".."),
  "src/components/yn-cookie-notice/cookie-notice-icons.ts"
);

/** Floema sketch bracket — stroke-only frame, no fill plate. */
const INK = "#241f21";
const STROKE = 0.58;
const TOP_Y = 6;
const BOT_Y = 34;

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

function wobble(i, amp = 0.35) {
  return Math.sin(i * 1.65) * amp + Math.cos(i * 0.85) * amp * 0.4;
}

/** Tiny sketch leaf tick (stroke). */
function leafTick(x, y, angleDeg, len = 1.7, opacity = 1) {
  const rad = (angleDeg * Math.PI) / 180;
  const mx = x + Math.cos(rad + 0.55) * len * 0.55;
  const my = y + Math.sin(rad + 0.55) * len * 0.55;
  const ex = x + Math.cos(rad) * len;
  const ey = y + Math.sin(rad) * len;
  const op = opacity < 1 ? ` opacity="${opacity}"` : "";
  return `<path d="M${f(x)},${f(y)} Q${f(mx)},${f(my)} ${f(ex)},${f(ey)}" stroke="${INK}" stroke-width="0.48" fill="none" stroke-linecap="round"${op}/>`;
}

/** 3-dot floret cluster. */
function floretDots(x, y, r = 0.55) {
  return [
    `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r * 0.35)}" fill="${INK}"/>`,
    `<circle cx="${f(x - r)}" cy="${f(y)}" r="${f(r * 0.22)}" fill="${INK}" opacity="0.75"/>`,
    `<circle cx="${f(x + r)}" cy="${f(y)}" r="${f(r * 0.22)}" fill="${INK}" opacity="0.75"/>`,
    `<circle cx="${f(x)}" cy="${f(y - r * 0.75)}" r="${f(r * 0.2)}" fill="${INK}" opacity="0.65"/>`,
  ].join("");
}

/**
 * Hand-drawn horizontal rule with leaf ticks.
 * dense: top vine — more ticks + 1 floret
 * sparse: bottom vine — fewer, lighter ticks
 */
function sketchRule(x0, x1, y, segments, mode = "dense") {
  const sparse = mode === "sparse";
  const amp = sparse ? 0.22 : 0.38;
  const parts = [];
  let d = `M${f(x0)},${f(y + wobble(0, amp))}`;

  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const x = x0 + (x1 - x0) * t;
    const yy = y + wobble(i, amp);
    d += ` L${f(x)},${f(yy)}`;

    const placeTick = sparse ? i % 3 === 1 : i % 2 === 1 || i % 5 === 0;
    if (placeTick) {
      const side = i % 2 === 0 ? 1 : -1;
      parts.push(leafTick(x, yy, side * 78 + wobble(i, 8), sparse ? 1.35 : 1.75, sparse ? 0.7 : 1));
      if (!sparse && i % 4 === 2) {
        parts.push(leafTick(x, yy, side * -65, 1.25, 0.85));
      }
    }
    if (!sparse && i === Math.floor(segments * 0.55)) {
      parts.push(floretDots(x, yy - 1.1, 0.6));
    }
  }

  parts.push(
    `<path d="${d}" stroke="${INK}" stroke-width="${STROKE}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="${sparse ? 0.72 : 1}"/>`
  );
  return parts.join("");
}

/** Outward bracket arm (reference side curves). */
function bracketArm(width, side) {
  const flip = side === "left" ? -1 : 1;
  const x0 = side === "left" ? 3.5 : width - 3.5;
  const xBow = x0 + flip * 5.2;
  const yTop = 8.5;
  const yBot = 31.5;
  const yMid = 20;

  const curve = `M${f(x0)},${f(yTop)} Q${f(xBow)},${f(yMid)} ${f(x0)},${f(yBot)}`;
  const parts = [
    `<path d="${curve}" stroke="${INK}" stroke-width="${STROKE}" fill="none" stroke-linecap="round" opacity="0.9"/>`,
  ];

  const ticks = [
    [0.18, 82, 1.5],
    [0.32, -74, 1.65],
    [0.5, 88, 1.85],
    [0.5, -86, 1.7],
    [0.68, 76, 1.55],
    [0.82, -80, 1.4],
  ];

  for (const [t, ang, len] of ticks) {
    const u = 1 - t;
    const px = u * u * x0 + 2 * u * t * xBow + t * t * x0;
    const py = u * u * yTop + 2 * u * t * yMid + t * t * yBot;
    const tickAng = ang * flip;
    parts.push(leafTick(px + flip * 0.4, py, tickAng, len, 0.82));
  }

  const joinY = side === "left" ? yTop : yTop;
  parts.push(leafTick(x0 + flip * 0.8, joinY + 0.5, flip * 45, 1.3));
  parts.push(leafTick(x0 + flip * 0.8, yBot - 0.5, flip * -42, 1.2, 0.75));

  return parts.join("");
}

function leftCap(width) {
  return [
    sketchRule(1, width - 1, TOP_Y, 9, "dense"),
    sketchRule(2, width - 2, BOT_Y, 6, "sparse"),
    bracketArm(width, "left"),
  ].join("");
}

function rightCap(width) {
  return [
    sketchRule(0, width - 2, TOP_Y, 9, "dense"),
    sketchRule(1, width - 3, BOT_Y, 6, "sparse"),
    bracketArm(width, "right"),
  ].join("");
}

function centerRepeat(width) {
  return [sketchRule(0, width, TOP_Y, 3, "dense"), sketchRule(0, width, BOT_Y, 2, "sparse")].join("");
}

function buildTile(mode) {
  const width = mode === "center" ? CENTER_W : CAP_W;
  const body =
    mode === "left" ? leftCap(width) : mode === "right" ? rightCap(width) : centerRepeat(width);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${VIEW_H}" preserveAspectRatio="none" aria-hidden="true">${body}</svg>`;
}

const leftSvg = buildTile("left");
const centerSvg = buildTile("center");
const rightSvg = buildTile("right");

const out = `import type { YnSvgSource } from "../../asset/svg/index.js";

/** Sketch bracket frame — stroke vines, leaf ticks, dot florets (transparent). */
const buttonBgLeftSvg = ${JSON.stringify(leftSvg)};
const buttonBgCenterSvg = ${JSON.stringify(centerSvg)};
const buttonBgRightSvg = ${JSON.stringify(rightSvg)};

export const YN_COOKIE_NOTICE_BUTTON_BG_LEFT_URI = \`url("data:image/svg+xml,\${encodeURIComponent(buttonBgLeftSvg)}")\`;
export const YN_COOKIE_NOTICE_BUTTON_BG_CENTER_URI = \`url("data:image/svg+xml,\${encodeURIComponent(buttonBgCenterSvg)}")\`;
export const YN_COOKIE_NOTICE_BUTTON_BG_RIGHT_URI = \`url("data:image/svg+xml,\${encodeURIComponent(buttonBgRightSvg)}")\`;

export const YN_COOKIE_NOTICE_BUTTON_BG_DATA_URI = YN_COOKIE_NOTICE_BUTTON_BG_CENTER_URI;

export const YN_COOKIE_NOTICE_MODAL_HOLDER_SVG: YnSvgSource = ${JSON.stringify(MODAL_HOLDER_SVG)};
`;

fs.writeFileSync(ICONS_OUT, out);
console.log("Updated sketch-bracket frame tiles", {
  left: leftSvg.length,
  center: centerSvg.length,
  right: rightSvg.length,
});
