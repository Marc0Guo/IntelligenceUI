import fs from "node:fs";

const text = fs.readFileSync(
  "C:/Users/jguo27/Projects/Personal/chatgpt-intelligent-ui/ui-modules/assistant-canonical-dil-v2-D3Mxms_M.js",
  "utf8",
);

function grab(label, needle, before, after, nth = 0) {
  let from = 0;
  let at = -1;
  for (let i = 0; i <= nth; i += 1) {
    at = text.indexOf(needle, from);
    if (at < 0) return `\n## ${label} MISSING`;
    from = at + needle.length;
  }
  return `\n## ${label} @ ${at}\n` + text.slice(Math.max(0, at - before), at + after);
}

const parts = [
  grab("jobs card fields", "job_title", 100, 1800, 0),
  grab("news title row", "state.domain", 200, 1600, 0),
  grab("clinical scorecard", "ResolvedClinicalScorecard =", 0, 2200, 0),
  grab("gcs fields", "calculator_glasgow_coma_scale", 0, 1800, 0),
  grab("news carousel", "news_article_widget_carousel", 0, 1200, 0),
];
fs.writeFileSync(
  "C:/Users/jguo27/Projects/Personal/chatgpt-intelligent-ui/capture/widget-layout.txt",
  parts.join("\n"),
);
console.log(parts.map((part) => part.length).join(","));
