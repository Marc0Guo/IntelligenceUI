import fs from "node:fs";

const text = fs.readFileSync(
  "C:/Users/jguo27/Projects/Personal/chatgpt-intelligent-ui/ui-modules/assistant-canonical-dil-v2-D3Mxms_M.js",
  "utf8",
);
const marker = "CANONICAL_DIL_V2_COMPONENTS";
const at = text.indexOf(marker);
console.log("index", at, "len", text.length);
if (at >= 0) {
  fs.writeFileSync(
    "C:/Users/jguo27/Projects/Personal/chatgpt-intelligent-ui/capture/components-slice.txt",
    text.slice(at, at + 4000),
  );
}
const kinds = new Set();
for (const match of text.matchAll(/type:\s*[`"']([a-z0-9_]+)[`"']/g)) kinds.add(match[1]);
const componentKeys = new Set();
for (const match of text.matchAll(/[`"']([a-z][a-z0-9_]{2,60})[`"']\s*:/g)) {
  componentKeys.add(match[1]);
}
fs.writeFileSync(
  "C:/Users/jguo27/Projects/Personal/chatgpt-intelligent-ui/capture/component-keys.txt",
  [
    `types ${kinds.size}`,
    ...[...kinds].sort(),
    "",
    `keys ${componentKeys.size}`,
    ...[...componentKeys].sort(),
  ].join("\n"),
);
console.log("types", kinds.size, "keys", componentKeys.size);
