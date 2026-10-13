import fs from "node:fs";
import path from "node:path";

const outDir =
  "C:/Users/jguo27/Projects/Personal/chatgpt-intelligent-ui/ui-modules";
const base = "https://chatgpt.com/unauth-mweb/assets/";
fs.mkdirSync(outDir, { recursive: true });

const seeds = [
  "assistant-canonical-dil-CpAW2wP2.js",
  "assistant-canonical-dil-weather-CWxamg2B.js",
  "assistant-dil-BMpJOeu-.js",
  "assistant-map-Dk4PppDt.js",
  "assistant-carousel-DFfariMa.js",
  "assistant-user-input-0uzf7wI2.js",
  "assistant-copy-text-CW3CoyQc.js",
  "assistant-image-lightbox-D9iaL_1_.js",
  "assistant-learning-DwN9iXs4.js",
  "content-reference-sheets-CTqOTxOj.js",
  "content-reference-sheet-selection-DCNiFc9d.js",
  "conversation-interactive-client-DjYIBN90.js",
  "conversation-interactive-control-Ccjc61zK.js",
  "conversation-interactive-view-D8sD9VHW.js",
  "native-content-reference-sheets-CWawtVnO.js",
  "thinking-presentation-BfbqQU_r.js",
  "request-user-input-BYTEUbw4.js",
  "static-assistant-reveal-gDscVtI4.js",
  "conversation-streaming-parent-control-Dp0tVIS3.js",
  "application-frame-DvypJadf.js",
  "octane-shell-shared-BoZRL7hg.js",
  "octane-signals-engine-CtPRJ0LT.js",
  "rolldown-runtime-DOd5ywYy.js",
];

const locale = /^[a-z]{2}(?:-[A-Z]{2})?-/;
const specRe = /\.\/([A-Za-z0-9_@.+-]+\.js)/g;
const queue = [...seeds];
const seen = new Set();
const saved = [];
const failed = [];

while (queue.length > 0 && seen.size < 80) {
  const name = queue.shift();
  if (seen.has(name) || locale.test(name)) continue;
  seen.add(name);
  const destination = path.join(outDir, name);
  let bytes;
  if (fs.existsSync(destination) && fs.statSync(destination).size > 0) {
    bytes = fs.readFileSync(destination);
  } else {
    const response = await fetch(base + name, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        accept: "*/*",
      },
    });
    if (!response.ok) {
      failed.push(`${response.status} ${name}`);
      continue;
    }
    bytes = Buffer.from(await response.arrayBuffer());
    const head = bytes.subarray(0, 80).toString("utf8");
    if (head.includes("<html") || head.includes("Just a moment")) {
      failed.push(`challenge ${name}`);
      continue;
    }
    fs.writeFileSync(destination, bytes);
  }
  saved.push(`${bytes.length}\t${name}`);
  const text = bytes.toString("utf8");
  for (const match of text.matchAll(specRe)) {
    const next = match[1];
    if (!seen.has(next) && !locale.test(next)) queue.push(next);
  }
}

console.log(`saved ${saved.length} seen ${seen.size} queued ${queue.length}`);
console.log(saved.join("\n"));
if (failed.length) {
  console.log("--- failed ---");
  console.log(failed.join("\n"));
}
