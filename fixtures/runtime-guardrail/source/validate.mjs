import { readFileSync } from "node:fs";

const app = readFileSync("app.js", "utf8");
if (/\sstyle=/.test(app)) {
  console.error("Inline styles violate the fixture's Content Security Policy.");
  process.exit(1);
}

console.log("CSP validation passed.");
