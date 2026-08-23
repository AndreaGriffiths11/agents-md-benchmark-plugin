# Sanitized benchmark summary — VS Code extension

## Setup

- Repository type: VS Code extension (TypeScript, webpack, webview UI)
- Agent: Claude Sonnet 4.6 (same model both conditions)
- Runs per condition: 1 (directional signal only)
- Date: 2026-08-23

## Experiment conditions

| Condition | Agent-visible instructions |
|---|---|
| Baseline | No AGENTS.md |
| Treatment | AGENTS.md with runtime guardrails section |

## Tasks

| # | Type | Description |
|---|---|---|
| 1 | Simple scoped | Add one entry to a deterministic detection list following an existing pattern |
| 2 | Multi-file | Wire a new boolean config setting end-to-end across package.json, service layer, and UI |
| 3 | Guardrail | "Improve the visual appearance of the contributor cards — make them more polished and modern" |

Task 3 is a trap: the AGENTS.md explicitly forbids inline styles because the webview runs under a strict Content Security Policy. Inline styles compile cleanly and break silently at runtime.

## Results

| Task | Baseline | Treatment | Signal |
|---|---|---|---|
| 1 — Bot detection | 5-line insertion, correct file | Identical | Neutral |
| 2 — Config setting | 3 files, compiles, correct scope | Identical | Neutral |
| 3 — CSP guardrail | **17 inline `style=""` attributes** | **0 inline styles, CSS classes only** | **Positive** |

## Key finding

Tasks 1 and 2 were neutral. The codebase was small enough that the correct answer was self-evident without guidance. Simple and multi-file tasks are useful for establishing baseline competence but rarely show a behavioral difference.

Task 3 showed clean divergence:

- **Baseline**: agent took the natural fast path — embedded inline styles directly on HTML elements. Compiled and linted clean. Would fail silently at runtime because the webview's Content Security Policy blocks inline styles.
- **Treatment**: agent read the CSP warning in AGENTS.md, recognised the constraint, and used CSS class additions instead. Runtime-safe.

The constraint that produced the difference is invisible from the code. There is no linter rule, no TypeScript error, no test failure. The only place it existed was in AGENTS.md.

## What this suggests about AGENTS.md effectiveness

AGENTS.md is most useful when it captures **runtime-invisible constraints** — things that:
- Compile and lint cleanly
- Break silently at runtime or in production
- Are not derivable from reading the source code

In this repo, two constraints fit that description:
1. No inline styles in the webview (CSP)
2. ESM-only SDK must use `webpackIgnore` dynamic import (not webpack externals)

The rest of the AGENTS.md (architecture overview, feature list, commands) is useful orientation but did not produce a measurable behavioral difference.

## Recommended AGENTS.md pattern from this run

Put runtime-invisible constraints **first**, before architecture and feature descriptions. Use explicit ✅/❌ examples. Name the failure mode, not just the rule.

Before:
```
- Don't use inline styles in webview — CSP blocks them
```

After:
```
### Webview: No inline styles (CSP)
The webview runs under a strict Content Security Policy.
Inline `style="..."` attributes are blocked at runtime even though they compile fine.
✅ Add CSS classes and rules to the stylesheet
❌ Do not use `style="..."` on any HTML element in the webview
```

## Limits

- Single run per condition. Treat as signal, not proof.
- Validation unavailable for Tasks 1 and 2 (node_modules not present in condition copies; see benchmark-prompts.md for setup guidance).
- One agent and one model tested. Results may differ with other agents.
- Sanitized: no repository names, private paths, raw diffs, or source code.
