# AGENTS.md Benchmark Report

## Setup

- Repository: `<sanitized-repo-name>`
- Agent/tool: `<agent-or-tool>`
- Runs per condition: `<n>`
- Task: `<task summary>`
- Date: `<date or omit for public sharing>`
- Experiment manifest: `<private path or identifier>`
- Results schema version: `<version>`

## Experiment conditions

| Condition | Agent-visible instructions | Notes |
|---|---|---|
| Baseline | No candidate AGENTS.md | Same starting snapshot |
| Treatment | Candidate AGENTS.md visible | Same starting snapshot |

## Result summary

| Condition | Changed files including untracked | Diff size | Commands run | Validation | Protected files touched | Generated/ignored files touched | Scope notes |
|---|---:|---:|---|---|---|---|---|
| Baseline | `<n>` | `<size>` | `<commands>` | `<result>` | `<yes/no>` | `<yes/no>` | `<notes>` |
| Treatment | `<n>` | `<size>` | `<commands>` | `<result>` | `<yes/no>` | `<yes/no>` | `<notes>` |

## Expected files

- `<file-or-area>`
- `<file-or-area>`

## Protected files

- `<protected-file-or-pattern>`
- `<protected-file-or-pattern>`

## Changed files

List both tracked and untracked files. Suggested commands:

```bash
git diff --name-only
git ls-files --others --exclude-standard
git diff --stat
git diff --numstat
```

## Validation notes

If a validation command could not run because tooling was unavailable, record it as an environment limitation rather than a code failure. Include any fallback checks such as `git diff --check`.

## Findings

- `<finding>`
- `<finding>`

## Recommended AGENTS.md changes

- `<change>`
- `<change>`

## Limits

- `<limit>`

## Machine-readable artifacts

- `results.json`: canonical trial metrics and process outcomes.
- `summary.md`: generated median/rate comparison.
- `logs/`: bounded stdout and stderr for private diagnosis.
- `<limit>`

## Sanitization checklist

- [ ] No private repository names.
- [ ] No private paths.
- [ ] No raw private diffs.
- [ ] No copied private source code.
- [ ] No secrets or tokens.
- [ ] No customer, employee, email, chat, calendar, or domain details.
