import fs from "node:fs";
import path from "node:path";

const assets =
  "C:/Users/jguo27/Projects/Personal/chatgpt-intelligent-ui/unpacked/files/origins/516c22c5dba9c1ba70ca5e7f223c5987527274aa6a88c96e8eddb77fc2e4fa5e/unauth-mweb/assets";
const present = new Set(fs.readdirSync(assets));
const specifiers = new Map();
const re = /(?:from\s*|import\s*\(\s*)["'](\.\/[^"']+\.js)["']/g;
for (const name of present) {
  if (!name.endsWith(".js")) continue;
  const text = fs.readFileSync(path.join(assets, name), "utf8");
  for (const match of text.matchAll(re)) {
    const spec = match[1].slice(2);
    if (present.has(spec)) continue;
    const sources = specifiers.get(spec) ?? new Set();
    sources.add(name);
    specifiers.set(spec, sources);
  }
}
const rows = [...specifiers.entries()].sort((a, b) => a[0].localeCompare(b[0]));
console.log(`missing ${rows.length}`);
for (const [spec, sources] of rows) {
  console.log(`${spec}\tfrom ${[...sources].slice(0, 3).join(", ")}`);
}
