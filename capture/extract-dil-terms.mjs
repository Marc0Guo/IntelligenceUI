import fs from "node:fs";
import path from "node:path";

const dir = "C:/Users/jguo27/Projects/Personal/chatgpt-intelligent-ui/ui-modules";
const targets = [
  "assistant-canonical-dil-v2-D3Mxms_M.js",
  "assistant-canonical-dil-CpAW2wP2.js",
  "assistant-canonical-dil-weather-CWxamg2B.js",
  "assistant-dil-BMpJOeu-.js",
  "canonical-dil-snapshot-B4JFWeNe.js",
  "canonical-dil-entity-actions-BlLzSglt.js",
  "canonical-dil-user-input-router-DnxhXXCX.js",
  "native-dil-location-state-DsaJIvrQ.js",
  "visualization-DlZtHdm0.js",
  "visualization-rRdWabDI.js",
  "registry-BhKJEzU7.js",
];
const snake = /[A-Za-z][A-Za-z0-9]*(?:_[A-Za-z0-9]+){1,8}/g;
const quoted = /[`"']([^"'`]{3,90})[`"']/g;
const lines = [];
for (const name of targets) {
  const text = fs.readFileSync(path.join(dir, name), "utf8");
  const names = new Set();
  for (const match of text.matchAll(snake)) {
    const value = match[0];
    if (
      /widget|chart|dil|card|map|sheet|form|table|graph|timeline|quiz|weather|stock|calculator|converter|citation|image|video|audio|code|button|input|layout|component|compiler|stream/i.test(
        value,
      )
    )
      names.add(value);
  }
  const attrs = new Set();
  for (const match of text.matchAll(/data-[a-z0-9-]{3,60}/g)) attrs.add(match[0]);
  const phrases = new Set();
  for (const match of text.matchAll(quoted)) {
    const value = match[1];
    if (
      /widget|dil|presentation|compiler|stream|component|content.reference|model_dil/i.test(
        value,
      ) &&
      value.length < 90
    )
      phrases.add(value);
  }
  lines.push(`\n## ${name} bytes ${text.length}`);
  lines.push("SNAKE");
  for (const value of [...names].sort()) lines.push(value);
  lines.push("ATTR");
  for (const value of [...attrs].sort()) lines.push(value);
  lines.push("PHRASE");
  for (const value of [...phrases].sort()) lines.push(value);
}
const destination =
  "C:/Users/jguo27/Projects/Personal/chatgpt-intelligent-ui/capture/dil-terms.txt";
fs.writeFileSync(destination, lines.join("\n"));
console.log("lines", lines.length);
