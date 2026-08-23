# Quick Start Checklist

Print this page and check off items as you go through your benchmark.

If the repository runner is available, start from `examples/fixture-experiment.json`, validate it, inspect the plan, and use the generated `results.json` for the trial tables below.

## Pre-flight (5 min)

- [ ] Repository path confirmed: `_________________`
- [ ] Privacy level decided: `private` / `internal` / `public`
- [ ] Repo builds and tests pass using its own commands: `<install-command>`, `<test-command>`, `<build-command>`

## Phase 1: Inspect the repository (15 min)

- [ ] Package manager identified: `_________________`
- [ ] Install command: `_________________`
- [ ] Lint command: `_________________`
- [ ] Test command: `_________________`
- [ ] Build command: `_________________`
- [ ] Generated files identified: `_________________`
- [ ] Protected files identified: `_________________`
- [ ] Wandering surfaces identified (routing, search, feeds, etc.):
  - [ ] `_________________`
  - [ ] `_________________`
  - [ ] `_________________`

## Phase 2: Draft AGENTS.md candidate (15 min)

- [ ] Copied `AGENTS.template.md`
- [ ] Filled in package manager and commands
- [ ] Filled in generated-file patterns
- [ ] Filled in protected-file patterns
- [ ] Added 1-2 repo-specific patterns
- [ ] Validated: fits on 1 page
- [ ] Validated: no vague guidance, no duplicated README content
- [ ] Saved to: `/tmp/agents-md-candidate.md`

## Phase 3: Design benchmark tasks (30 min)

**Task 1: Simple scoped task**
- [ ] Designed (see `task-design-guide.md`)
- [ ] Task description: `_________________`
- [ ] Expected files: `_________________`

**Task 2: Multi-file task**
- [ ] Designed
- [ ] Task description: `_________________`
- [ ] Expected files: `_________________`

**Task 3: Messy cross-surface task**
- [ ] Designed
- [ ] Task description: `_________________`
- [ ] Protected surfaces: `_________________`
- [ ] Expected to tempt wandering into: `_________________`

**Task 4 (optional): Guardrail-sensitive task**
- [ ] Designed
- [ ] Task description: `_________________`

## Phase 4: Create experiment conditions (10 min)

- [ ] Manifest validates: `node ./bin/agents-md-benchmark.mjs validate <manifest>`
- [ ] Trial matrix reviewed: `node ./bin/agents-md-benchmark.mjs plan <manifest>`

**Baseline setup**
- [ ] Created `/tmp/benchmark-baseline`
- [ ] Removed `AGENTS.md`
- [ ] Git initialized: `git init && git add . && git commit -m "baseline"`
- [ ] Verified no `AGENTS.md` visible

**Treatment setup**
- [ ] Created `/tmp/benchmark-treatment`
- [ ] Created `AGENTS.md` with candidate
- [ ] Git initialized: `git init && git add . && git commit -m "treatment"`
- [ ] Verified `AGENTS.md` visible
- [ ] Both directories have same file count

## Phase 5: Run trials (varies by task)

The tables below show two rows per condition to keep the page printable. Prefer at least five runs per condition and add rows to match. With fewer than five, label the result an early signal rather than proof.

**Task 1 - Simple scoped task**

| Trial | Condition | Files changed | Diff size | Validation | Protected touched | Notes |
|---|---|---|---|---|---|---|
| 1 | Baseline | _ | _ | pass/fail | yes/no | |
| 2 | Baseline | _ | _ | pass/fail | yes/no | |
| 3 | Treatment | _ | _ | pass/fail | yes/no | |
| 4 | Treatment | _ | _ | pass/fail | yes/no | |

**Task 2 - Multi-file task**

| Trial | Condition | Files changed | Diff size | Validation | Protected touched | Notes |
|---|---|---|---|---|---|---|
| 1 | Baseline | _ | _ | pass/fail | yes/no | |
| 2 | Baseline | _ | _ | pass/fail | yes/no | |
| 3 | Treatment | _ | _ | pass/fail | yes/no | |
| 4 | Treatment | _ | _ | pass/fail | yes/no | |

**Task 3 - Messy cross-surface task**

| Trial | Condition | Files changed | Diff size | Validation | Protected touched | Scope adherence | Notes |
|---|---|---|---|---|---|---|---|
| 1 | Baseline | _ | _ | pass/fail | yes/no | scoped/wandered | |
| 2 | Baseline | _ | _ | pass/fail | yes/no | scoped/wandered | |
| 3 | Treatment | _ | _ | pass/fail | yes/no | scoped/wandered | |
| 4 | Treatment | _ | _ | pass/fail | yes/no | scoped/wandered | |

## Phase 6: Analyze (15 min)

**Task 1: Simple scoped**
- [ ] Baseline median files changed: `_____`
- [ ] Treatment median files changed: `_____`
- [ ] Result: `neutral` / `positive` / `inconclusive`

**Task 2: Multi-file**
- [ ] Baseline median files changed: `_____`
- [ ] Treatment median files changed: `_____`
- [ ] Result: `neutral` / `positive` / `inconclusive`

**Task 3: Messy cross-surface** (most important)
- [ ] Baseline median files changed: `_____`
- [ ] Treatment median files changed: `_____`
- [ ] Baseline wandered into: `_________________`
- [ ] Treatment scope adherence: `yes/no`
- [ ] Result: `neutral` / `positive` / `inconclusive`

**Overall pattern:**
- [ ] Positive: treatment consistently smaller/fewer issues
- [ ] Neutral: baseline and treatment similar
- [ ] Negative: treatment consistently worse
- [ ] Inconclusive: high variance, limited runs, or mixed signals

## Phase 7: Produce report (30 min)

**Private report**
- [ ] Saved to: `private-artifacts/benchmark-<repo-name>-<date>/` (gitignored)
- [ ] Filled in `report-template.md`
- [ ] Included all metrics, findings, and recommendations
- [ ] Recommended AGENTS.md changes

**Public summary (if sharing)**
- [ ] Sanitized repository name
- [ ] Removed file paths, code snippets
- [ ] Removed secrets, credentials, URLs
- [ ] Described behavior patterns, not code
- [ ] Checked sanitization checklist

## Decision

- [ ] Adopt `AGENTS.md` (positive signals on messy tasks)
- [ ] Refine `AGENTS.md` (treatments wandered into X; add to protected list)
- [ ] Skip `AGENTS.md` (neutral results; not needed)
- [ ] Run more trials (inconclusive; need more data)

## Sign-off

- Experimenter: `_________________`
- Repository: `_________________`
- Date: `_________________`
- Privacy level: `private` / `internal` / `public`

---

**Time estimate:** 2-3 hours for 2 runs per condition per task on a simple repo. Budget roughly double that for the preferred 5 runs per condition, and longer for larger repos or complex tasks.

**Need help?** See `task-design-guide.md` for task examples or `failure-modes.md` for troubleshooting.
