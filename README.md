# AGENTS.md Benchmark Skill

Private working repository for the AGENTS.md Benchmark skill.

This repository contains the publishable skill instructions, templates, and sanitized examples for measuring whether `AGENTS.md` changes coding-agent behavior in a repository.

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

- `skill.md` - publishable Main Branch skill file.
- `templates/AGENTS.template.md` - starter AGENTS.md for benchmark treatment runs.
- `templates/benchmark-prompts.md` - reusable benchmark prompt patterns.
- `templates/report-template.md` - private/internal benchmark report template.
- `examples/sanitized-summary.md` - safe example summary based on generic experiment patterns.

## Distribution plan

1. Keep this repository private while the skill is refined.
2. Use sanitized examples only.
3. After review, copy or adapt `skill.md` into the public skills directory.
4. Publish templates only if they contain no repo-specific details.

