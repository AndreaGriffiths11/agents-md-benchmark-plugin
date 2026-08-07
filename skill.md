---
name: agents-md-benchmark
description: "Design and run reproducible before/after experiments that measure whether AGENTS.md changes coding-agent behavior in a repository. Use when the user asks to benchmark AGENTS.md, test agent instructions, compare behavior with and without repo guidance, improve AGENTS.md from observed mistakes, or produce an AAIF-ready contribution around AGENTS.md measurement. NOT for: benchmarking model quality generally, publishing private repository data, running destructive experiments, or replacing CI/security enforcement."
---

# AGENTS.md Benchmark

Help users measure whether `AGENTS.md` changes coding-agent behavior on a real repository.

The goal is not to prove `AGENTS.md` always helps. The goal is to run controlled, repeatable before/after experiments and report what actually happened: positive, neutral, negative, or inconclusive.

## Critical first steps

Before running any benchmark:

1. Confirm the target repository.
2. Confirm the privacy level of the repository and results.
3. Check whether the worktree is clean or intentionally dirty.
4. Keep experiment copies local unless the user explicitly asks to publish.
5. Do not commit, push, open PRs, or share artifacts without explicit user approval.

If the repository is private or contains sensitive code, keep raw outputs private and produce only sanitized summaries for external sharing.

## Privacy rules

Never put private repository details into public artifacts.

Do not publish:

- Private repository names, owners, domains, paths, or organization names.
- Raw diffs from private repositories.
- Source code copied from private repositories.
- Agent transcripts that include private code or paths.
- Secrets, tokens, credentials, logs, emails, chats, calendar data, or customer data.
- Local filesystem paths.

For public examples, use generic names:

- `sample-web-app`
- `baseline`
- `treatment`
- `generated output`
- `protected config`
- `agent-visible instructions`

## Core workflow

### 1. Inspect the repository

Identify:

- Package manager and lockfiles.
- Build, lint, test, typecheck, and preview commands.
- Existing guidance files: `AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md`, `CONTRIBUTING.md`, README files, or agent prompts.
- Generated files and build output.
- Protected files such as deployment workflows, domain config, environment config, generated clients, lockfiles, and infrastructure files.
- Places where agents might wander: routing, search, RSS/feed generation, global layout, shared services, generated data, or config.

### 2. Draft a short AGENTS.md candidate

Keep it concrete and operational.

Include:

- Package manager and install command.
- Validation commands.
- Generated-file boundaries.
- Protected files.
- Scope control instruction.
- Key project patterns.
- Any multi-file surfaces that must stay consistent.

Avoid:

- Long policy documents.
- Vague guidance like "follow best practices."
- Duplicating the README.
- Instructions that pretend to enforce security. CI and branch protection enforce; `AGENTS.md` guides.

### 3. Design benchmark tasks

Use at least three task shapes:

| Task type | Purpose | Good signal |
|---|---|---|
| Simple scoped task | Confirms baseline competence | Usually neutral |
| Multi-file task | Tests convention discovery | May show smaller diffs or fewer missed files |
| Messy cross-surface task | Tests scope control | Best chance to reveal AGENTS.md value |

Messy tasks should be realistic and safe. They should tempt over-editing without requiring credentials, network side effects, deployment, or destructive operations.

Good messy surfaces include:

- Search plus indexing plus UI display.
- Blog/content metadata plus pages plus generated JSON.
- Command registration plus help text plus service handler.
- Route metadata plus sitemap/feed implications.
- Generated files that should not be touched.

### 4. Create experiment conditions

Create two equivalent local copies:

- `baseline`: no `AGENTS.md`, or existing `AGENTS.md` removed from the agent-visible path.
- `treatment`: same starting point with the candidate `AGENTS.md`.

Use the same starting commit or file snapshot. Initialize local git repositories inside the copies so diffs can be measured cleanly.

Do not run trials in the user's source repository.

### 5. Run trials

For each task:

- Use the same agent.
- Use the same prompt.
- Use the same starting state.
- Use the same timeout.
- Collect the same metrics.

Prefer at least five runs per condition. If only one run is possible, label the result as a signal, not proof.

### 6. Collect metrics

Collect:

- Files changed.
- Diff size.
- Commands run.
- Validation result.
- Protected files touched.
- Generated files touched.
- Whether the agent stayed scoped.
- Whether the agent wandered into unrelated surfaces.
- Whether the agent ran unnecessary commands.
- Whether the agent missed expected files.
- Token, cost, credit, or wall-time metrics when available.

### 7. Analyze honestly

Use medians when multiple runs exist.

Report:

- Positive signals.
- Neutral results.
- Negative results.
- Inconclusive results.
- Outliers and tail behavior.

Do not claim AGENTS.md helped if both conditions behaved the same. Neutral results are useful.

### 8. Produce outputs

Default to private outputs:

- Candidate `AGENTS.md`.
- Benchmark prompts.
- Internal report.
- Results table.
- Recommended AGENTS.md changes.

For public outputs, sanitize aggressively and summarize behavior without exposing private code or repository details.

## AGENTS.md starter

Use this as a starting point, then adapt it to the repository:

```markdown
# Repository instructions for coding agents

- Use <package-manager> for dependency management. Do not switch package managers.
- Install dependencies with `<install-command>` when needed.
- Run `<lint-command>` after source changes.
- Run `<test-command>` after behavior changes.
- Run `<build-command>` after routing, content, config, or generated-data changes.
- Keep changes scoped to the requested task. Do not refactor unrelated code.
- Do not edit generated files such as `<generated-paths>`.
- Do not modify protected configuration files such as `<protected-files>` unless explicitly asked.
- Follow existing patterns in `<important-paths>` before adding new helpers or conventions.
- If a task crosses multiple surfaces, keep related UI, service, and generated metadata behavior consistent.
```

## Benchmark prompt patterns

### Simple scoped task

```text
Add a small feature that follows an obvious existing pattern. Keep the change scoped and run the appropriate validation.
```

Expected result: often neutral. Both baseline and treatment may perform well.

### Multi-file task

```text
Wire a small behavior across the existing UI and service layers. Keep existing behavior and styling otherwise.
```

Expected result: may reveal missed files, unnecessary styling changes, or inconsistent metadata updates.

### Messy cross-surface task

```text
Add a small content-derived feature that appears in list pages, detail pages, and search results. Calculate it from source content. Keep draft filtering intact. Do not change feeds, routing, deployment config, generated output, or unrelated layout/styling.
```

Expected result: best chance to reveal scope control differences.

## Report template

Use this structure:

```markdown
# AGENTS.md Benchmark Report

## Setup

- Repository: <sanitized name>
- Agent/tool: <agent>
- Runs per condition: <n>
- Task: <task summary>

## Result summary

| Condition | Files changed | Diff size | Validation | Protected files touched | Scope notes |
|---|---:|---:|---|---|---|
| Baseline | <n> | <size> | <result> | <yes/no> | <notes> |
| Treatment | <n> | <size> | <result> | <yes/no> | <notes> |

## Findings

- <finding>
- <finding>

## Recommended AGENTS.md changes

- <change>
- <change>

## Limits

- <limit>
```

## Decision guidance

Recommend adopting or revising `AGENTS.md` when it reduces:

- Wandering.
- Over-editing.
- Unnecessary commands.
- Protected-file touches.
- Missed validation commands.
- Convention mismatches.
- Inconsistent multi-file updates.

Recommend more trials when:

- Only one run exists.
- Both conditions behave similarly.
- The task was too easy.
- The result depends on an ambiguous interpretation.

Never claim enforcement. `AGENTS.md` is guidance. CI, tests, branch protection, and sandboxing enforce.

