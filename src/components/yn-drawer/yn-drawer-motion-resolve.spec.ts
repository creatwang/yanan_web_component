import { expect } from "@open-wc/testing";
import { resolveYnDrawerMotion } from "./yn-drawer-motion-resolve.js";

describe("resolveYnDrawerMotion", () => {
  it("forces side / sheet when motion is explicit", () => {
    expect(
      resolveYnDrawerMotion({ motion: "side", placement: "bottom", viewportWidth: 375 })
    ).to.equal("side");
    expect(
      resolveYnDrawerMotion({ motion: "sheet", placement: "right", viewportWidth: 1440 })
    ).to.equal("sheet");
  });

  it("maps placement when motion is auto", () => {
    expect(
      resolveYnDrawerMotion({ motion: "auto", placement: "right", viewportWidth: 375 })
    ).to.equal("side");
    expect(
      resolveYnDrawerMotion({ motion: "auto", placement: "bottom", viewportWidth: 1440 })
    ).to.equal("sheet");
  });

  it("uses breakpoint when placement and motion are auto", () => {
    expect(
      resolveYnDrawerMotion({ motion: "auto", placement: "auto", viewportWidth: 1023 })
    ).to.equal("sheet");
    expect(
      resolveYnDrawerMotion({ motion: "auto", placement: "auto", viewportWidth: 1024 })
    ).to.equal("side");
  });
});
