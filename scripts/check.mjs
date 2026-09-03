import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const required = [
  "README.md",
  "plugin.json",
  "package.json",
  "bin/agents-md-benchmark.mjs",
  "schemas/experiment.schema.json",
  "schemas/results.schema.json",
  "examples/fixture-experiment.json",
  "skills/agents-md-benchmark/SKILL.md",
];

for (const path of required) {
  if (!existsSync(join(root, path))) throw new Error(`Missing required file: ${path}`);
}

for (const path of walk(root)) {
  if (path.endsWith(".json")) JSON.parse(readFileSync(join(root, path), "utf8"));
  if (path.endsWith(".md")) checkMarkdownLinks(path);
}

const plugin = JSON.parse(readFileSync(join(root, "plugin.json"), "utf8"));
const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
if (plugin.version !== packageJson.version) {
  throw new Error("plugin.json and package.json versions must match.");
}
for (const field of ["name", "version", "description", "license", "author", "repository"]) {
  if (!plugin[field]) throw new Error(`plugin.json is missing ${field}.`);
}

run("node", ["--check", "bin/agents-md-benchmark.mjs"]);
run("node", ["bin/agents-md-benchmark.mjs", "validate", "examples/fixture-experiment.json"]);
run("node", ["bin/agents-md-benchmark.mjs", "run", "examples/fixture-experiment.json"]);
runGitSourceSmokeTest();

const results = JSON.parse(
  readFileSync(join(root, "experiment-runs/fixture/results.json"), "utf8"),
);
const baseline = results.trials.filter((trial) => trial.condition === "baseline");
const treatment = results.trials.filter((trial) => trial.condition === "treatment");
if (!baseline.every((trial) => trial.validations[0]?.status === "failed")) {
  throw new Error("Fixture baseline should demonstrate the CSP failure.");
}
if (!treatment.every((trial) => trial.validations[0]?.status === "completed")) {
  throw new Error("Fixture treatment should satisfy the CSP guardrail.");
}
for (const trial of results.trials) {
  for (const field of ["taskId", "run", "condition", "agent", "validations", "metrics"]) {
    if (!(field in trial)) throw new Error(`Fixture result trial is missing ${field}.`);
  }
}

console.log("All checks passed.");

function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed:\n${result.stdout}\n${result.stderr}`);
  }
}

function runGitSourceSmokeTest() {
  const smokeRoot = join(root, "experiment-runs/git-source-smoke");
  const source = join(smokeRoot, "source");
  const output = join(smokeRoot, "output");
  rmSync(smokeRoot, { recursive: true, force: true });
  mkdirSync(smokeRoot, { recursive: true });
  cpSync(join(root, "fixtures/runtime-guardrail/source"), source, { recursive: true });
  run("git", ["-C", source, "init", "--quiet"]);
  run("git", ["-C", source, "config", "user.email", "benchmark@example.invalid"]);
  run("git", ["-C", source, "config", "user.name", "AGENTS.md Benchmark"]);
  run("git", ["-C", source, "add", "--all"]);
  run("git", ["-C", source, "commit", "--quiet", "--no-gpg-sign", "-m", "fixture"]);

  const manifestPath = join(smokeRoot, "manifest.json");
  writeFileSync(
    manifestPath,
    `${JSON.stringify(
      {
        version: 1,
        name: "Git source smoke test",
        source,
        candidate: join(root, "fixtures/runtime-guardrail/AGENTS.candidate.md"),
        output,
        runs: 1,
        timeoutSeconds: 30,
        agent: {
          name: "deterministic fixture agent",
          version: "1",
          command: [
            "node",
            join(root, "fixtures/runtime-guardrail/mock-agent.mjs"),
            "{prompt}",
          ],
        },
        tasks: [
          {
            id: "git-source",
            prompt: "Polish the profile card.",
            validationCommands: ["node validate.mjs"],
          },
        ],
      },
      null,
      2,
    )}\n`,
  );
  run("node", ["bin/agents-md-benchmark.mjs", "run", manifestPath]);
  if (!existsSync(join(output, "results.json"))) {
    throw new Error("Git source smoke test did not produce results.");
  }
}

function* walk(directory) {
  for (const entry of readdirSync(directory)) {
    if ([".git", "experiment-runs", "node_modules"].includes(entry)) continue;
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) yield* walk(path);
    else yield relative(root, path);
  }
}

function checkMarkdownLinks(path) {
  const content = readFileSync(join(root, path), "utf8");
  for (const match of content.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const target = match[1].split("#")[0];
    if (!target || /^[a-z]+:/i.test(target) || target.startsWith("#")) continue;
    const resolved = resolve(root, dirname(path), target);
    if (!existsSync(resolved)) throw new Error(`Broken Markdown link in ${path}: ${match[1]}`);
  }
}
