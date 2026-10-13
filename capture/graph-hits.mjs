import fs from "node:fs";

const data = JSON.parse(
  fs.readFileSync(
    "C:/Users/jguo27/Projects/Personal/chatgpt-intelligent-ui/analysis/dil-evidence.json",
    "utf8",
  ),
);
const want = [
  "assistant-canonical-dil-v2",
  "assistant-dil-BMpJOeu",
  "canonical-dil-snapshot",
  "registry-BhKJEzU7",
  "declarative-partial-updates",
  "application-presentation-runtime",
];
const nodes = data.normalized_result.graph.nodes;
const hits = [];
for (const node of nodes) {
  const path = node.path || node.identity?.path || node.label || "";
  const text = typeof path === "string" ? path : JSON.stringify(node).slice(0, 500);
  if (!want.some((name) => text.includes(name) || JSON.stringify(node).includes(name)))
    continue;
  hits.push({
    id: node.node_id || node.id,
    kind: node.kind || node.role,
    path: text.slice(0, 180),
    keys: Object.keys(node).slice(0, 20),
  });
}
fs.writeFileSync(
  "C:/Users/jguo27/Projects/Personal/chatgpt-intelligent-ui/capture/graph-hits.json",
  JSON.stringify(hits, null, 2),
);
console.log("hits", hits.length);
