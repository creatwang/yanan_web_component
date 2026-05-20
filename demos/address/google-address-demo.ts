import "./demo-google-address";
import { fillSummaryList } from "./demo-summary";
import type { GoogleAddressPayload } from "./google-address-types";

const root = document.getElementById("app");
const payload = document.getElementById("payload");
const summary = document.getElementById("summary");

const renderSummary = (v: GoogleAddressPayload) => {
  fillSummaryList(summary, [
    ["状态", v.formReady ? "可提交" : "待填写"],
    ["国家", v.countryCode ? `${v.countryName} (${v.countryCode})` : "—"],
    ["省/州", v.stateName ? `${v.stateName}${v.stateCode ? ` (${v.stateCode})` : ""}` : "—"],
    ["城市", v.cityName || "—"],
    [
      "电话",
      v.phoneNumber ? (v.phonecode ? `+${v.phonecode} ${v.phoneNumber}` : v.phoneNumber) : "—",
    ],
    ["地址", v.line1 || "—"],
    ["邮编", v.postalCode || "—"],
  ]);
};

root?.addEventListener("address-change", (event) => {
  const detail = (event as CustomEvent<GoogleAddressPayload>).detail;
  if (payload) payload.textContent = JSON.stringify(detail, null, 2);
  renderSummary(detail);
});
