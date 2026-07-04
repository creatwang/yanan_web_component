import fs from "node:fs";

const path = "D:/webstormProject/yanan_web_component/src/components/yn-drawer/yn-drawer.ts";
let s = fs.readFileSync(path, "utf8");

s = s.replace(
  `          el.addEventListener("click", this.handleTriggerClick);`,
  `          el.addEventListener("click", (event) => {
            event.stopPropagation();
            this.handleTriggerClick();
          });`,
);

s = s.replace(
  `    root.querySelector(".trigger-wrap")?.addEventListener("click", this.handleTriggerClick);
    this.bindTriggerSlotClicks();`,
  `    const triggerSlot = root.querySelector('slot[name="trigger"]') as HTMLSlotElement | null;
    const hasSlottedTrigger = (triggerSlot?.assignedElements({ flatten: true }).length ?? 0) > 0;
    if (!hasSlottedTrigger) {
      root.querySelector(".trigger-wrap")?.addEventListener("click", this.handleTriggerClick);
    }
    this.bindTriggerSlotClicks();`,
);

fs.writeFileSync(path, s);
console.log("patched drawer trigger handlers");
