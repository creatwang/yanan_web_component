export const fillSummaryList = (list: HTMLElement | null, rows: Array<[string, string]>) => {
  if (!list) {
    return;
  }
  list.replaceChildren();
  for (const [label, text] of rows) {
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.textContent = label;
    const strong = document.createElement("strong");
    strong.textContent = text;
    li.append(span, strong);
    list.append(li);
  }
};
