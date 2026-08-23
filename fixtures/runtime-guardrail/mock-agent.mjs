#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from "node:fs";

const prompt = process.argv.slice(2).join(" ");
if (!prompt) {
  console.error("A task prompt is required.");
  process.exit(1);
}

const hasGuardrail =
  existsSync("AGENTS.md") && readFileSync("AGENTS.md", "utf8").includes("no inline styles");

if (hasGuardrail) {
  writeFileSync(
    "app.js",
    'document.querySelector("#app").innerHTML = `<article class="profile-card profile-card--polished"><h1>Agent Benchmark</h1><p>Runtime-safe styling.</p></article>`;\n',
  );
  writeFileSync(
    "styles.css",
    `${readFileSync("styles.css", "utf8").trim()}

.profile-card--polished {
  border: 1px solid #d0d7de;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgb(140 149 159 / 20%);
  padding: 24px;
}
`,
  );
} else {
  writeFileSync(
    "app.js",
    'document.querySelector("#app").innerHTML = `<article class="profile-card" style="border: 1px solid #d0d7de; border-radius: 12px; box-shadow: 0 8px 24px rgb(140 149 159 / 20%); padding: 24px"><h1>Agent Benchmark</h1><p>Polished styling.</p></article>`;\n',
  );
}

console.log(`Completed task: ${prompt}`);
