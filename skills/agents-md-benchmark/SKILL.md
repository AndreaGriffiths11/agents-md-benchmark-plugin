---
name: agents-md-benchmark
description: "Design and run reproducible before/after experiments that measure whether AGENTS.md changes coding-agent behavior in a repository. Use when the user asks to benchmark AGENTS.md, test agent instructions, compare behavior with and without repo guidance, improve AGENTS.md from observed mistakes, or produce an AAIF-ready contribution around AGENTS.md measurement. NOT for: benchmarking model quality generally, publishing private repository data, running destructive experiments, or replacing CI/security enforcement."
license: MIT
---

# AGENTS.md Benchmark

Help users measure whether `AGENTS.md` changes coding-agent behavior on a real repository.

The goal is not to prove `AGENTS.md` always helps. The goal is to run controlled, repeatable before/after experiments and report what actually happened: positive, neutral, negative, or inconclusive.

## Critical first steps

1. Confirm the target repository and benchmark scope.
2. Confirm whether results are private, public, or intended for a sanitized public summary.
3. Check whether the target worktree is clean or intentionally dirty.
4. Keep experiment copies local unless the user explicitly asks to publish or share them.
5. Do not commit, push, open PRs, or share benchmark artifacts unless explicitly requested.

If the repository is private or sensitive, keep raw outputs local and produce only sanitized summaries for external sharing.

## Core workflow

### 1. Inspect the repository

Identify:

- Package manager and lockfiles.
- Build, lint, test, typecheck, and preview commands.
- Existing guidance files such as `AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md`, `CONTRIBUTING.md`, and README files.
- Generated output, ignored paths, caches, and build artifacts.
- Protected files such as deployment workflows, domain config, environment config, generated clients, lockfiles, and infrastructure files.
- Surfaces where agents might wander, such as routing, search, feeds, global layout, shared services, generated data, or config.

### 2. Draft a short candidate AGENTS.md

Use `references/AGENTS.template.md` as the starting point. Keep the file concrete and operational.

Include package manager, validation commands, generated-file boundaries, protected files, scope-control guidance, key project patterns, and multi-file surfaces that must stay consistent.

Avoid long policy documents, vague guidance like "follow best practices", duplicating the README, or language that pretends to enforce security. `AGENTS.md` guides; CI, tests, branch protection, and sandboxing enforce.

### 3. Design benchmark tasks

Use `references/benchmark-prompts.md` for task patterns.

Prefer at least three task shapes:

| Task type | Purpose | Expected signal |
|---|---|---|
| Simple scoped task | Confirms baseline competence | Often neutral |
| Multi-file task | Tests convention discovery | Missed files, smaller diffs, or fewer unnecessary edits |
| Messy cross-surface task | Tests scope control | Best chance to reveal AGENTS.md value |

Messy tasks should be realistic and safe. They should tempt over-editing without requiring credentials, network side effects, deployment, or destructive operations.

### 4. Create experiment conditions

Create two equivalent local copies:

- `baseline`: no candidate `AGENTS.md`, or existing `AGENTS.md` removed from the agent-visible path.
- `treatment`: same starting point with the candidate `AGENTS.md`.

Prefer creating benchmark copies from git-tracked files or a clean clone/archive. Avoid copying dependency folders, build output, caches, `.git` history, and ignored files unless they are required for the trial.

Use the same starting commit or file snapshot for both conditions. Initialize fresh local git repositories inside the copies so diffs can be measured cleanly.

Do not run trials in the user's source repository.

### 5. Run trials

For each task, use the same agent, prompt, starting state, timeout, and collection method for both conditions.

Prefer at least five runs per condition. If only one run is possible, label the result as a signal, not proof.

### 6. Collect metrics

Use `references/report-template.md` for the final report structure.

Collect:

- Changed files, including both tracked and untracked files.
- Diff size.
- Commands run.
- Validation result.
- Protected files touched.
- Generated or ignored files touched.
- Whether the agent stayed scoped.
- Whether the agent wandered into unrelated surfaces.
- Whether the agent ran unnecessary commands.
- Whether the agent missed expected files.
- Token, cost, credit, or wall-time metrics when available.

Always include untracked files in changed-file counts and reports. Use both `git diff --name-only` and `git ls-files --others --exclude-standard`.

If validation commands cannot run because tooling is unavailable in the agent environment, record that as an environment limitation. Do not treat it as a code failure. Run lightweight checks such as `git diff --check` when available.

### 7. Analyze honestly

Use medians when multiple runs exist.

Report positive signals, neutral results, negative results, inconclusive results, and outliers. Do not claim `AGENTS.md` helped if both conditions behaved the same.

### 8. Produce outputs

Default to private outputs:

- Candidate `AGENTS.md`.
- Benchmark prompts.
- Internal report.
- Results table.
- Recommended `AGENTS.md` changes.

For public outputs, summarize behavior and metrics without exposing private code, repository names, raw diffs, local paths, or transcripts.

## Decision guidance

Recommend adopting or revising `AGENTS.md` when it reduces wandering, over-editing, unnecessary commands, protected-file touches, missed validation commands, convention mismatches, or inconsistent multi-file updates.

Recommend more trials when only one run exists, both conditions behave similarly, the task was too easy, or the result depends on an ambiguous interpretation.

Never claim enforcement. `AGENTS.md` is guidance. CI, tests, branch protection, and sandboxing enforce.
