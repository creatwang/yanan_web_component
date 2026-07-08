/** Popover API polyfill for happy-dom unit tests (yn-drawer). */
if (typeof HTMLElement !== "undefined") {
  const proto = HTMLElement.prototype as HTMLElement & {
    showPopover?: () => void;
    hidePopover?: () => void;
  };

  if (!proto.showPopover) {
    proto.showPopover = function (this: HTMLElement) {
      this.toggleAttribute("data-popover-open", true);
    };
  }

  if (!proto.hidePopover) {
    proto.hidePopover = function (this: HTMLElement) {
      this.toggleAttribute("data-popover-open", false);
    };
  }

  const elementMatches = Element.prototype.matches;
  // happy-dom 无 Popover API，用 data-popover-open 模拟 :popover-open
  Object.defineProperty(proto, "matches", {
    configurable: true,
    writable: true,
    value(selector: string) {
      if (selector === ":popover-open") {
        return this.hasAttribute("data-popover-open");
      }
      return elementMatches.call(this, selector);
    },
  });
}
