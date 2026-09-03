#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import {
  chmodSync,
  copyFileSync,
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readlinkSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, join, parse, relative, resolve, sep } from "node:path";
import process from "node:process";

const [, , command, inputPath] = process.argv;
const outputMarker = ".agents-md-benchmark-output";

if (!command || !inputPath || !["validate", "plan", "run", "summarize"].includes(command)) {
  printUsage();
  process.exit(1);
}

try {
  if (command === "summarize") {
    const resultsPath = resolve(inputPath);
    const results = readJson(resultsPath);
    const summary = createSummary(results);
    const outputPath = join(dirname(resultsPath), "summary.md");
    writeFileSync(outputPath, summary);
    console.log(`Wrote ${outputPath}`);
  } else {
    const manifestPath = resolve(inputPath);
    const manifest = loadManifest(manifestPath);
    validateManifest(manifest);

    if (command === "validate") {
      console.log(`Valid manifest: ${manifestPath}`);
    } else if (command === "plan") {
      printPlan(manifest, manifestPath);
    } else {
      runExperiment(manifest, manifestPath);
    }
  }
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}

function printUsage() {
  console.error(`Usage:
  agents-md-benchmark validate <manifest.json>
  agents-md-benchmark plan <manifest.json>
  agents-md-benchmark run <manifest.json>
  agents-md-benchmark summarize <results.json>`);
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    throw new Error(`Cannot read JSON at ${path}: ${error.message}`);
  }
}

function loadManifest(path) {
  const manifest = readJson(path);
  const base = dirname(path);
  return {
    ...manifest,
    source: resolve(base, manifest.source),
    candidate: resolve(base, manifest.candidate),
    output: resolve(base, manifest.output),
    sourceMode: manifest.sourceMode ?? "git",
    runs: manifest.runs ?? 1,
    timeoutSeconds: manifest.timeoutSeconds ?? 900,
    validationCommands: manifest.validationCommands ?? [],
    protectedFiles: manifest.protectedFiles ?? [],
    generatedFiles: manifest.generatedFiles ?? [],
    agent: {
      ...manifest.agent,
      command: manifest.agent?.command?.map((part) =>
        part.startsWith(".") && !part.includes("{") ? resolve(base, part) : part,
      ),
    },
  };
}

function validateManifest(manifest) {
  const errors = [];
  if (manifest.version !== 1) errors.push("version must be 1");
  if (!manifest.name) errors.push("name is required");
  if (!existsSync(manifest.source)) errors.push(`source does not exist: ${manifest.source}`);
  if (!existsSync(manifest.candidate)) errors.push(`candidate does not exist: ${manifest.candidate}`);
  if (manifest.candidate === manifest.source || isInside(manifest.source, manifest.candidate)) {
    errors.push("candidate must be outside the source directory to prevent baseline contamination");
  }
  if (!["git", "directory"].includes(manifest.sourceMode)) {
    errors.push("sourceMode must be git or directory");
  }
  if (!Number.isInteger(manifest.runs) || manifest.runs < 1) {
    errors.push("runs must be a positive integer");
  }
  if (!Number.isInteger(manifest.timeoutSeconds) || manifest.timeoutSeconds < 1) {
    errors.push("timeoutSeconds must be a positive integer");
  }
  if (!Array.isArray(manifest.agent?.command) || manifest.agent.command.length === 0) {
    errors.push("agent.command must be a non-empty string array");
  } else if (!manifest.agent.command.some((part) => part.includes("{prompt}"))) {
    errors.push("agent.command must contain a {prompt} placeholder");
  } else if (manifest.agent.command.some((part) => part.includes("{condition}"))) {
    errors.push("agent.command cannot expose the benchmark condition");
  }
  if (!Array.isArray(manifest.tasks) || manifest.tasks.length === 0) {
    errors.push("tasks must contain at least one task");
  } else {
    const ids = new Set();
    for (const task of manifest.tasks) {
      if (!task.id || !/^[a-z0-9][a-z0-9-]*$/.test(task.id)) {
        errors.push("every task id must use lowercase letters, numbers, and hyphens");
      } else if (ids.has(task.id)) {
        errors.push(`duplicate task id: ${task.id}`);
      }
      ids.add(task.id);
      if (!task.prompt) errors.push(`task ${task.id ?? "<unknown>"} needs a prompt`);
    }
  }
  if (errors.length) throw new Error(`Invalid manifest:\n- ${errors.join("\n- ")}`);
}

function printPlan(manifest, manifestPath) {
  console.log(`Experiment: ${manifest.name}`);
  console.log(`Manifest: ${manifestPath}`);
  console.log(`Source: ${manifest.source} (${manifest.sourceMode})`);
  console.log(`Candidate: ${manifest.candidate}`);
  console.log(`Output: ${manifest.output}`);
  console.log(`Trials: ${manifest.tasks.length} tasks x ${manifest.runs} runs x 2 conditions`);
  for (const task of manifest.tasks) {
    console.log(`- ${task.id}: ${task.prompt.replace(/\s+/g, " ").trim()}`);
  }
}

function runExperiment(manifest, manifestPath) {
  if (manifest.sourceMode === "git") assertCleanGitSource(manifest.source);
  assertSafeOutput(manifest.output, manifest.source);
  if (existsSync(manifest.output)) {
    if (!existsSync(join(manifest.output, outputMarker))) {
      throw new Error(
        `Refusing to replace unmarked output directory: ${manifest.output}. Choose a new directory or add it only after confirming it contains benchmark artifacts.`,
      );
    }
    rmSync(manifest.output, { recursive: true, force: true });
  }
  mkdirSync(manifest.output, { recursive: true });
  writeFileSync(join(manifest.output, outputMarker), "Managed by agents-md-benchmark.\n");

  const startedAt = new Date().toISOString();
  const trials = [];
  for (const task of manifest.tasks) {
    for (let run = 1; run <= manifest.runs; run += 1) {
      for (const condition of ["baseline", "treatment"]) {
        const slot = condition === "baseline" ? "a" : "b";
        const trialDirectory = join(
          manifest.output,
          "trials",
          task.id,
          `run-${String(run).padStart(3, "0")}`,
          slot,
        );
        console.log(`[${task.id} ${run}/${manifest.runs} ${slot}] preparing`);
        prepareTrial(manifest, trialDirectory, condition);
        const trial = executeTrial(manifest, task, run, condition, slot, trialDirectory);
        trials.push(trial);
        console.log(
          `[${task.id} ${run}/${manifest.runs} ${slot}] ${trial.agent.status}, ${trial.metrics.changedFileCount} files`,
        );
      }
    }
  }

  const results = {
    schemaVersion: 1,
    experiment: {
      name: manifest.name,
      manifest: relative(manifest.output, manifestPath),
      sourceMode: manifest.sourceMode,
      runsPerCondition: manifest.runs,
      startedAt,
      completedAt: new Date().toISOString(),
    },
    configuration: {
      agent: {
        name: manifest.agent.name ?? "unspecified",
        version: manifest.agent.version ?? "unspecified",
        command: manifest.agent.command.map((part) => basename(part)),
      },
      protectedFiles: manifest.protectedFiles,
      generatedFiles: manifest.generatedFiles,
      timeoutSeconds: manifest.timeoutSeconds,
    },
    trials,
  };
  const resultsPath = join(manifest.output, "results.json");
  writeFileSync(resultsPath, `${JSON.stringify(results, null, 2)}\n`);
  writeFileSync(join(manifest.output, "summary.md"), createSummary(results));
  console.log(`Wrote ${resultsPath}`);
  console.log(`Wrote ${join(manifest.output, "summary.md")}`);
}

function assertSafeOutput(output, source) {
  const filesystemRoot = parse(output).root;
  if ([filesystemRoot, homedir(), process.cwd()].includes(output)) {
    throw new Error("Output cannot be the filesystem root, home directory, or current directory.");
  }
  if (output === source || isInside(output, source)) {
    throw new Error("Output cannot be the source directory or one of its ancestors.");
  }
}

function isInside(parent, child) {
  const path = relative(parent, child);
  return path !== "" && path !== ".." && !path.startsWith(`..${sep}`);
}

function assertCleanGitSource(source) {
  runChecked("git", ["-C", source, "rev-parse", "--show-toplevel"]);
  const status = runChecked("git", ["-C", source, "status", "--porcelain"]).stdout.trim();
  if (status) {
    throw new Error(
      "Git source is dirty. Commit or stash it, or explicitly use sourceMode \"directory\" for a snapshot that includes working-tree files.",
    );
  }
}

function prepareTrial(manifest, trialDirectory, condition) {
  mkdirSync(trialDirectory, { recursive: true });
  if (manifest.sourceMode === "git") {
    copyGitFiles(manifest.source, trialDirectory);
  } else {
    cpSync(manifest.source, trialDirectory, {
      recursive: true,
      filter: (source) => isIncludedPath(source, manifest.source),
    });
  }

  const instructionsPath = join(trialDirectory, "AGENTS.md");
  rmSync(instructionsPath, { force: true });
  if (condition === "treatment") copyFileSync(manifest.candidate, instructionsPath);

  runChecked("git", ["init", "--quiet"], { cwd: trialDirectory });
  runChecked("git", ["config", "user.email", "benchmark@example.invalid"], {
    cwd: trialDirectory,
  });
  runChecked("git", ["config", "user.name", "AGENTS.md Benchmark"], {
    cwd: trialDirectory,
  });
  runChecked("git", ["add", "--all"], { cwd: trialDirectory });
  runChecked("git", ["commit", "--quiet", "--no-gpg-sign", "-m", "benchmark starting snapshot"], {
    cwd: trialDirectory,
  });
}

function copyGitFiles(source, destination) {
  const output = runChecked("git", ["-C", source, "ls-files", "-z"]).stdout;
  for (const path of output.split("\0").filter(Boolean)) {
    copyEntry(join(source, path), join(destination, path));
  }
}

function copyEntry(source, destination) {
  mkdirSync(dirname(destination), { recursive: true });
  const stat = lstatSync(source);
  if (stat.isSymbolicLink()) {
    symlinkSync(readlinkSync(source), destination);
  } else {
    copyFileSync(source, destination);
    chmodSync(destination, stat.mode);
  }
}

function isIncludedPath(path, root) {
  if (path === root) return true;
  const name = basename(path);
  return ![".git", "node_modules", "dist", "experiment-runs", "private-artifacts"].includes(name);
}

function executeTrial(manifest, task, run, condition, slot, trialDirectory) {
  const agentCommand = expandCommand(manifest.agent.command, {
    prompt: task.prompt,
    repo: trialDirectory,
  });
  const started = Date.now();
  const agentResult = spawnSync(agentCommand[0], agentCommand.slice(1), {
    cwd: trialDirectory,
    encoding: "utf8",
    env: process.env,
    timeout: manifest.timeoutSeconds * 1000,
    maxBuffer: 10 * 1024 * 1024,
  });
  const durationMs = Date.now() - started;

  const logDirectory = join(manifest.output, "logs", task.id);
  mkdirSync(logDirectory, { recursive: true });
  const logPath = join(logDirectory, `run-${String(run).padStart(3, "0")}-${slot}.log`);
  writeFileSync(
    logPath,
    [
      `$ ${formatCommand(agentCommand)}`,
      "",
      "## stdout",
      agentResult.stdout ?? "",
      "",
      "## stderr",
      agentResult.stderr ?? "",
    ].join("\n"),
  );

  const validations = [...manifest.validationCommands, ...(task.validationCommands ?? [])].map(
    (validationCommand) => runValidation(validationCommand, trialDirectory, manifest.timeoutSeconds),
  );
  const metrics = collectMetrics(manifest, task, trialDirectory);

  return {
    taskId: task.id,
    run,
    condition,
    slot,
    agent: {
      status: processStatus(agentResult),
      exitCode: agentResult.status,
      signal: agentResult.signal,
      durationMs,
      command: agentCommand.map((part, index) => (index === 0 ? basename(part) : part)),
      log: relative(manifest.output, logPath),
    },
    validations,
    metrics,
  };
}

function expandCommand(parts, replacements) {
  return parts.map((part) =>
    part.replaceAll("{prompt}", replacements.prompt).replaceAll("{repo}", replacements.repo),
  );
}

function processStatus(result) {
  if (result.error?.code === "ETIMEDOUT" || result.signal === "SIGTERM") return "timeout";
  if (result.error) return "error";
  return result.status === 0 ? "completed" : "failed";
}

function runValidation(command, cwd, timeoutSeconds) {
  const started = Date.now();
  const result = spawnSync(command, {
    cwd,
    encoding: "utf8",
    shell: true,
    timeout: timeoutSeconds * 1000,
    maxBuffer: 10 * 1024 * 1024,
  });
  return {
    command,
    status: processStatus(result),
    exitCode: result.status,
    durationMs: Date.now() - started,
    output: truncate([result.stdout, result.stderr].filter(Boolean).join("\n"), 4000),
  };
}

function collectMetrics(manifest, task, cwd) {
  const tracked = splitNull(runChecked("git", ["diff", "--name-only", "-z"], { cwd }).stdout);
  const untracked = splitNull(
    runChecked("git", ["ls-files", "--others", "--exclude-standard", "-z"], { cwd }).stdout,
  );
  const ignored = splitNull(
    runChecked("git", ["ls-files", "--others", "--ignored", "--exclude-standard", "-z"], {
      cwd,
    }).stdout,
  );
  const changedFiles = [...new Set([...tracked, ...untracked])].sort();

  runChecked("git", ["add", "--intent-to-add", "--all"], { cwd });
  const numstat = runChecked("git", ["diff", "--numstat"], { cwd }).stdout;
  let insertions = 0;
  let deletions = 0;
  for (const line of numstat.split("\n").filter(Boolean)) {
    const [added, removed] = line.split("\t");
    if (added !== "-") insertions += Number(added);
    if (removed !== "-") deletions += Number(removed);
  }

  const protectedPatterns = [...manifest.protectedFiles, ...(task.protectedFiles ?? [])];
  const generatedPatterns = [...manifest.generatedFiles, ...(task.generatedFiles ?? [])];
  return {
    changedFiles,
    changedFileCount: changedFiles.length,
    untrackedFiles: untracked,
    ignoredFiles: ignored,
    insertions,
    deletions,
    diffLines: insertions + deletions,
    protectedFilesTouched: changedFiles.filter((path) => matchesAny(path, protectedPatterns)),
    generatedFilesTouched: changedFiles.filter((path) => matchesAny(path, generatedPatterns)),
    expectedFilesTouched: changedFiles.filter((path) => matchesAny(path, task.expectedFiles ?? [])),
    unexpectedFilesTouched: changedFiles.filter(
      (path) => (task.expectedFiles ?? []).length > 0 && !matchesAny(path, task.expectedFiles),
    ),
    diffCheckPassed:
      spawnSync("git", ["diff", "--check"], { cwd, encoding: "utf8" }).status === 0,
  };
}

function matchesAny(path, patterns) {
  return patterns.some((pattern) => globToRegExp(pattern).test(path));
}

function globToRegExp(pattern) {
  let source = "^";
  for (let index = 0; index < pattern.length; index += 1) {
    const character = pattern[index];
    if (character === "*" && pattern[index + 1] === "*") {
      source += ".*";
      index += 1;
    } else if (character === "*") {
      source += "[^/]*";
    } else if (character === "?") {
      source += "[^/]";
    } else {
      source += character.replace(/[\\^$+?.()|[\]{}]/g, "\\$&");
    }
  }
  return new RegExp(`${source}$`);
}

function createSummary(results) {
  const groups = new Map();
  for (const trial of results.trials) {
    const key = `${trial.taskId}:${trial.condition}`;
    const group = groups.get(key) ?? [];
    group.push(trial);
    groups.set(key, group);
  }

  const taskIds = [...new Set(results.trials.map((trial) => trial.taskId))];
  const confidence =
    results.experiment.runsPerCondition >= 5
      ? "Repeated-run evidence"
      : "Directional signal only (fewer than five runs per condition)";
  const lines = [
    `# ${results.experiment.name}`,
    "",
    `**Confidence:** ${confidence}`,
    "",
    "| Task | Condition | Runs | Median files | File range | Median diff lines | Validation pass | Protected touches | Agent failures |",
    "|---|---|---:|---:|---:|---:|---:|---:|---:|",
  ];

  for (const taskId of taskIds) {
    for (const condition of ["baseline", "treatment"]) {
      const trials = groups.get(`${taskId}:${condition}`) ?? [];
      const validationPasses = trials.filter(
        (trial) =>
          trial.validations.length === 0 ||
          trial.validations.every((validation) => validation.status === "completed"),
      ).length;
      const protectedTouches = trials.filter(
        (trial) => trial.metrics.protectedFilesTouched.length > 0,
      ).length;
      const failures = trials.filter((trial) => trial.agent.status !== "completed").length;
      const changedFileCounts = trials.map((trial) => trial.metrics.changedFileCount);
      lines.push(
        `| ${taskId} | ${condition} | ${trials.length} | ${median(changedFileCounts)} | ${range(changedFileCounts)} | ${median(trials.map((trial) => trial.metrics.diffLines))} | ${validationPasses}/${trials.length} | ${protectedTouches}/${trials.length} | ${failures}/${trials.length} |`,
      );
    }
  }

  lines.push(
    "",
    "## Interpretation",
    "",
    "Compare conditions task by task. Prefer fewer protected or unexpected touches, successful validation, smaller well-scoped diffs, and lower variance. Do not infer causality from a single run or from diff size alone.",
    "",
    "## Reproducibility",
    "",
    `- Runs per condition: ${results.experiment.runsPerCondition}`,
    `- Agent: ${results.configuration.agent?.name ?? "unspecified"} ${results.configuration.agent?.version ?? ""}`.trim(),
    `- Started: ${results.experiment.startedAt}`,
    `- Completed: ${results.experiment.completedAt}`,
    `- Timeout: ${results.configuration.timeoutSeconds} seconds`,
    "",
  );
  return lines.join("\n");
}

function range(values) {
  if (values.length === 0) return "0";
  return `${Math.min(...values)}-${Math.max(...values)}`;
}

function median(values) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

function runChecked(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
    ...options,
  });
  if (result.error || result.status !== 0) {
    throw new Error(
      `Command failed: ${formatCommand([command, ...args])}\n${result.error?.message ?? result.stderr}`,
    );
  }
  return result;
}

function formatCommand(parts) {
  return parts.map((part) => JSON.stringify(part)).join(" ");
}

function splitNull(value) {
  return value.split("\0").filter(Boolean);
}

function truncate(value, length) {
  return value.length > length ? `${value.slice(0, length)}\n...[truncated]` : value;
}
