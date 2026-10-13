import fs from "node:fs";

const text = fs.readFileSync(
  "C:/Users/jguo27/Projects/Personal/chatgpt-intelligent-ui/ui-modules/canonical-dil-snapshot-B4JFWeNe.js",
  "utf8",
);
const needles = ["html-view", "carousel-item", "loading-block", "flow-item"];
const out = [];
for (const needle of needles) {
  const at = text.indexOf(needle);
  out.push(`\n## ${needle} @ ${at}`);
  if (at >= 0) out.push(text.slice(Math.max(0, at - 180), at + 420));
}
const kebab = new Set();
for (const match of text.matchAll(/[`"']([a-z][a-z0-9]*(?:-[a-z0-9]+){1,5})[`"']/g))
  kebab.add(match[1]);
out.push("\n## kebab");
for (const value of [...kebab].sort()) out.push(value);
fs.writeFileSync(
  "C:/Users/jguo27/Projects/Personal/chatgpt-intelligent-ui/capture/snapshot-kebab.txt",
  out.join("\n"),
);
console.log("kebab", kebab.size);
