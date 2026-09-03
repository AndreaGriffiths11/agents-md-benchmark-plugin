# Task Design Guide

This guide helps you design benchmark tasks that reveal whether AGENTS.md changes agent behavior.

## Why task design matters

**Simple tasks hide AGENTS.md value.** If the right change is obvious, both baseline and treatment agents will succeed the same way.

**Messy tasks reveal differences.** Tasks with realistic ambiguity and multiple surfaces tempt agents to expand scope. That's where AGENTS.md guidance shows its value (or reveals that it doesn't help).

## Task shapes and examples

### Simple scoped task

One file or tightly grouped files. The correct approach is obvious from existing patterns.

**Web app example:**
```text
Add a "loading" spinner to the existing button component
when the form is submitting. Use the existing <Spinner />
component and styling.
```

**Signal:** Usually neutral. Both baseline and treatment should succeed similarly.

**Why it's safe:** Hard to wander into unrelated surfaces. Tests baseline competence.

---

### Multi-file task

Two to four related files. The list of files is objectively correct. Existing patterns show where to make changes.

**Web app example:**
```text
Add a "discount code" field to the checkout form.
Wire it into the Order API endpoint and validate codes
against the existing Discounts service. Do not change
existing styling.
```

**Files involved:** Form component, Order API handler, type definitions, Discounts service integration.

**Signal:** Treatment may make smaller diffs; baseline might miss a file or touch unnecessary styling.

**Why it's useful:** Tests convention discovery and completeness without scope ambiguity.

---

### Messy cross-surface task

Multiple surfaces. Ambiguity invites over-editing. Protected surfaces nearby that agents might unnecessarily touch.

**Web app example (good messy task):**
```text
Add a "featured" flag to blog posts. This flag should:
- Appear in post list views (with a special icon)
- Appear in the post detail page (in the metadata)
- Be included in search results (highlighted or sorted first)
- Calculate from the existing "featured-at" timestamp in the post model

Keep all other styling and behavior the same. Do not change:
- Feeds (RSS, JSON feeds)
- Post routing or URLs
- Deployment or build configuration
- Unrelated page layouts
```

**Surfaces involved:**
- Post model and type definitions
- Post API endpoint (list, detail, search)
- List view component
- Detail page component
- Search result component
- Search indexing logic

**Tempting but protected surfaces:**
- RSS/JSON feed generation (easy to accidentally change)
- Global post styling (easy to add a CSS rule for the icon)
- Pagination or sorting logic (easy to refactor while adding featured sort)
- Build configuration (easy to accidentally trigger rebuilds)

**Signal:** Baseline may wander into feeds, add global CSS, or refactor pagination. Treatment should stay scoped to the flag itself.

**Why it's powerful:** Realistic complexity without requiring credentials or side effects.

---

### Guardrail-sensitive task

Documentation or minimal code. Protected files exist nearby. Task description tempts touching protected surfaces.

**Example:**
```text
Add documentation to the README explaining how the
feature flag system works and how to use it in new features.
```

**Signal:** Baseline might rebuild lockfiles, regenerate docs, or update unrelated dependencies. Treatment should skip those steps because AGENTS.md said not to.

**Why it's useful:** Tests whether instructions prevent unnecessary churn.

---

## Checklist: Is this a good task?

### General checks

- [ ] Task is realistic and self-contained (not fictional).
- [ ] Task requires no credentials, API keys, or external services.
- [ ] Task has no side effects (no sending emails, modifying production).
- [ ] Agent can complete task in a reasonable time (< 15 minutes).
- [ ] Task is not so easy that both conditions trivially succeed.
- [ ] Task is not so complex that both conditions error/timeout.

### For simple and multi-file tasks

- [ ] List of files to change is objectively correct.
- [ ] Existing patterns show where to make changes.
- [ ] Ambiguity is minimal (e.g., no "choose between two refactoring styles").

### For messy tasks (most important)

- [ ] Multiple surfaces are involved (3+ files in different areas).
- [ ] Adjacent features could plausibly be affected but shouldn't be.
- [ ] Protected surfaces exist nearby (generated output, deployment, styling, schema).
- [ ] Task description is brief (does not hint at all files to touch).
- [ ] Both baseline and treatment can attempt the task (not too hard or too ambiguous).

## Common patterns for messy surfaces

Pick one that fits your repo:

### 1. Content model + UI + Search + Feed

Good for: blogs, wikis, product catalogs, help sites.

```text
Add a [FIELD] to [CONTENT_TYPE]. It should appear in:
- List views
- Detail pages
- Search results

Do not change:
- Feeds (RSS, JSON)
- Routing
- Unrelated styling
```

**Tempts wandering into:** Feed generation, pagination refactoring, global styling.

### 2. Feature flag + UI + Logging

Good for: feature-gated functionality.

```text
Add a feature flag for [FEATURE]. Wire it into:
- UI conditional logic
- Logging/events

Keep the flag off by default. Do not change:
- Event schema
- Analytics
- Configuration system
```

**Tempts wandering into:** Event tracking refactoring, analytics expansion, config changes.

### 3. Route + Navigation + Sitemap

Good for: multi-page apps.

```text
Add a new route /[PATH]. Ensure:
- Route is accessible
- Route appears in breadcrumbs
- Route is indexed in search navigation

Do not change:
- Routing framework or middleware
- Deployment config
- Feed generation
```

**Tempts wandering into:** Navigation refactoring, sitemap format changes, routing middleware changes.

### 4. API field + Backend + Frontend

Good for: full-stack changes.

```text
Add a [FIELD] to the [RESOURCE] API. Wire it into:
- API response
- Existing UI form for creating [RESOURCE]
- Existing UI display for [RESOURCE]

Keep other styling and form layout the same.
```

**Tempts wandering into:** Form refactoring, styling updates, validation expansion, schema changes.

### 5. Config option + Service + UI

Good for: configurable behavior.

```text
Add a [SETTING] configuration option. It should:
- Be stored in [CONFIG_FILE]
- Be passed to [SERVICE]
- Have a UI control in [SETTINGS_PAGE]

Do not change:
- Deployment or environment config
- Unrelated service behavior
- Lockfiles or generated output
```

**Tempts wandering into:** Environment config changes, service refactoring, generated output changes.

---

## Example: Designing a messy task for a specific repo

**Repository:** A Next.js blog with TypeScript, Jest, and a headless CMS.

**Step 1: Identify surfaces**
- Post model and database schema
- Post API endpoint (list, detail, search)
- List view component (pages/blog/index.tsx)
- Detail page component (pages/blog/[slug].tsx)
- Search page (pages/search.tsx)
- Search indexing (scripts/index-posts.ts)
- Feeds (RSS, sitemap)
- Next.js config and build

**Step 2: Find a realistic messy feature**
Add a "reading time" estimate to posts. Appears in list, detail, search. Calculated from post content.

**Step 3: Identify tempting but protected surfaces**
- Feed generation (easy to accidentally update)
- Global styling (easy to add a badge style)
- Search ranking/sorting (easy to refactor)
- Build/deploy config (easy to trigger rebuilds)

**Step 4: Write the task**
```text
Add a "reading time" estimate to blog posts.
It should appear in:
- Post list view (next to the publish date)
- Post detail page (in the metadata)
- Search results (as a filter or display)

Calculate reading time from post content (assume 200 words per minute).
Keep all other styling, filtering, and sorting the same.

Do not change:
- RSS or JSON feeds
- Sitemap generation
- Post routing or URLs
- Build or deployment config
- Unrelated page styling
```

**Step 5: Verify**
- [ ] List is realistic (3 surfaces, about 2 to 3 new files).
- [ ] Tempting protected surfaces are nearby (feeds, routing, styling).
- [ ] Task is not too hard (reading time is straightforward to calculate).
- [ ] Task is not too vague (specific surfaces listed).

If all four boxes check out, the task is ready to benchmark.

---

## When to skip a task and design a new one

- **Both conditions nail it identically on your first two trials.** The task is too easy; move to the messy task.
- **Both conditions error on your first trial.** The task is too hard or the repo setup has issues. Fix the repo/task, not AGENTS.md.
- **The task is so specific it barely tests anything.** (e.g., "change variable `x` to `y`"). Make it more general or exploratory.
- **You cannot describe it without giving away the file list.** Reframe or choose a different feature.
