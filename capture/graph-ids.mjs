import fs from "node:fs";

const data = JSON.parse(
  fs.readFileSync(
    "C:/Users/jguo27/Projects/Personal/chatgpt-intelligent-ui/analysis/dil-evidence.json",
    "utf8",
  ),
);
const want = [
  "assistant-canonical-dil-v2-D3Mxms_M.js",
  "assistant-dil-BMpJOeu-.js",
  "canonical-dil-snapshot-B4JFWeNe.js",
  "registry-BhKJEzU7.js",
  "declarative-partial-updates-CmXu-Wzw.js",
  "application-presentation-runtime-iQN4rl4D.js",
  "assistant-canonical-dil-CpAW2wP2.js",
];
const lines = [];
for (const node of data.normalized_result.graph.nodes) {
  const identity = JSON.stringify(node.identity ?? {});
  const hit = want.find((name) => identity.includes(name));
  if (!hit) continue;
  lines.push(`${node.kind}\t${node.node_id}\t${hit}`);
}
console.log(lines.join("\n"));
console.log("count", lines.length);
