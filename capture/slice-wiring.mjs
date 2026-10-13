import fs from "node:fs";

const registry = fs.readFileSync(
  "C:/Users/jguo27/Projects/Personal/chatgpt-intelligent-ui/ui-modules/registry-BhKJEzU7.js",
  "utf8",
);
const dil = fs.readFileSync(
  "C:/Users/jguo27/Projects/Personal/chatgpt-intelligent-ui/ui-modules/assistant-dil-BMpJOeu-.js",
  "utf8",
);
function windowAt(text, needle, before, after) {
  const at = text.indexOf(needle);
  if (at < 0) return `MISSING ${needle}`;
  return text.slice(Math.max(0, at - before), at + after);
}
const parts = [
  "REGISTRY model_dil_v2",
  windowAt(registry, "model_dil_v2", 400, 900),
  "\n\nREGISTRY assistant-dil",
  windowAt(registry, "./assistant-dil-", 200, 500),
  "\n\nDIL ENTRY STRINGS",
];
const strings = new Set();
for (const match of dil.matchAll(/[`"']([^"'`]{3,100})[`"']/g)) strings.add(match[1]);
for (const value of strings) parts.push(value);
fs.writeFileSync(
  "C:/Users/jguo27/Projects/Personal/chatgpt-intelligent-ui/capture/wiring.txt",
  parts.join("\n"),
);
console.log("dil bytes", dil.length, "strings", strings.size);
