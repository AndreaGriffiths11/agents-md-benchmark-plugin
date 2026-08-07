# Sanitized example summary

This example is intentionally generic. It describes the kind of signal a benchmark can produce without exposing private repository details.

## Setup

- Repository: `sample-web-app`
- Task: Add a content-derived field to list pages, detail pages, and search results.
- Conditions:
  - Baseline: no candidate `AGENTS.md`
  - Treatment: candidate `AGENTS.md` visible
- Runs shown: one baseline and one treatment comparison

## Result summary

| Condition | Files changed | Scope behavior | Protected files touched |
|---|---:|---|---|
| Baseline | 7 | Expanded into an adjacent interactive feature that was not required | No |
| Treatment | 6 | Stayed within content, list, detail, search UI, and metadata surfaces | No |

## Finding

The simple tasks in this benchmark were neutral: both baseline and treatment made the same focused changes. The messier cross-surface task produced a useful signal. The treatment run stayed closer to the intended scope, while the baseline run changed one extra adjacent behavior.

This does not prove `AGENTS.md` always improves agent behavior. It shows why benchmark tasks should include realistic ambiguity and why results should be reported honestly.

## Public-safe takeaway

`AGENTS.md` may have the most measurable value on tasks where agents can plausibly wander across adjacent files, commands, generated output, or protected configuration. Simple local tasks may show no difference.

