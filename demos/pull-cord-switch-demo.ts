import "../src/components/yn-pull-cord-switch/yn-pull-cord-switch";
import { applyPullCordShellBackground } from "../src/components/yn-pull-cord-switch/pull-cord-shell-bg";

const shell = document.getElementById("lamp-shell");
const lamp = document.getElementById("lamp");
const lastToggle = document.getElementById("lastToggle");
const bootMessage = document.querySelector("[data-boot-message]");

if (bootMessage) {
  bootMessage.remove();
}

if (shell instanceof HTMLElement && lamp instanceof HTMLElement) {
  applyPullCordShellBackground(shell, lamp);

  lamp.addEventListener("change", (event) => {
    const { checked } = (event as CustomEvent<{ checked: boolean }>).detail;
    applyPullCordShellBackground(shell, lamp, checked);
    if (lastToggle) {
      lastToggle.textContent = checked ? "开启" : "关闭";
    }
  });
}
