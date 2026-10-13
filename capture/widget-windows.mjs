import fs from "node:fs";

const text = fs.readFileSync(
  "C:/Users/jguo27/Projects/Personal/chatgpt-intelligent-ui/ui-modules/assistant-canonical-dil-v2-D3Mxms_M.js",
  "utf8",
);
const needles = [
  "jobs_widget",
  "news_article_widget",
  "homework_helper_v2",
  "calculator_glasgow",
  "reservation_widget",
  "credit_score_widget",
  "entity_reviews",
  "care_provider",
];
const out = [];
for (const needle of needles) {
  let from = 0;
  let count = 0;
  while (count < 2) {
    const at = text.indexOf(needle, from);
    if (at < 0) break;
    out.push(`\n## ${needle} @ ${at}`);
    out.push(text.slice(Math.max(0, at - 280), at + 520));
    from = at + needle.length;
    count += 1;
  }
}
fs.writeFileSync(
  "C:/Users/jguo27/Projects/Personal/chatgpt-intelligent-ui/capture/widget-windows.txt",
  out.join("\n"),
);
console.log("bytes", out.join("\n").length);
