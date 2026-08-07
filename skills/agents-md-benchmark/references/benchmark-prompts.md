# Benchmark prompt templates

Use these as starting points. Replace placeholders with repo-specific details before running trials. Do not publish filled-in prompts from private repositories unless sanitized.

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

