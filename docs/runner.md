# Benchmark runner

The runner turns an experiment manifest into fresh baseline and treatment trials, process-isolated agent runs, JSON results, logs, and a Markdown comparison.

## Commands

```bash
node ./bin/agents-md-benchmark.mjs validate experiment.json
node ./bin/agents-md-benchmark.mjs plan experiment.json
node ./bin/agents-md-benchmark.mjs run experiment.json
node ./bin/agents-md-benchmark.mjs summarize experiment-runs/my-run/results.json
```

`validate` checks required fields and local paths. `plan` prints the trial matrix without creating files. `run` replaces the configured output directory and executes the experiment. `summarize` regenerates `summary.md` from an existing results file.

For deletion safety, the runner only replaces output directories containing its `.agents-md-benchmark-output` marker. The output cannot be the filesystem root, home directory, current directory, source directory, or an ancestor of the source.

## Minimal manifest

```json
{
  "$schema": "../schemas/experiment.schema.json",
  "version": 1,
  "name": "My repository benchmark",
  "source": "../my-repository",
  "candidate": "./AGENTS.candidate.md",
  "output": "../experiment-runs/my-repository",
  "runs": 5,
  "timeoutSeconds": 900,
  "agent": {
    "name": "my-agent",
    "version": "1.2.3",
    "command": ["my-agent-wrapper", "--prompt", "{prompt}"]
  },
  "validationCommands": ["npm test"],
  "protectedFiles": [".github/workflows/**", "package-lock.json"],
  "generatedFiles": ["dist/**", "src/generated/**"],
  "tasks": [
    {
      "id": "guardrail-task",
      "prompt": "Improve the profile card styling without changing unrelated behavior.",
      "expectedFiles": ["src/profile/**", "styles/**"]
    }
  ]
}
```

Paths are resolved relative to the manifest. Agent command entries beginning with `.` are also resolved relative to the manifest.

Keep the candidate file outside the source directory. This prevents the baseline agent from discovering the treatment instructions in another source path.

## Agent command contract

The command must:

1. Contain `{prompt}` in one argument.
2. Run non-interactively and exit when the task is complete.
3. Make changes inside its current working directory.
4. Return a nonzero exit code on failure.
5. Avoid commits, pushes, publication, and external side effects.

`{repo}` is also available when a client requires an explicit repository argument. The runner sets the process working directory to the trial copy, so most adapters do not need it.

The runner intentionally does not provide `{condition}`. Child agents should see only the task, repository, and repository-visible instructions.

## Source modes

`"sourceMode": "git"` is the default. The source must be a clean Git worktree, and only tracked files are copied. This is the recommended mode for real experiments.

`"sourceMode": "directory"` copies a directory snapshot while excluding common dependency, Git, output, and benchmark-artifact directories. Use it only when a Git snapshot is unavailable or for fixtures. Record this weaker reproducibility guarantee in the report.

## Collected data

Each trial records:

- Agent status, exit code, duration, command, and log path.
- Validation command status, duration, and bounded output.
- Tracked, untracked, ignored, expected, unexpected, protected, and generated file touches.
- Insertions, deletions, total diff lines, and `git diff --check`.

The summary reports medians and rates by task and condition. Fewer than five runs per condition are labeled as a directional signal.

## Security boundary

Experiment manifests contain executable commands. Treat them like shell scripts: inspect them before running. Agent and validation processes inherit the current environment and user permissions.
