# GATE CSE Prep System
## Software Requirements Specification (SRS) v2.0
### Built on Next.js · Powered by Gemini · Designed for Rank 1

---

> **Three Pillars of this System**
>
> | # | Pillar | What it guarantees |
> |---|--------|--------------------|
> | 1 | 🎯 Learning Experience | User always knows what to do next |
> | 2 | 🔁 Revision Surety | Nothing important is ever forgotten |
> | 3 | 🤖 AI Precomputation | Gemini works once. System benefits forever. |

---

## 0. Core Philosophy

**Structured progression + PYQ-first + memory control + testing discipline.**

The user should never feel:
- *"What should I do next?"*
- *"Am I doing enough?"*
- *"Am I forgetting this?"*

Every screen, every feature, every data model must answer one of these three fears.

---

---

# PILLAR 1 — 🎯 Learning Experience

> *The system must make the learning path feel inevitable, not overwhelming.*

---

## 1.1 Entry Diagnosis (Step 0)

### Purpose
Estimate the user's starting level without creating friction.

### Rules
- **10–15 questions max** — no more, ever
- Covers **5–6 subjects** broadly (2–3 questions each)
- Timed per question (45 seconds)
- No login wall before the test

### Output
The system produces:
- `strength_map`: subject → score (0–100)
- `weak_areas[]`: topics needing priority
- `initial_roadmap`: ordered topic list (auto-generated)

### Task: Build Entry Test Flow
- [x] Build `/onboarding/test` page in Next.js (App Router)
- [x] Create `DiagnosticEngine` service — takes answers, returns `strength_map`
- [x] Store result in DB under `user.diagnostic_result`
- [x] Redirect → `/roadmap` after submission

---

## 1.2 Roadmap Generation (Step 1)

### Ordering Logic (Deterministic — No AI at Runtime)
Topics are ordered by a **priority score**:

```
priority_score = (pyq_weight × 0.5) + (dependency_order × 0.3) + (user_weakness × 0.2)
```

| Factor | Source |
|--------|--------|
| `pyq_weight` | Precomputed: how many PYQs exist per topic |
| `dependency_order` | Static graph: e.g., Graphs needs Arrays first |
| `user_weakness` | From diagnostic: inverted strength score |

### Roadmap Card (per topic)
Each topic card shows:
- Estimated PYQs available
- Prerequisite badge (if any)
- Difficulty tier: `Foundational / Core / Advanced`
- Status: `Locked / Active / In Progress / Completed`

### Task: Build Roadmap Page
- [x] Build `/roadmap` page — vertical scrollable topic list
- [x] `RoadmapEngine.generate(userId)` — pure function, no AI call
- [x] Topic cards with lock/unlock logic based on prerequisites
- [x] Persist roadmap to DB — regenerate only if syllabus changes

---

## 1.3 Learning Phase (Step 2)

### Per-Topic Learning View
When a user opens a topic, they see:

```
┌─────────────────────────────────┐
│  TOPIC: Dynamic Programming     │
│  Status: In Progress (18/40)    │
├─────────────────────────────────┤
│  [PYQs]  [Notes]  [Videos]      │
│                                 │
│  PYQ #1 — GATE 2022 (CS)        │
│  ┌───────────────────────────┐  │
│  │ Question text here...     │  │
│  │                           │  │
│  │  A)  B)  C)  D)           │  │
│  └───────────────────────────┘  │
│                                 │
│  [Submit] [Skip] [Hint]         │
└─────────────────────────────────┘
```

### Resource System
System offers **curated choices** — never forces one path:

| Resource Type | Source |
|---------------|--------|
| PYQs | Primary — always shown first |
| Notes | Prelinked PDFs / markdown notes |
| Video | YouTube embeds (curated, not searched) |
| Book reference | Chapter + page pointer |

> ⚠️ **Design Rule:** PYQs are always Tab 1. Resources are Tab 2+. Never swap this order.

### Task: Build Topic Learning Page
- [x] Build `/topic/[slug]` page
- [x] `PYQPlayer` component — renders question, options, timer
- [x] Tab system: PYQs → Notes → Videos → Books
- [x] Track `attempted`, `correct`, `skipped` per PYQ in DB
- [x] Show progress bar: X of Y PYQs solved

---

## 1.4 Completion Gate (Step 3)

### The Hard Rule
A topic is **not complete** until the user meets the **coverage threshold**.

### Coverage Formula (Better than Fixed 50)

```
coverage_score = (solved_PYQs / available_PYQs) × concept_coverage_weight
```

- Threshold: **coverage_score ≥ 0.80** (80%)
- Minimum floor: solve at least **15 PYQs**, no matter what
- Topics with < 15 PYQs: must hit **100% of available PYQs**

### Why This Beats "50 PYQs Fixed"
| Scenario | Fixed 50 | Coverage % |
|----------|----------|------------|
| Topic has 12 PYQs | Impossible to complete | Achievable |
| Topic has 200 PYQs | Underexposed | Flexible |
| Topic has exactly 50 | Same | Same |

### Task: Build Completion Gate Logic
- [x] `CompletionEngine.check(userId, topicId)` → returns `{ complete: bool, score: float }`
- [x] Block "Mark Complete" button until threshold met
- [x] Show gap message: *"Solve 6 more PYQs to unlock next topic"*
- [x] On completion: trigger `RevisionEngine.enqueue(topicId)`

---

---

# PILLAR 2 — 🔁 Revision Surety

> *The system must guarantee that nothing important fades. Every completed topic stays alive.*

---

## 2.1 Revision Algorithm (Step 4)

### Memory Score Per PYQ

Every PYQ the user has solved gets a **memory score**:

```
memory_score(t) = base_score × e^(−λ × days_since_last_review)
```

| Variable | Meaning |
|----------|---------|
| `base_score` | 1.0 if answered correctly, 0.5 if wrong |
| `λ` (decay rate) | 0.1 for easy, 0.2 for medium, 0.3 for hard |
| `days_since_last_review` | Calendar days since last attempt |

### Revisit Trigger
A PYQ is added to the revision queue when:

```
memory_score < 0.6   OR   topic_importance ≥ HIGH AND memory_score < 0.75
```

### Priority Score for Revision Queue

```
revision_priority = (1 − memory_score) × topic_pyq_weight × exam_proximity_factor
```

- `exam_proximity_factor` rises linearly as GATE date approaches
- Queue is sorted by `revision_priority` descending

### Revision Session Format
- **10–15 questions** per session
- Mix: 70% weakest memory + 30% random strong topics (to reinforce)
- After session: memory scores recalculated

### Task: Build Revision Engine
- [x] `RevisionEngine.enqueue(topicId)` — called on topic completion
- [x] Nightly cron job (Next.js API route + Vercel Cron): recalculate all memory scores
- [x] `RevisionEngine.getQueue(userId)` — returns sorted list of PYQs due
- [x] Build `/revision` page — shows today's queue
- [x] After session: call `RevisionEngine.updateScores(sessionResults[])`

---

## 2.2 Revision Dashboard

### What the User Sees

```
┌─────────────────────────────────────────┐
│  YOUR REVISION QUEUE — Today            │
│                                         │
│  🔴 Critical (memory < 0.4)   → 4 PYQs │
│  🟡 Needs Review (< 0.6)      → 8 PYQs │
│  🟢 On Track                  → stable  │
│                                         │
│  [Start Revision Session →]             │
└─────────────────────────────────────────┘
```

### Topic Health Map
Every subject shows a **health bar** — aggregate memory score across all its PYQs.

- Green → above 0.75
- Yellow → 0.50–0.75
- Red → below 0.50

### Task: Build Revision Dashboard
- [x] `/dashboard/revision` — health map + today's queue
- [x] Color-coded topic cards by memory health
- [x] Streak tracker: consecutive days of revision
- [x] "Weak Topics" summary panel

---

## 2.3 Subject-Level Testing (Step 5)

### Trigger
Automatically unlocked when **all topics in a subject** reach `coverage_score ≥ 0.80`.

### Test Structure

| Parameter | Value |
|-----------|-------|
| Duration | 60 minutes |
| Questions | 25–30 |
| Distribution | 50% easy / 30% medium / 20% hard |
| Negative marking | −0.33 for MCQ, 0 for NAT |
| Source | PYQs only (no synthetic questions) |

### Post-Test Analysis
- Topic-wise accuracy breakdown
- Speed analysis: time per question vs. GATE benchmark
- Mistake classification (see Pillar 1 → Mistake Intelligence)
- Recommended revision targets

### Task: Build Sectional Test Engine
- [x] `TestEngine.generate(subjectId, userId)` — builds paper from PYQ pool
- [x] Build `/test/[id]` — full-screen timed test interface
- [x] Negative marking logic baked into scoring
- [x] Post-test report page `/test/[id]/report`

---

## 2.4 Full-Length Mock Tests (Step 6)

### Unlock Condition
All subjects completed (coverage threshold met).

### Mock Test Parameters

| Parameter | Value |
|-----------|-------|
| Duration | 3 hours |
| Questions | 65 (GA: 10, CS: 55) |
| Marking | +1/+2, −0.33/−0.66 |
| Interface | Replicates official GATE UI |

### Analytics Tracked
- Section-wise score
- Rank estimation (percentile vs. historical data)
- Error pattern clustering
- Score trend across mocks (graph)

### Task: Build Mock Test System
- [x] Full GATE-pattern paper generator
- [x] Rank estimator using historical cutoff data (static table)
- [x] Score trend chart on `/dashboard`
- [x] Error pattern report: cluster mistakes by concept type

---

## 2.5 Mistake Intelligence

> *This is the feature most systems miss. It is non-negotiable.*

### For Every Wrong Answer, Capture:

| Field | Options |
|-------|---------|
| `mistake_type` | Conceptual / Calculation / Misread / Time pressure / Silly |
| `concept_tag` | Precomputed by Gemini (see Pillar 3) |
| `confidence_before` | User self-rated (1–5) before answering |
| `time_spent` | Seconds on this question |

### Mistake Pattern Engine
After every 10 mistakes in a subject:

```
if (conceptual_mistakes / total_mistakes) > 0.5:
  → Flag topic for deep re-study (not just revision)

if (time_pressure_mistakes > 3):
  → Recommend timed practice drills

if (silly_mistakes > 4):
  → Alert: "Review your checking habit"
```

### Task: Build Mistake Intelligence
- [x] Add `mistake_log` table to DB
- [x] Post-answer modal: "What went wrong?" (quick-tap options)
- [x] `MistakeAnalyzer.run(userId, subjectId)` — pattern detection
- [x] Mistake insights card on dashboard

---

---

# PILLAR 3 — 🤖 AI Precomputation (Gemini)

> *Gemini runs once, offline, at content-load time. Runtime is always fast and free.*

---

## 3.1 Philosophy

```
Developer runs Gemini → stores output → system uses output forever
Zero AI cost at runtime. Zero latency for users.
```

This is the **highest-leverage AI usage pattern** for an edtech system.

---

## 3.2 Precomputation Jobs (Run Once, Store Forever)

### Job 1: PYQ Tagging

**Input:** Raw PYQ (question text + answer)
**Gemini Prompt:**
```
Given this GATE PYQ, return JSON:
{
  "topic": "string",
  "subtopic": "string",
  "concept_tags": ["string"],
  "difficulty": "easy|medium|hard",
  "question_type": "conceptual|numerical|application",
  "common_mistake": "string",
  "one_line_explanation": "string"
}
```
**Output stored in:** `pyq_metadata` table
**Run trigger:** When a new PYQ is added to DB

---

### Job 2: Topic Summaries

**Input:** Topic name + subject
**Gemini Prompt:**
```
Generate a GATE-focused summary for: [topic]
Return JSON:
{
  "core_concepts": ["string"],
  "common_exam_patterns": ["string"],
  "key_formulas": ["string"],
  "most_tested_subtopics": ["string"],
  "typical_mistakes": ["string"]
}
```
**Output stored in:** `topic_summaries` table
**Run trigger:** One-time batch job at launch

---

### Job 3: Resource Curation

**Input:** Topic name
**Gemini Prompt:**
```
For GATE CSE topic: [topic]
Return JSON:
{
  "best_youtube_channels": ["string"],
  "recommended_book_chapters": [{"book": "string", "chapter": "string"}],
  "topic_keywords_for_notes_search": ["string"]
}
```
**Output stored in:** `topic_resources` table
**Run trigger:** One-time batch + manual refresh quarterly

---

### Job 4: Mistake Classification Rules

**Input:** List of common wrong answers per topic
**Gemini Prompt:**
```
Given these wrong answer patterns for [topic], classify each mistake:
Return JSON array:
[{ "wrong_answer_pattern": "string", "mistake_type": "conceptual|calculation|misread", "root_cause": "string" }]
```
**Output stored in:** `mistake_classification_rules` table
**Used by:** `MistakeAnalyzer` at runtime (no AI call needed)

---

## 3.3 Optional Runtime AI (Premium Only)

These features call Gemini **live**, gated behind a premium flag:

| Feature | Trigger | Gemini Task |
|---------|---------|-------------|
| Doubt Solver | User taps "Explain this" | Explain PYQ step-by-step |
| Personalized Coaching | Weekly summary request | Analyze user's full mistake log |
| Dynamic Hint | User stuck > 2 minutes | Generate a non-spoiler hint |

> **Cost control:** Each live call is debited from a `ai_credits` balance. Free tier gets 10/month.

---

## 3.4 Precomputation Pipeline (Next.js Scripts)

```
/scripts
  ├── run-pyq-tagging.ts        ← Gemini batch: tags all PYQs
  ├── run-topic-summaries.ts    ← Gemini batch: generates summaries
  ├── run-resource-curation.ts  ← Gemini batch: curates resources
  └── run-mistake-rules.ts      ← Gemini batch: builds mistake classifier
```

### Task: Build Precomputation Pipeline
- [x] Set up Gemini API client in `/lib/gemini.ts`
- [x] Write `run-pyq-tagging.ts` — reads all PYQs, calls Gemini, stores to DB
- [x] Add `precomputed_at` timestamp to every table → re-run only on content change
- [x] Build `/admin/precompute` dashboard — trigger jobs manually, view status

---

---

# DEVELOPER ROADMAP — Next.js (Task-Driven)

> Build in this exact order. Each phase is shippable.

---

## Phase 0 — Foundation (Week 1)
- [x] Init Next.js 14 App Router project
- [x] Set up Postgres DB + Prisma ORM
- [x] Auth: NextAuth.js (Google login)
- [x] DB schema: `users`, `topics`, `pyqs`, `pyq_metadata`, `user_progress`
- [x] Seed DB with GATE syllabus (static JSON → DB)
- [x] Deploy to Vercel (staging env)

---

## Phase 1 — Learning Experience (Week 2–3)
- [x] Entry test page + `DiagnosticEngine`
- [x] Roadmap page + `RoadmapEngine.generate()`
- [x] Topic page + `PYQPlayer` component
- [x] PYQ attempt tracking (correct / wrong / skipped)
- [x] Completion gate logic + unlock flow
- [x] Resource tabs (Notes / Video / Books)

---

## Phase 2 — Revision Surety (Week 4–5)
- [x] Memory score schema + decay calculation
- [x] Nightly cron: recalculate memory scores
- [x] Revision queue page + session player
- [x] Mistake log: capture type, confidence, time
- [x] `MistakeAnalyzer` pattern detection
- [x] Dashboard: health map + streak + weak topics

---

## Phase 3 — Testing System (Week 6)
- [x] Sectional test generator
- [x] Full-screen test interface (GATE-like UI)
- [x] Negative marking scoring engine
- [x] Post-test report page
- [x] Full mock test (65Q / 3hr)
- [x] Score trend chart + rank estimator

---

## Phase 4 — AI Precomputation (Week 7)
- [x] Gemini API client setup
- [x] Batch: PYQ tagging script
- [x] Batch: Topic summary script
- [x] Batch: Resource curation script
- [x] Admin panel to trigger + monitor jobs
- [x] Wire precomputed data into topic pages

---

## Phase 5 — Rank Optimization Mode (Week 8)
- [x] Auto-detect: all subjects completed → shift to rank mode
- [x] Weak-area-only revision queue
- [x] Test frequency intensifier (more mocks)
- [x] "Marks at stake" view: topics sorted by ROI
- [x] Final 30-day sprint plan generator

---

---

# System Architecture

```
/app
  ├── (auth)/                  ← login, signup
  ├── onboarding/test/         ← entry diagnosis
  ├── roadmap/                 ← topic list
  ├── topic/[slug]/            ← learning view
  ├── revision/                ← daily revision queue
  ├── test/[id]/               ← test interface
  ├── dashboard/               ← analytics + health map
  └── admin/                   ← precompute jobs

/lib
  ├── gemini.ts                ← Gemini API client
  ├── engines/
  │   ├── DiagnosticEngine.ts
  │   ├── RoadmapEngine.ts
  │   ├── CompletionEngine.ts
  │   ├── RevisionEngine.ts
  │   ├── TestEngine.ts
  │   └── MistakeAnalyzer.ts
  └── db/                      ← Prisma client + helpers

/scripts
  ├── run-pyq-tagging.ts
  ├── run-topic-summaries.ts
  ├── run-resource-curation.ts
  └── run-mistake-rules.ts
```

---

# What Makes This Version 10x Better

| Old SRS | This SRS |
|---------|----------|
| "50 PYQs" fixed rule | Coverage % formula with floor |
| "Spaced repetition" (vague) | Exact decay function with λ per difficulty |
| "Track mistakes" | Full mistake intelligence: type + root cause + pattern |
| "Use AI smartly" | Specific Gemini jobs with exact prompts |
| No developer guidance | Task-driven roadmap, phase by phase |
| Vague test system | Exact distribution, timing, negative marking rules |
| No rank optimization | Dedicated Phase 5 with ROI-sorted topic view |

---

*Built for the developer building it. Powered by Gemini. Designed to produce GATE rank 1.*
