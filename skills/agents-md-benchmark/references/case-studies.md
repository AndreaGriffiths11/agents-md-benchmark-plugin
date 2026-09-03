# Sanitized result patterns

These compact examples show how to report different outcomes without forcing every experiment into a success story.

## Positive: runtime-invisible guardrail

**Setup:** Five runs per condition on a UI task. The candidate instructions prohibit a technique that compiles but fails under the runtime security policy.

**Result:** Baseline violated the guardrail in four of five runs. Treatment violated it in zero of five runs. Validation passed in all treatment runs.

**Interpretation:** Positive evidence for retaining the specific runtime warning. Do not infer that unrelated architecture prose also helped.

## Neutral: obvious local pattern

**Setup:** Five runs per condition adding one entry to an existing deterministic mapping.

**Result:** Both conditions changed the same file, produced equivalent diffs, and passed validation in every run.

**Interpretation:** Neutral. The source pattern already supplied enough guidance. Keep this task as a competence check, but do not use it to justify `AGENTS.md`.

## Negative: over-constrained instructions

**Setup:** Five runs per condition for a multi-file configuration feature. The candidate instructions broadly said not to modify configuration files.

**Result:** Baseline completed four of five runs. Treatment refused or produced an incomplete implementation in three of five runs.

**Interpretation:** Negative evidence. Replace the broad prohibition with a precise rule naming which configuration files are generated or protected and when edits are allowed.

## Inconclusive: high variance

**Setup:** Two runs per condition on an ambiguous cross-surface task.

**Result:** File counts and validation outcomes varied more within each condition than between conditions.

**Interpretation:** Inconclusive. Clarify the task, increase the run count, and report the original result rather than silently discarding it.
