import fs from "node:fs";

const s = fs.readFileSync(
  "C:/Users/jguo27/Projects/Personal/chatgpt-intelligent-ui/ui-modules/a-CEYli6pc.js",
  "utf8",
);
let from = 0;
let n = 0;
while (n < 6) {
  const i = s.indexOf("invocationId", from);
  if (i < 0) break;
  console.log("\n====", i, "====");
  console.log(s.slice(Math.max(0, i - 180), i + 260));
  from = i + 12;
  n += 1;
}
