import fs from "node:fs";

const file =
  "C:/Users/jguo27/Projects/Personal/chatgpt-intelligent-ui/ui-modules/canonical-dil-snapshot-B4JFWeNe.js";
const text = fs.readFileSync(file, "utf8");
const markers = [
  "CANONICAL_DIL_V2_COMPONENTS",
  "DilRenderer",
  "DilResponseRoot",
  "component_name",
  "model_dil",
];
for (const marker of markers) {
  console.log(marker, text.indexOf(marker));
}
const names = new Set();
for (const match of text.matchAll(
  /component(?:Name|_name|Key|_key)?\s*[:=]\s*[`"']([A-Za-z0-9_.:/-]{2,80})[`"']/g,
))
  names.add(match[1]);
for (const match of text.matchAll(
  /[`"']([a-z][a-z0-9_]{2,40})[`"']\s*:\s*(?:function|\(|\{|e\.jsx|r\.jsx|[A-Za-z_$])/g,
))
  names.add("key:" + match[1]);
fs.writeFileSync(
  "C:/Users/jguo27/Projects/Personal/chatgpt-intelligent-ui/capture/snapshot-names.txt",
  [...names].sort().join("\n"),
);
console.log("names", names.size, "bytes", text.length);
const at = text.indexOf("CANONICAL_DIL_V2_COMPONENTS");
if (at >= 0) {
  fs.writeFileSync(
    "C:/Users/jguo27/Projects/Personal/chatgpt-intelligent-ui/capture/snapshot-slice.txt",
    text.slice(Math.max(0, at - 200), at + 2500),
  );
}
