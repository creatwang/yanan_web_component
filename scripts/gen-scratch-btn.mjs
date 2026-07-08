import fs from "node:fs";
import path from "node:path";

const VIEW_W = 240;
const VIEW_H = 48;
const ICONS_OUT = path.join(
  path.resolve(import.meta.dirname, ".."),
  "src/components/yn-cookie-notice/cookie-notice-icons.ts"
);

/** Hand-traced tag cord — kept in script so regen never depends on file markers. */
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

function seededRandom(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1_664_525, s) + 1_013_904_223) >>> 0;
    return s / 0x1_0000_0000;
  };
}

const rng = seededRandom(0x1a2b_3c4d);

function jitter(v, amp, t = 1) {
  return v + (rng() - 0.5) * amp * t;
}

function inkOutline() {
  const n = 60;
  const top = [];
  const bottom = [];

  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = 0.4 + 239.2 * t;
    const taper = Math.pow(Math.sin(t * Math.PI), 0.68);
    const fray = taper < 0.22 ? 1 + (0.22 - taper) * 4 : 1;

    let topY =
      24 -
      taper * 13.5 +
      Math.sin(i * 1.07 + 0.4) * 1.8 +
      (i % 2 ? 1.4 : -1.1);
    topY = jitter(topY, 4.2 * fray, taper);
    if (i % 5 === 0) topY += (rng() - 0.5) * 2.8;
    if (taper < 0.18 && rng() > 0.55) topY += 4 + rng() * 5;

    top.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)} ${topY.toFixed(1)}`);
  }

  for (let i = n; i >= 0; i--) {
    const t = i / n;
    const x = 0.4 + 239.2 * t;
    const taper = Math.pow(Math.sin(t * Math.PI), 0.68);
    const fray = taper < 0.22 ? 1 + (0.22 - taper) * 4 : 1;

    let botY =
      24 +
      taper * 12.5 +
      Math.sin(i * 0.93 + 1.1) * 1.9 +
      (i % 2 ? -1.2 : 1.3);
    botY = jitter(botY, 4.0 * fray, taper);
    if (i % 4 === 0) botY += (rng() - 0.5) * 2.6;
    if (taper < 0.16 && rng() > 0.5) botY -= 3 + rng() * 4;

    bottom.push(`L${x.toFixed(1)} ${botY.toFixed(1)}`);
  }

  return `${top.join(" ")} ${bottom.join(" ")} Z`;
}

function knifeTracks() {
  const parts = [];
  for (let i = 0; i < 26; i++) {
    const y = 11.5 + i * 1.34 + (i % 3) * 0.22;
    const x1 = 4 + (i % 7) * 1.1 + rng() * 3;
    const x2 = VIEW_W - 4 - (i % 5) * 1.3 - rng() * 3;
    const op = (0.045 + (i % 6) * 0.014 + rng() * 0.02).toFixed(3);
    const sw = (0.28 + (i % 4) * 0.14 + rng() * 0.12).toFixed(2);

    if (rng() > 0.82) {
      const mid = x1 + (x2 - x1) * (0.35 + rng() * 0.3);
      parts.push(
        `<path d="M${x1.toFixed(1)} ${y.toFixed(1)} L${(mid - 8).toFixed(1)} ${(y + (rng() - 0.5) * 0.6).toFixed(1)}" stroke="#fff" stroke-opacity="${op}" stroke-width="${sw}" stroke-linecap="round" fill="none"/>`,
        `<path d="M${(mid + 10).toFixed(1)} ${(y - (rng() - 0.5) * 0.5).toFixed(1)} L${x2.toFixed(1)} ${y.toFixed(1)}" stroke="#fff" stroke-opacity="${(Number(op) * 0.85).toFixed(3)}" stroke-width="${sw}" stroke-linecap="round" fill="none"/>`
      );
      continue;
    }

    const wobble = (rng() - 0.5) * 0.9;
    const midX = (x1 + x2) / 2;
    parts.push(
      `<path d="M${x1.toFixed(1)} ${y.toFixed(1)} L${midX.toFixed(1)} ${(y + wobble).toFixed(1)} L${x2.toFixed(1)} ${(y - wobble * 0.5).toFixed(1)}" stroke="#fff" stroke-opacity="${op}" stroke-width="${sw}" stroke-linecap="round" fill="none"/>`
    );
  }
  return parts.join("");
}

function wetHighlights() {
  const parts = [];
  for (let i = 0; i < 8; i++) {
    const y = 14 + i * 3.1 + rng() * 1.2;
    const x1 = 12 + rng() * 18;
    const x2 = VIEW_W - 12 - rng() * 18;
    parts.push(
      `<path d="M${x1.toFixed(1)} ${y.toFixed(1)} L${x2.toFixed(1)} ${(y + (rng() - 0.5) * 0.4).toFixed(1)}" stroke="#fff" stroke-opacity="${(0.03 + rng() * 0.04).toFixed(3)}" stroke-width="${(0.6 + rng() * 0.5).toFixed(2)}" stroke-linecap="round" fill="none"/>`
    );
  }
  return parts.join("");
}

function inkLayers() {
  const blobs = [
    [8, 19, 52, 17, 98, 18, 148, 16, 198, 18, 228, 20, 224, 27, 170, 29, 92, 28, 38, 27, 12, 24],
    [28, 21, 88, 20, 142, 21, 188, 22, 210, 25, 178, 30, 110, 31, 48, 29],
    [62, 23, 118, 22, 168, 23, 192, 26, 152, 28, 96, 27]
  ];

  return blobs
    .map((pts, i) => {
      const d = [];
      for (let j = 0; j < pts.length; j += 2) {
        d.push(
          `${j === 0 ? "M" : "L"}${jitter(pts[j], 1.8, 1).toFixed(1)} ${jitter(pts[j + 1], 1.2, 1).toFixed(1)}`
        );
      }
      d.push("Z");
      return `<path d="${d.join(" ")}" fill="#000" fill-opacity="${(0.28 + i * 0.08).toFixed(2)}"/>`;
    })
    .join("");
}

function edgeSplatter() {
  const parts = [];
  const crumbs = [
    [1.2, 22, 0.45],
    [2.8, 26, 0.32],
    [4.5, 18, 0.38],
    [238.2, 21, 0.48],
    [236.5, 27, 0.34],
    [239, 19, 0.42],
    [239.5, 31, 0.28],
    [0.8, 29, 0.26],
    [6, 14, 0.22],
    [234, 13, 0.24],
    [8, 35, 0.2],
    [231, 34, 0.22]
  ];

  for (const [x, y, r] of crumbs) {
    parts.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="#000"/>`);
  }

  for (const [x1, y1, x2, y2] of [
    [0, 20, 11, 19],
    [0, 27, 9, 28.5],
    [230, 20.5, 240, 20],
    [232, 29, 240, 29.5],
    [14, 10, 32, 11.5],
    [208, 9.5, 226, 11],
    [16, 38, 38, 36],
    [204, 37, 224, 35]
  ]) {
    parts.push(
      `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="#000" stroke-width="${(0.45 + rng() * 0.55).toFixed(2)}" stroke-linecap="round" opacity="${(0.35 + rng() * 0.35).toFixed(2)}"/>`
    );
  }

  return parts.join("");
}

function svgFilters() {
  return `<filter id="yn-ink-edge" x="-8%" y="-20%" width="116%" height="140%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.07 0.55" numOctaves="4" seed="17" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" xChannelSelector="R" yChannelSelector="G"/></filter><filter id="yn-ink-grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85 0.85" numOctaves="3" seed="31" result="g"/><feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.11 0" result="a"/><feBlend in="SourceGraphic" in2="a" mode="multiply"/></filter>`;
}

const OUTLINE = inkOutline();
const buttonBgSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW_W} ${VIEW_H}" preserveAspectRatio="none" aria-hidden="true"><defs>${svgFilters()}<clipPath id="yn-ink-clip"><path d="${OUTLINE}"/></clipPath></defs><path fill="#000" d="${OUTLINE}" filter="url(#yn-ink-edge)"/>${edgeSplatter()}<path d="${OUTLINE}" fill="none" stroke="#000" stroke-width="0.9" stroke-opacity="0.22"/><g clip-path="url(#yn-ink-clip)" filter="url(#yn-ink-grain)">${inkLayers()}${knifeTracks()}${wetHighlights()}</g></svg>`;

const out = `import type { YnSvgSource } from "../../asset/svg/index.js";

/** Ink-wash smear — SVG palette-knife scrape (no raster). */
const buttonBgSvg = ${JSON.stringify(buttonBgSvg)};

export const YN_COOKIE_NOTICE_BUTTON_BG_DATA_URI = \`url("data:image/svg+xml,\${encodeURIComponent(buttonBgSvg)}")\`;

/** Tag cord + grommet (hand-traced vector). */
export const YN_COOKIE_NOTICE_MODAL_HOLDER_SVG: YnSvgSource = ${JSON.stringify(MODAL_HOLDER_SVG)};
`;

fs.writeFileSync(ICONS_OUT, out);
console.log("Updated ink-wash SVG button", {
  svgLen: buttonBgSvg.length,
  encodedLen: encodeURIComponent(buttonBgSvg).length
});
