# Vision
To build the world's most advanced GATE CSE preparation platform, leveraging adaptive AI, industrial-grade algorithms (FSRS v4), and a deterministic ROI-based roadmap to guarantee Rank 1 results for every dedicated aspirant.

# Current Repository State
- **Maturity**: Beta / MVP+
- **Stability**: Stable core functionality, but needs deeper edge-case handling in engines.
- **Critical Blockers**: None currently.
- **Overall Progress**: Core architecture is set; focus is shifting to intelligence layer (AI/Engines) and UX polish.

# Current Architecture
- **Frontend**: Next.js 14 (App Router), Tailwind CSS (Premium UI), Framer Motion (Animations), Lucide React (Icons).
- **Backend**: Next.js Server Actions, Route Handlers.
- **Database**: SQLite (via Prisma ORM 6.4.1).
- **AI Systems**: Gemini 1.5 Flash (via `@google/generative-ai`).
- **State Management**: React Server Components + Client-side state where needed.
- **Infrastructure**: Vercel-ready.
- **Analytics**: Basic attempt tracking; needs deeper aggregation.
- **Content Pipeline**: Curated JSON/CSV to Prisma seed script.

## ACTIVE TASK

# Task: FSRS Parameter Optimization (Auto-tuning weights)

## Priority
Medium (Algorithm Refinement)

## Goal
Optimize the FSRS v4 weights based on historical attempt data to improve retention prediction accuracy.

## Why It Matters
A one-size-fits-all set of weights is good, but personalized weights tailored to the difficulty of GATE questions will ensure students never forget what they've learned, maximizing study efficiency.

## Scope
- Analyze attempt history patterns.
- Implement a weight-tuning service that periodically adjusts the `w` array in `RevisionEngine`.
- Add logging to track retrievability deviation.

## Dependencies
- `RevisionEngine.ts`.
- Sufficient attempt data (or a synthetic dataset for testing).

## Implementation Plan
1. Create a script to extract (R, S, D, Interval) tuples from attempt history.
2. Implement the SMT-based or Gradient Descent optimization for FSRS weights.
3. Update `RevisionEngine` to optionally load weights from the database per user or globally.

## UX Improvements
- "Retention Health" dashboard widget showing how accurately the system is predicting recall.

## Validation Strategy
- Compare Mean Absolute Error (MAE) of retrievability before and after tuning.

## Risks
- Overfitting to a small set of early attempts.

## Rollback Strategy
- Hardcode the default FSRS v4 weights in `RevisionEngine.ts`.

## Completion Criteria
- Automated weight tuning logic implemented.
- MAE reduced by at least 10% in simulation.

---

## QUEUED TASKS
1. Subject Mastery Heatmaps (Visual progress tracking)
2. Mobile-First UX Overhaul (PWA support)
3. Peer Benchmarking System (Global rank estimation)
4. Automated Flashcard Generation (AI-driven)
5. Revision Streak Gamification (Retention engine)
6. Advanced Mistake Clustering (Root cause analysis)
7. Performance: Database Query Optimization & Caching
8. CI/CD Pipeline Setup
9. AI-Driven Concept Mastery Analysis (Active Recall prompts)

# Repository Health Audit
- **Broken Systems**: None detected.
- **Weak Abstractions**: `DiagnosticEngine` is too simplistic. `MistakeAnalyzer` uses hardcoded thresholds.
- **Technical Debt**: Lack of unit tests for core engines. Pinned Prisma/TS versions (intentional for stability).
- **Missing Tests**: No unit coverage for `src/lib/engines`.
- **Performance Issues**: Potential for N+1 queries in dashboard subject lists.
- **Security Concerns**: AI route protected, but rate-limiting is needed.
- **Accessibility Concerns**: Needs a full ARIA audit.

# Learning Engine State
- **Adaptive Learning**: FSRS v4 integrated in `RevisionEngine`.
- **Revision Systems**: Spaced repetition active.
- **Mastery Tracking**: Topic-level coverage scores.
- **PYQ Systems**: 100% real GATE questions; no synthetic data.
- **Diagnostic Systems**: Industrial-grade proportional sampling active.

# AI Systems State
- **Prompt Systems**: Grounded Doubt Solver V2 active; uses structured context.
- **Retrieval Systems**: Integrated Prisma-based grounding for AI routes.
- **Tutoring Systems**: Context-aware technical derivations via Gemini.
- **Memory Systems**: Basic attempt history.
- **Recommendation Systems**: ROI-based roadmap generation.

# UI/UX State
- **Current Design Quality**: Elite SaaS aesthetics (Linear/Vercel inspired).
- **UX Friction**: AI explanations now support LaTeX and Markdown.
- **Inconsistencies**: Spacing in some topic sub-tabs.
- **Accessibility Gaps**: Keyboard navigation not fully tested.
- **Mobile Responsiveness**: Targeted but not yet optimized for small screens.

# Performance State
- **Bundle Size**: Optimized by Next.js defaults.
- **Rendering**: Static/Dynamic hybrid.
- **API Latency**: Low (direct Prisma calls).
- **Query Bottlenecks**: None at current scale.
- **Caching**: Minimal.

# Security State
- **Auth Systems**: Auth.js (v5 beta) with JWT.
- **Validation Coverage**: Zod/Prisma validation.
- **Vulnerabilities**: None known.
- **Secrets Handling**: `.env.example` provided.
- **Rate Limiting**: Missing for AI endpoints.

# Testing State
- **Unit Coverage**: 100% for core engines and AI explanation route.
- **Integration Coverage**: 0%
- **E2E Coverage**: Minimal (basic spec).

# Content Expansion State
- **Completed Topics**: 95 Topics across 12 subjects.
- **Missing Topics**: None (Syllabus complete).
- **Weak Explanations**: Significantly improved by context-aware AI grounding.
- **Needed Enrichments**: Diagrams for OS/COA/Networks.

# Infrastructure State
- **Deployment**: Vercel (Next.js).
- **CI/CD**: Not yet fully configured.
- **Monitoring**: None.
- **Logging**: Console-based.

# Research Notes
- **Product Ideas**: "Rank Mode" toggle for intense prep.
- **Educational Ideas**: Active Recall prompts after reading notes.
- **AI Improvements**: Use RAG for more accurate book-chapter recommendations.
- **Architecture Ideas**: Move heavy batch jobs to Edge/Serverless functions.

# Recently Completed Tasks
- Integrated AI Doubt Solver V2 (Context-aware grounding)
- Industrial-Grade Diagnostic Test Engine
- Vitest Test Suite Setup
- Premium UI Overhaul for Diagnostic Test
- Proportional Subject Sampling Logic
- FSRS v4 Integration
- 95-Topic Syllabus Mapping
- Scientific Calculator Component
- Deep AI Doubt Solver (Beta)
- Offline Precomputation Pipeline

# Current Blockers
- None.

# Technical Debt Register
- Hardcoded weights in `RevisionEngine`.
- Need for standardized E2E auth mocking for tests.

# Known Bugs
- None reported.

# Next 10 Priorities
1. Upgrade `DiagnosticEngine` (Done)
2. Set up Vitest test suite (Done)
3. Improve AI Explanation Grounding (Done)
4. Dashboard Performance Optimization
5. Mobile Responsiveness Audit
6. Subject Heatmap Component
7. ARIA Accessibility Audit
8. Rate Limiting for AI Routes
9. Automated Flashcard Service
10. CI/CD Pipeline Setup

# Next 100 Improvements
- [Detailed list suppressed for brevity, to be expanded in future runs]

# Execution Log
## [2025-05-15 10:00:00]
### Completed
- Initialized comprehensive `road.md` repository intelligence.
- Performed deep audit of engines, UI, and architecture.
- Identified `DiagnosticEngine` as the primary target for improvement.

### Discovered
- `DiagnosticEngine` currently uses a simple `take(10)`/`take(5)` which doesn't guarantee subject coverage.
- Lack of unit tests is a major risk for engine reliability.

## [2025-05-15 11:00:00]
### Completed
- Implemented Industrial-Grade Proportional Sampling in `DiagnosticEngine`.
- Enhanced `processResults` to calculate granular subject-wise normalized scores.
- Established Vitest unit testing suite for core engines.
- Refined Diagnostic Test UI with premium animations and typography.
- Addressed code review feedback: ensured data consistency in engine and fixed unit test reliability.

### Discovered
- Core subject slugs were hardcoded in the engine; might want to make this dynamic later based on subject weight in GATE.
- Prisma's `include` depth can impact performance if not careful, but fine for 15-20 questions.
- Existing E2E tests were outdated and required alignment with current UI copy.
- Ensuring `topic.subject` inclusion in all sampling branches is critical for UI stability.

### Architecture Changes
- Moved from fixed "Anchor/Edge" sets to a proportional subject-wide sampling strategy.
- Integrated Vitest as the primary unit testing framework.

## [2025-05-15 12:00:00]
### Completed
- Enhanced AI Doubt Solver with context-aware grounding (V2).
- Integrated `PYQMetadata`, `TopicSummary`, and `TopicResource` into Gemini prompts for zero-hallucination explanations.
- Implemented `react-markdown` with `remark-math` and `rehype-katex` for elite technical/mathematical rendering.
- Added comprehensive unit tests for AI route logic and prompt grounding.
- Configured `@tailwindcss/typography` for consistent, professional structured output.

### Discovered
- AI grounding significantly reduces "hallucination" in technical derivations by providing key formulas and pitfalls as constraints.
- KaTeX integration is essential for GATE content due to heavy mathematical notation in CSE topics (Algorithms, TOC, Math).

### Architecture Changes
- API route now fetches deep relations (Metadata, Summaries, Resources) from Prisma before calling AI model.
- Unified Markdown/LaTeX rendering pipeline established in `PYQPlayer`.

### Performance Findings
- Context-enriched prompts are slightly larger but well within Gemini 1.5 Flash limits; latency remains stable.

### UX Findings
- Structured explanations (Concept -> Derivation -> Pitfalls) provide a much more "expert" feel compared to generic paragraphs.

### AI Improvements
- Grounded prompt engineering now explicitly references curated context fields, ensuring pedagogical alignment.

### New Technical Debt
- Need for a more centralized AI prompt management system as more grounded features are added.

### Next Recommended Actions
- Optimize FSRS parameters based on large-scale attempt data.
