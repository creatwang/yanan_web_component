import "../../src/components/yn-checkout-address/yn-checkout-address";
import { fillSummaryList } from "./demo-summary";
import type { YnCheckoutAddressChangeDetail } from "../../src/components/yn-checkout-address/types";

const root = document.getElementById("app");
const payload = document.getElementById("payload");
const summary = document.getElementById("summary");
const probeInfo = document.getElementById("probe-info");

const providerName = (v: YnCheckoutAddressChangeDetail["value"]) => {
  if (v.provider === "google") return "Google Places";
  if (v.provider === "dr5hn") return "dr5hn";
  return "Photon";
};

const renderSummary = (detail: YnCheckoutAddressChangeDetail) => {
  const v = detail.value;
  fillSummaryList(summary, [
    ["数据源", providerName(v)],
    ["检测说明", v.probeReason || "—"],
    ["校验", detail.validation.valid ? "通过" : `未通过（${detail.validation.errors.length} 项）`],
    ["状态", v.formReady ? "可提交" : v.regionComplete ? "待填联系与地址" : "待选区域"],
    ["国家", v.countryCode ? `${v.countryName} (${v.countryCode})` : "—"],
    ["省/州", v.stateName ? `${v.stateName}${v.stateCode ? ` (${v.stateCode})` : ""}` : "—"],
    ["城市", v.cityName || "—"],
    [
      "电话",
      v.phoneNumber ? (v.phonecode ? `+${v.phonecode} ${v.phoneNumber}` : v.phoneNumber) : "—",
    ],
    ["邮箱", v.email || "—"],
    ["地址", v.line1 || "—"],
    ["邮编", v.postalCode || "—"],
  ]);

  if (probeInfo) {
    probeInfo.textContent = `${providerName(v)} · ${v.probeReason}`;
  }
};

root?.addEventListener("change", (event) => {
  const detail = (event as CustomEvent<YnCheckoutAddressChangeDetail>).detail;
  if (payload) payload.textContent = JSON.stringify(detail, null, 2);
  renderSummary(detail);
});
