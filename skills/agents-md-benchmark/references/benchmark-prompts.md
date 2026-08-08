# Benchmark prompt templates

Use these as starting points. Replace placeholders with repo-specific details before running trials. Do not publish filled-in prompts from private repositories unless sanitized.

Before running prompts, create matched baseline and treatment copies from the same clean snapshot. Prefer git-tracked files or a clean clone/archive so dependency folders, build output, caches, `.git` history, and ignored files do not distort setup time or diffs.

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

## Trial execution prompt wrapper

Use the same wrapper for each condition, changing only the repository path and whether `AGENTS.md` is present:

```text
You are running a private local benchmark trial in the repository copy at <repo-copy-path>. Do not publish, push, commit, message anyone, or touch any path outside this repository copy.

Task: <benchmark-task>

Make only the changes needed for that behavior. Use existing repo patterns. Run the appropriate validation command if available. If validation tooling is unavailable in this environment, record that as an environment limitation and run `git diff --check` if possible.

At the end, report: files changed, including untracked files; commands run; whether validation passed, failed, or was unavailable; protected files touched; generated or ignored files touched; and any notable scope behavior.
```
