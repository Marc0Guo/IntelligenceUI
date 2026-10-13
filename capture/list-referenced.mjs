import fs from "node:fs";
import path from "node:path";

const assets =
  "C:/Users/jguo27/Projects/Personal/chatgpt-intelligent-ui/unpacked/files/origins/516c22c5dba9c1ba70ca5e7f223c5987527274aa6a88c96e8eddb77fc2e4fa5e/unauth-mweb/assets";
const present = new Set(fs.readdirSync(assets));
const hits = new Map();
const re = /\.\/([A-Za-z0-9_@.+-]+\.js)/g;
for (const name of fs.readdirSync(assets)) {
  if (!name.endsWith(".js")) continue;
  const text = fs.readFileSync(path.join(assets, name), "utf8");
  for (const match of text.matchAll(re)) {
    const spec = match[1];
    if (present.has(spec)) continue;
    const sources = hits.get(spec) ?? new Set();
    sources.add(name);
    hits.set(spec, sources);
  }
}
const rows = [...hits.keys()].sort();
console.log(`referenced-missing ${rows.length}`);
for (const spec of rows) console.log(spec);
