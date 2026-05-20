import "./demo-dr5hn-region";
import { fillSummaryList } from "./demo-summary";
import type { Dr5hnRegionValue } from "./dr5hn-region-types";

const root = document.getElementById("app");
const payload = document.getElementById("payload");
const summary = document.getElementById("summary");

const renderSummary = (v: Dr5hnRegionValue) => {
  fillSummaryList(summary, [
    ["状态", v.formReady ? "可提交" : v.regionComplete ? "待填联系与地址" : "待选区域"],
    ["国家", v.countryCode ? `${v.countryName} (${v.countryCode})` : "—"],
    ["省/州", v.stateName ? `${v.stateName}${v.stateCode ? ` (${v.stateCode})` : ""}` : "—"],
    ["城市", v.cityName || "—"],
    [
      "电话",
      v.phoneNumber ? (v.phonecode ? `+${v.phonecode} ${v.phoneNumber}` : v.phoneNumber) : "—",
    ],
    ["地址", v.line1 || "—"],
    ["补充", v.line2 || "—"],
    ["邮编", v.postalCode || "—"],
    ["货币", v.currency || "—"],
  ]);
};

root?.addEventListener("change", (event) => {
  const detail = (event as CustomEvent<Dr5hnRegionValue>).detail;
  if (payload) payload.textContent = JSON.stringify(detail, null, 2);
  renderSummary(detail);
});
