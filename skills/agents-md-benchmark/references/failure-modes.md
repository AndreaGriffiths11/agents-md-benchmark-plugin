# Handling Failure Modes and Inconclusive Results

This guide helps you diagnose and respond to common problems during benchmarking.

## Before you start: Prevention

### Setup checklist (reduces future failures)

- [ ] Repo passes its own validation commands (`<install-command>`, `<test-command>`, `<build-command>`) cleanly.
- [ ] Baseline and treatment copies are truly identical except for `AGENTS.md`.
- [ ] Both copies initialize fresh git repos (no inherited history that might confuse diffs).
- [ ] AGENTS.md candidate is concise and uses repo-specific command names.
- [ ] Benchmark tasks are phrased consistently (same prompt length and detail level for baseline and treatment).

---

## Failure modes and recovery

### Both conditions error or timeout consistently

**Symptom:** First trial of baseline and treatment both error or timeout on the same task.

**Root causes:**
1. **Repo issue:** Build fails, test suite has problems, or dependencies are missing.
2. **Task is too complex:** The feature genuinely requires 30+ minute implementation.
3. **Task is too vague:** Agent doesn't understand where to start and explores randomly.
4. **Timeout is too short:** 10 minutes is not enough for this repo's build time.

**Diagnosis steps:**
1. Manually try the task yourself (takes 5 minutes? 20 minutes?).
2. Run the repo's own validation commands in the baseline copy: install, then test, then build.
3. Read agent transcripts: where did it get stuck?

**Recovery:**
- **If repo validation fails:** Fix the repo. This is not an AGENTS.md issue.
- **If task is too complex:** Simplify or redesign. Use simpler tasks earlier in the trial run.
- **If task is too vague:** Add more detail. Reference specific files or patterns the agent should follow.
- **If timeout is too short:** Increase from 10 to 20 minutes. Rerun.
- **After fixing:** Rerun the trial, starting from a clean repo reset: `git reset --hard HEAD`.

**When to abandon the task:** If both conditions fail even after fixing the repo and clarifying the task, the task does not measure AGENTS.md value. Skip it and use a different task.

---

### Treatment runs error more than baseline

**Symptom:** Baseline trials mostly succeed (3/5 pass). Treatment trials mostly fail (1/5 pass).

**Root cause:** The AGENTS.md candidate introduced confusing or contradictory guidance.

**Diagnosis steps:**
1. Read error messages from treatment trials. What did the agent report?
2. Common errors:
   - `"I cannot edit AGENTS.md because it says I should not modify protected files."`
   - `"The instruction contradicts itself: add feature X but don't touch X's dependencies."`
   - `"I don't understand what you mean by 'keep related UI and service behavior consistent.'"`
3. Check AGENTS.md for:
   - Typos in command names (e.g., `npm tst` instead of `npm test`).
   - Contradictions (e.g., "do not edit generated files" but the task requires editing generated output).
   - Vague guidance that sounds like enforcement (e.g., "never refactor" discourages agents).

**Recovery:**
1. Simplify the problematic guidance.
   - **Instead of:** `"Keep related UI, service, and generated metadata behavior consistent without refactoring unrelated code."`
   - **Use:** `"Update both UI and service layers when adding a new field. Do not refactor existing code."`
2. Remove guidance the agent is misinterpreting.
3. Test the revised AGENTS.md: run one trial per condition with the updated file.
4. If treatment still errors, simplify further or revert the guidance and accept that this task does not test AGENTS.md value.

**When to abandon the task:** If errors persist after simplification, the task itself or the repo setup has issues. Skip it.

---

### Only one trial is feasible (no time or cost for more)

**Symptom:** You can only run 1 trial baseline + 1 trial treatment due to time constraints.

**Signal:** Limited data, but still actionable.

**How to report:**
- Label results as: **"Early signal (1 run per condition, not conclusive)."**
- Show the metrics table but note the small sample size.
- Recommend repeating with more runs if findings are surprising.

**When one run is actually useful:**
- If baseline and treatment differ significantly on the messy task (e.g., baseline 8 files, treatment 3 files), that's a strong signal even with one run each.
- If both conditions perform the same, you've confirmed neutrality; more runs would just confirm it again.

**When you should run more trials:**
- If the result is borderline (5 files vs. 6 files difference).
- If you're considering adopting AGENTS.md based on the finding; get more confidence first.

---

### Both conditions perform identically on all tasks

**Symptom:** Median files changed, diff size, and validation success are the same for baseline and treatment across all tasks.

**Signal:** Neutral result. This is useful data.

**Interpretation:**
1. **Tasks were too easy.** Simple patterns are easy to spot; agents don't need AGENTS.md. Retry with messier tasks.
2. **AGENTS.md was redundant.** The repo's README, existing patterns, or code structure already guide agents correctly. AGENTS.md adds nothing.
3. **AGENTS.md genuinely doesn't help.** Valid finding. Not all repos benefit from agent instructions.

**Recovery:**
- **If tasks were too easy:** Redesign with harder messy tasks. Go back to step 3 of the workflow.
- **If AGENTS.md was redundant:** Decide: publish it anyway (helps new team members) or skip it (existing patterns are sufficient).
- **If AGENTS.md doesn't help:** Report honestly. Focus on other improvements (better README, clearer code organization).

**When to declare the experiment done:** After 5+ runs per condition with neutral results across simple, multi-file, and messy tasks, you have strong evidence that AGENTS.md won't help.

---

### Treatment slightly worse than baseline on one task

**Symptom:** One task shows treatment performing worse (e.g., treatment median 8 files, baseline median 5 files).

**Signal:** Not conclusive. One task is not enough to reject AGENTS.md.

**Diagnosis:**
1. Was the task already too narrow (e.g., "change this one line")? Narrow tasks favor baseline because agents have less to expand into.
2. Did AGENTS.md accidentally over-constrain (e.g., "do not touch styling" prevented a necessary style fix)?
3. Did the agent misunderstand a guideline?

**Recovery:**
- [ ] Ignore this one task. Look at the overall trend across 3+ tasks.
- [ ] If you see worse performance on 2+ messy tasks, review AGENTS.md for over-constraints.
- [ ] If it's just one task, re-run or replace it with a different task.

**When to adjust AGENTS.md:** Only if treatment consistently underperforms across multiple tasks on core metrics (validation failures, protected-file touches).

---

### Agent refused to attempt the task

**Symptom:** Agent says: `"I cannot complete this task because it violates safety guidelines or would cause unintended side effects."`

**Root causes:**
1. **Task touches destructive operations.** (e.g., database migration, deleting files).
2. **Task is malformed or dangerous-sounding.** (e.g., "modify production config").
3. **Agent flagged a safety concern in the repo.** (e.g., repo has hardcoded secrets).

**Recovery:**
- [ ] Redesign the task to be clearly safe. Use the benchmark prompt templates.
- [ ] Ensure task does not involve destructive operations, credentials, or external side effects.
- [ ] Ensure repo has no exposed secrets. Clean up if needed.
- [ ] Rerun with a clearer, safer task.

**Example of an unsafe task:** `"Update the .env file with new API keys."`
**Example of a safe task:** `"Add a comment documenting how to configure API keys in the .env file (do not include real keys)."`

---

### Protected-file touch behavior is inconsistent

**Symptom:** Baseline runs touch protected files erratically (0/5, then 3/5 on rerun), making it hard to compare.

**Root cause:** Either the "protected file" list is too vague, or the protected file is not truly protected (agent has a legitimate reason to touch it).

**Diagnosis:**
- [ ] Is the protected file actually involved in the task? (e.g., adding a feature to a route may legitimately require touching package.json if dependencies change).
- [ ] Is the guideline about the file clear enough? (e.g., "do not touch package.json" is less clear than "do not add or upgrade dependencies").

**Recovery:**
- [ ] If the file is legitimately touched sometimes, remove it from the protected list or clarify when it is okay to touch.
- [ ] If the file should never be touched, make the AGENTS.md guidance more explicit.
- [ ] Rerun trials.

---

### Validation fails in both conditions

**Symptom:** Lint, test, or build fails after agent changes in both baseline and treatment.

**Root causes:**
1. **Task is legitimately complex and requires test changes.** (e.g., "add a new feature" means tests need updates).
2. **Repo's test suite is flaky.** Tests pass/fail randomly.
3. **Agent introduced a real bug.**

**Diagnosis:**
- [ ] Can the repo's default tests pass without agent changes? Run `git reset --hard` then the repo's test command.
- [ ] Does the task legitimately require test changes? (Read the task description again.)
- [ ] Does the agent's implementation look correct?

**Recovery:**
- **If tests are required:** Validation "failure" is actually "incomplete implementation." Note this in metrics: "test suite required updates; agent made them correctly" vs. "agent broke tests."
- **If repo tests are flaky:** Fix the test suite before benchmarking. Flakiness masks AGENTS.md effects.
- **If agent introduced a bug:** This is a real signal (both conditions have bugs). Note it and rerun.

**When to report:** Include in metrics. If both conditions fail validation similarly, it is a neutral finding (not an AGENTS.md effect).

---

### High variance within a condition

**Symptom:** Baseline trial 1 changes 3 files, trial 2 changes 8 files, trial 3 changes 5 files. Median is not reliable.

**Root cause:**
1. **Agent is non-deterministic.** Different random choices lead to different implementations.
2. **Task is ambiguous.** Each trial interprets the task differently.
3. **Agent timeouts or errors erratically.**

**Diagnosis:**
- [ ] Are some trials timing out or erroring? (They skew variance.)
- [ ] Read the task and agent transcripts. Is it clear what to change, or are multiple valid interpretations?

**Recovery:**
- [ ] Remove error trials from analysis.
- [ ] Clarify the task to reduce ambiguity.
- [ ] Run more trials (10+ per condition) to find a stable median despite variance.
- [ ] Accept variance as a signal itself: if baseline is more variable than treatment, AGENTS.md may reduce decision complexity.

**When high variance is useful:** If treatment has lower variance than baseline, that's evidence AGENTS.md helps agents converge on a solution.

---

## Decision tree: What to do next

```text
Did both conditions error?
|-- Yes, consistently: repo or task problem. Fix and rerun.
`-- No: continue.

Is treatment error rate above 50%?
|-- Yes: AGENTS.md is confusing. Simplify and rerun.
`-- No: continue.

Do you have 5+ runs per condition?
|-- Yes: jump to analysis. Use medians.
`-- No: run more trials if time and cost allow. Otherwise label as early signal.

Did treatment outperform baseline (smaller medians) on messy tasks?
|-- Yes, consistently: positive signal. Adopt or refine AGENTS.md.
|-- Borderline (under 10% difference): run more trials or call it neutral.
`-- No, baseline better: negative signal. Investigate AGENTS.md over-constraints.

Is variance high in both conditions?
|-- Yes: task is ambiguous. Clarify and rerun, or accept variance as a signal.
`-- No: medians are reliable. Use them in the report.

Did protected files get touched inconsistently?
|-- Yes: clarify the protected-file rule in AGENTS.md. Rerun.
`-- No: proceed to report.
```

---

## When to call the experiment done

Stop benchmarking and produce a report when:

- [ ] You have 3+ tasks (simple, multi-file, messy).
- [ ] You have 5+ runs per condition per task (or 1+ if time is limited; label as such).
- [ ] No more repo/task issues (validation passes, errors are rare).
- [ ] You see a clear pattern: consistently better, consistently worse, or clearly neutral.
- [ ] You have enough data to make a decision: adopt, refine, or skip AGENTS.md.

Stop experimenting and publish when:

- [ ] Your private report is complete and honest.
- [ ] Findings are clear enough to act on (or neutral enough to document).
- [ ] Sensitive details are sanitized if sharing externally.
