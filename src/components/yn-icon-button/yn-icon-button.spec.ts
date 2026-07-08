import { expect, test } from "vitest";
import "./yn-icon-button";
import type { YnIconButton } from "./yn-icon-button";

const CART_SVG = `<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8.9 7.5a3.2 3.2 0 0 1 6.2 0H5.8v6.3A3.6 3.6 0 0 0 9.4 17.2h5.2a3.6 3.6 0 0 0 3.6-3.6V7.5Z"/></svg>`;

async function mountIconButton(markup: string) {
  document.body.innerHTML = markup;
  const el = document.querySelector("yn-icon-button") as YnIconButton;
  await el.updateComplete;
  return el;
}

test("yn-icon-button renders shadow button with label", async () => {
  const el = await mountIconButton(`<yn-icon-button label="购物车">${CART_SVG}</yn-icon-button>`);

  const button = el.shadowRoot?.querySelector("button.icon-button");
  expect(button).toBeTruthy();
  expect(button?.getAttribute("aria-label")).toBe("购物车");
  expect(button?.classList.contains("hit-slop")).toBe(true);
});

test("yn-icon-button hit-slop can be disabled", async () => {
  const el = document.createElement("yn-icon-button") as YnIconButton;
  el.label = "关闭";
  el.hitSlop = false;
  el.innerHTML = CART_SVG;
  document.body.appendChild(el);
  await el.updateComplete;

  const button = el.shadowRoot?.querySelector("button.icon-button");
  expect(button?.classList.contains("hit-slop")).toBe(false);
});

test("yn-icon-button variant reflects and sets hover mode", async () => {
  const el = await mountIconButton(`<yn-icon-button label="主色" variant="primary">${CART_SVG}</yn-icon-button>`);
  expect(el.getAttribute("variant")).toBe("primary");
  expect(el.dataset.hoverMode).toBe("solid");
});

test("yn-icon-button custom bg via css var on host", async () => {
  const el = await mountIconButton(
    `<yn-icon-button label="自定义" style="--yn-icon-button-bg:#eef2ff;--yn-icon-button-hover-bg:#c7d2fe">${CART_SVG}</yn-icon-button>`,
  );
  const bg = el.shadowRoot?.querySelector(".bg") as HTMLElement;
  expect(bg).toBeTruthy();
});

test("yn-icon-button emits click to host", async () => {
  const el = await mountIconButton(`<yn-icon-button label="购物车">${CART_SVG}</yn-icon-button>`);
  let clicked = false;
  el.addEventListener("click", () => {
    clicked = true;
  });
  const button = el.shadowRoot?.querySelector("button.icon-button") as HTMLButtonElement;
  button?.click();
  expect(clicked).toBe(true);
});

test("yn-icon-button disabled blocks host click", async () => {
  const el = await mountIconButton(`<yn-icon-button label="购物车" disabled>${CART_SVG}</yn-icon-button>`);
  let clicked = false;
  el.addEventListener("click", () => {
    clicked = true;
  });
  const button = el.shadowRoot?.querySelector("button.icon-button") as HTMLButtonElement;
  button?.click();
  expect(clicked).toBe(false);
});
