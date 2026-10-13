import fs from "node:fs";
import path from "node:path";

const root =
  "C:/Users/jguo27/Projects/Personal/chatgpt-intelligent-ui/unpacked/files/origins/516c22c5dba9c1ba70ca5e7f223c5987527274aa6a88c96e8eddb77fc2e4fa5e/unauth-mweb/assets";
const interesting =
  /intelligent|presentation|dil-|dil_|widget|compiler|streamable|content-reference|contentReference|partial-update|hydration|ui-node|interface|component|chart|map/i;
const files = [
  "application-presentation-runtime-iQN4rl4D.js",
  "application-frame-runtime-modules-CT-Rezk6.js",
  "declarative-partial-updates-CmXu-Wzw.js",
  "application-hydration-capture-DgS9d2BT.js",
  "registry-BhKJEzU7.js",
  "octane-home-client-DPLk-fgP.js",
  "a-ngqEBZ1g.js",
  "octane-shell-shared-BoZRL7hg.js",
  "early-shared-runtime-BYkNLVmy.js",
];
const out = [];
const re = /[`"']([^"'`]{4,140})[`"']/g;
for (const name of files) {
  const filePath = path.join(root, name);
  if (!fs.existsSync(filePath)) {
    out.push(`MISSING ${name}`);
    continue;
  }
  const text = fs.readFileSync(filePath, "utf8");
  const found = new Set();
  for (const match of text.matchAll(re)) {
    if (interesting.test(match[1])) found.add(match[1]);
  }
  out.push(`\n## ${name} strings ${found.size} bytes ${text.length}`);
  for (const value of found) out.push(value);
}
const destination =
  "C:/Users/jguo27/Projects/Personal/chatgpt-intelligent-ui/capture/string-hits.txt";
fs.writeFileSync(destination, out.join("\n"));
console.log(`wrote ${out.length} lines`);
