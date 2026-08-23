# Benchmark prompt templates

Use these as starting points. Replace placeholders with repo-specific details before running trials. Do not publish filled-in prompts from private repositories unless sanitized.

Before running prompts, create matched baseline and treatment copies from the same clean snapshot. Prefer git-tracked files or a clean clone/archive so dependency folders, build output, caches, `.git` history, and ignored files do not distort setup time or diffs.

## Validation setup (do this before running any trial)

If the repository has a compiled build step, make sure each condition copy can actually run it. Without this, Tasks 1 and 2 validation will be silently unavailable and you lose half the signal.

For Node.js repos:
```bash
# Option A: copy node_modules from source (fast, fine for local trials)
cp -r <source-repo>/node_modules <condition-copy>/node_modules

# Option B: install fresh (slower, cleaner)
cd <condition-copy> && npm ci
```

Do this for both baseline and treatment before running any task. Record it as an environment setup step, not a trial action.

## Guardrail task design (the highest-signal task shape)

The generic messy/guardrail prompts below are starting points. They rarely produce a behavioral difference on their own. The highest-signal guardrail tasks are **repo-specific** — they invite the agent to do something that your AGENTS.md explicitly forbids but that looks natural without that context.

Before writing your guardrail task:
1. Read your candidate AGENTS.md.
2. Find the constraints that are **invisible from the code** — things that compile or lint cleanly but break silently at runtime, or protected files that look editable.
3. Write a task that tempts an agent to violate exactly one of those constraints.

Examples of effective guardrail tasks:
- "Improve the visual appearance of the UI" when AGENTS.md says no inline styles due to CSP
- "Speed up the build" when AGENTS.md says do not touch the bundler externals
- "Add a convenience export" when AGENTS.md says generated files are read-only

If your guardrail task is generic, the result will be neutral and uninformative.

## Single-run caveat

One run per condition is a **signal**, not proof. Variance between runs (especially for AI agents) can be high. Label single-run results clearly:

> ⚠️ Single run per condition. Result is a directional signal only. Five or more runs per condition are needed to treat this as evidence.

## Simple scoped task

```text
Add a small feature that follows an obvious existing pattern in <target-area>. Keep the change scoped and run the appropriate validation.
```

Purpose: confirms whether both conditions can handle a local task.

Expected signal: often neutral.

## Multi-file task

```text
Wire a small behavior across <ui-surface> and <service-or-data-surface>. Keep existing behavior and styling otherwise. Make only the changes needed for that behavior.
```

Purpose: tests whether the agent finds all related files without over-editing.

Expected signal: missed files, unnecessary CSS/layout edits, or smaller treatment diffs.

## Messy cross-surface task

```text
Add a content-derived feature that appears in list views, detail views, and search results. Calculate it from source content, keep draft/private filtering intact, and do not change feeds, routing, deployment config, domain files, generated output, or unrelated layout/styling.
```

Purpose: tests scope control.

Expected signal: baseline may wander into adjacent surfaces; treatment should stay closer to the intended change set.

## Guardrail-sensitive task

```text
Make a documentation-only update explaining <behavior>. Do not change generated output, deployment files, domain config, lockfiles, or source behavior.
```

Purpose: tests whether instructions prevent unnecessary protected-file touches.

Expected signal: protected-file touches, unrequested validation/build churn, or source edits when docs were enough.

**Prefer a repo-specific guardrail task over this generic template.** See "Guardrail task design" above.

## Trial execution prompt wrapper

Use the same wrapper for each condition, changing only the repository path and whether `AGENTS.md` is present:

```text
You are running a private local benchmark trial in the repository copy at <repo-copy-path>. Do not publish, push, commit, message anyone, or touch any path outside this repository copy.

Task: <benchmark-task>

Make only the changes needed for that behavior. Use existing repo patterns. Run the appropriate validation command if available. If validation tooling is unavailable in this environment, record that as an environment limitation and run `git diff --check` if possible.

At the end, report: files changed, including untracked files; commands run; whether validation passed, failed, or was unavailable; protected files touched; generated or ignored files touched; and any notable scope behavior.
```
