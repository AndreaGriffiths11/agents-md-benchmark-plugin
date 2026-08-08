# AGENTS.md Benchmark Plugin

A portable Agent Plugin for measuring whether `AGENTS.md` changes coding-agent behavior in a repository.

This plugin helps maintainers run controlled before/after experiments: one condition without `AGENTS.md`, one condition with a candidate `AGENTS.md`, both using the same task prompt and starting state. The goal is to collect evidence about agent behavior instead of assuming repo instructions help.

## What this plugin does

- Inspects a repository for build commands, test commands, conventions, generated files, and protected files.
- Helps draft a short, concrete candidate `AGENTS.md`.
- Designs benchmark tasks that test scoped edits, multi-file changes, and messy cross-surface work.
- Guides creation of local baseline and treatment repo copies.
- Compares agent behavior across conditions.
- Produces a private report with files changed, diff size, validation commands, scope creep, and protected-file touches.

The plugin reports neutral and inconclusive results honestly. It should not claim `AGENTS.md` helped when both conditions behaved the same.

## Why this exists

`AGENTS.md` is useful only if it changes what agents do in practice. Simple tasks may not show a difference because the right change is obvious. Messier tasks are more revealing: they can show whether repo instructions reduce wandering, over-editing, unnecessary commands, or edits to protected surfaces.

This plugin turns that measurement workflow into a reusable skill.

## Package layout

```text
agents-md-benchmark-plugin/
|-- plugin.json
|-- skills/
|   `-- agents-md-benchmark/
|       |-- SKILL.md
|       `-- references/
|           |-- AGENTS.template.md
|           |-- benchmark-prompts.md
|           |-- report-template.md
|           `-- sanitized-summary.md
|-- LICENSE
`-- README.md
```

## Using the skill

Load this plugin in an Agent Plugins-compatible client, then ask for the `agents-md-benchmark` skill when you want to test `AGENTS.md` impact.

Example request:

```text
Use the agents-md-benchmark skill to design a private before/after experiment for this repository.
```

The skill will guide the agent to:

1. Inspect the repo.
2. Draft or refine a candidate `AGENTS.md`.
3. Design benchmark prompts.
4. Create local baseline and treatment copies.
5. Run matching agent trials.
6. Compare results.
7. Produce a private report.

## References included

| File | Purpose |
|---|---|
| `skills/agents-md-benchmark/SKILL.md` | Main portable skill instructions |
| `skills/agents-md-benchmark/references/AGENTS.template.md` | Starter `AGENTS.md` template |
| `skills/agents-md-benchmark/references/benchmark-prompts.md` | Prompt patterns for benchmark tasks |
| `skills/agents-md-benchmark/references/report-template.md` | Report structure for private/internal results |
| `skills/agents-md-benchmark/references/sanitized-summary.md` | Public-safe example summary pattern |

## Privacy and sanitization

Do not publish raw benchmark artifacts from private repositories.

Before anything from an experiment lands in this repository or a public skills catalog, remove:

- Private repository names, owners, paths, domains, and organization names.
- Source code copied from private repositories.
- Raw diffs from private repositories.
- Agent transcripts that include private code or local paths.
- Secrets, tokens, credentials, logs, emails, chats, calendar data, or customer data.
- Full benchmark transcripts unless they were produced against a public demo repository.

Use generic labels such as `sample-web-app`, `baseline`, `treatment`, `protected config`, and `generated output`.

## More skills

This repository is the shareable Agent Plugin package for the skill.

For more skills by me, visit `mainbranch.dev/skills/`.

Keep private benchmark artifacts out of shared materials. Only share sanitized examples, templates, and documentation.

## License

MIT
