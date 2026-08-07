# AGENTS.md Benchmark Plugin

Private working repository for the AGENTS.md Benchmark Agent Plugin.

This repository contains a portable Agent Plugins package for measuring whether `AGENTS.md` changes coding-agent behavior in a repository.

## Privacy boundary

Do not add raw experiment artifacts from private repositories. Reports, examples, prompts, and screenshots must be sanitized before they land here.

Sanitized means:

- No private repository names, paths, owners, domains, customer names, or internal project names.
- No source code copied from private repositories.
- No raw diffs from private repositories.
- No private logs, tokens, emails, chat content, calendar details, or local filesystem paths.
- No full benchmark transcripts unless they were produced against a public demo repository.

Use generic labels such as `sample-web-app`, `baseline`, `treatment`, `protected config`, or `generated output`.

## Contents

- `plugin.json` - Agent Plugins manifest.
- `skills/agents-md-benchmark/SKILL.md` - portable Agent Skill instructions.
- `skills/agents-md-benchmark/references/AGENTS.template.md` - starter AGENTS.md for benchmark treatment runs.
- `skills/agents-md-benchmark/references/benchmark-prompts.md` - reusable benchmark prompt patterns.
- `skills/agents-md-benchmark/references/report-template.md` - private/internal benchmark report template.
- `skills/agents-md-benchmark/references/sanitized-summary.md` - safe example summary based on generic experiment patterns.

## Distribution plan

1. Keep this repository private while the skill is refined.
2. Use sanitized examples only.
3. After review, publish the Agent Plugin package or copy `skills/agents-md-benchmark/SKILL.md` into the public skills directory.
4. Publish references only if they contain no repo-specific details.
