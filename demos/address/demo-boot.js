/** Warn when HTML is opened without Vite (e.g. IDE port 63342). */
(function (tagName) {
  var warn = document.getElementById("boot-warn");
  var hide = function () {
    if (customElements.get(tagName) && warn) {
      warn.classList.remove("is-visible");
    }
  };
  customElements.whenDefined(tagName).then(hide);
  window.addEventListener("load", function () {
    setTimeout(hide, 100);
    setTimeout(function () {
      if (!customElements.get(tagName) && warn) {
        warn.classList.add("is-visible");
        warn.textContent =
          "组件未加载：请在项目根目录执行 pnpm dev:google-address 或 pnpm dev:dr5hn-region，不要用 IDE 直接打开 HTML。";
      }
    }, 1200);
  });
})(window.__DEMO_TAG__);
