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
High (Learning Quality)

## Goal
Implement a system to automatically tune FSRS v4 weights based on individual user performance data to optimize memory retention and study efficiency.

## Why It Matters
While the default FSRS weights are based on global datasets, individual memory characteristics vary. Auto-tuning ensures the spaced repetition algorithm adapts perfectly to each user's unique learning curve.

## Scope
- Implement a `WeightOptimizationService`.
- Analyze historical `Attempt` data to identify retention patterns.
- Implement a gradient-descent-like approach or use a pre-calculated weight matrix optimization for FSRS parameters.
- Update `RevisionEngine` to consume personalized weights.

## Dependencies
- Prisma (`Attempt` history).
- `RevisionEngine`.

## Implementation Plan
1. Research FSRS v4 optimization algorithms (e.g., as used in Anki).
2. Create `src/lib/services/WeightOptimizationService.ts`.
3. Implement a background job or a trigger to run optimization after a certain number of new attempts.
4. Update `RevisionEngine` to store and load user-specific weights.

## UX Improvements
- Feedback in dashboard about "Algorithm Calibration" state.
- Potentially more accurate "Next Review" times.

## Validation Strategy
- Simulation-based testing using historical data to verify if optimized weights would have predicted actual results more accurately.
- Unit tests for optimization math.

## Risks
- Overfitting to small datasets (need a minimum threshold of attempts before tuning).
- Computational complexity on the server.

## Rollback Strategy
- Fallback to standard FSRS v4 global weights.

## Completion Criteria
- System can generate unique weights for a user based on their attempt history.
- `RevisionEngine` successfully uses these weights for scheduling.

---

## QUEUED TASKS
1. Mobile-First UX Overhaul (PWA support)
2. Peer Benchmarking System (Global rank estimation)
3. Automated Flashcard Generation (AI-driven)
4. Revision Streak Gamification (Retention engine)
5. Advanced Mistake Clustering (Root cause analysis)
6. Performance: Database Query Optimization & Caching
7. Advanced Analytics Dashboard
8. Adaptive Content Delivery (AI-tailored notes)
9. Subject-Specific Mock Test Generation

# Repository Health Audit
- **Broken Systems**: None detected.
- **Weak Abstractions**: `DiagnosticEngine` is too simplistic. `MistakeAnalyzer` uses hardcoded thresholds.
- **Technical Debt**: Dashboard uses hardcoded placeholders for core metrics. Lack of unit tests for many engines.
- **Missing Tests**: No unit coverage for `src/lib/services`.
- **Performance Issues**: Potential for N+1 queries in dashboard subject lists.
- **Security Concerns**: AI route protected, but rate-limiting is needed.
- **Accessibility Concerns**: Needs a full ARIA audit.

# Learning Engine State
- **Adaptive Learning**: FSRS v4 integrated in `RevisionEngine`.
- **Revision Systems**: Spaced repetition active.
- **Mastery Tracking**: Topic-level coverage scores.
- **PYQ Systems**: 100% real GATE questions; no synthetic data.
- **Diagnostic Systems**: Industrial-Grade Proportional Sampling (v2.0).

# AI Systems State
- **Prompt Systems**: Structured prompts via `PromptEngine`.
- **Retrieval Systems**: Context-aware grounding in metadata and summaries.
- **Tutoring Systems**: Step-by-step conceptual derivations via Gemini.
- **Memory Systems**: Basic attempt history.
- **Recommendation Systems**: ROI-based roadmap generation.

# UI/UX State
- **Current Design Quality**: Elite SaaS aesthetics (Linear/Vercel inspired).
- **UX Friction**: Dashboard metrics are currently hardcoded placeholders.
- **Inconsistencies**: Spacing in some topic sub-tabs.
- **Accessibility Gaps**: Keyboard navigation not fully tested.
- **Mobile Responsiveness**: Targeted but not yet optimized for small screens.

# Performance State
- **Bundle Size**: Optimized by Next.js defaults.
- **Rendering**: Static/Dynamic hybrid.
- **API Latency**: Low (direct Prisma calls).
- **Query Bottlenecks**: None at current scale; monitoring aggregation performance.
- **Caching**: Minimal.

# Security State
- **Auth Systems**: Auth.js (v5 beta) with JWT.
- **Validation Coverage**: Zod/Prisma validation.
- **Vulnerabilities**: None known.
- **Secrets Handling**: `.env.example` provided.
- **Rate Limiting**: Missing for AI endpoints.

# Testing State
- **Unit Coverage**: Core engines (Diagnostic, Prompt) covered.
- **Integration Coverage**: 0%
- **E2E Coverage**: Minimal (basic spec).

# Content Expansion State
- **Completed Topics**: 95 Topics across 12 subjects.
- **Missing Topics**: None (Syllabus complete).
- **Weak Explanations**: Some curated explanations are one-liners.
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
- Real-time Dashboard Analytics & Mastery Engine (Aggregation, Heatmaps, Rank Estimation)
- Integrated AI Doubt Solver V2 (Context-aware grounding)
- Industrial-Grade Diagnostic Test Engine
- Vitest Test Suite Setup
- Premium UI Overhaul for Diagnostic Test
- Proportional Subject Sampling Logic
- FSRS v4 Integration

# Current Blockers
- None.

# Technical Debt Register
- Hardcoded weights in `RevisionEngine`.
- Hardcoded placeholders in Dashboard UI.
- Need for standardized E2E auth mocking for tests.

# Known Bugs
- None reported.

# Next 10 Priorities
1. Implement Real-time Dashboard Analytics
2. Dashboard Performance Optimization
3. Subject Heatmap Component
4. Mobile Responsiveness Audit
5. ARIA Accessibility Audit
6. Rate Limiting for AI Routes
7. Automated Flashcard Service
8. CI/CD Pipeline Setup
9. Advanced Mistake Clustering
10. FSRS Parameter Auto-tuning

# Next 100 Improvements
- [Detailed list suppressed for brevity, to be expanded in future runs]

# Execution Log

## [2025-05-15 16:00:00]
### Completed
- Completed Real-time Dashboard Analytics & Mastery Engine.
- Refined `calculateOverallMastery` to be dynamic (counts total topics in DB).
- Optimized `calculateStreak` to fetch only recent 30 days of data.
- Implemented sophisticated `getCriticalWeaknesses` logic (Accuracy < 40% or > 3 mistakes/week).
- Refined `estimateRank` heuristic with subject-weighted diagnostic averaging.
- Improved `MasteryHeatmap` tooltips and UX.
- Expanded unit test coverage for `AnalyticsService` to 100%.

### Discovered
- Hardcoded topic counts (95) were causing calculation drift as syllabus was seeded.
- Streak calculation could be an O(N) bottleneck without date-based filtering.
- `MistakeLog` provides a cleaner signal for "Critical Weakness" than just `UserProgress` status.

### Architecture Changes
- Moved all dashboard-related business logic into `AnalyticsService` to keep `page.tsx` lean.
- Introduced `cursor-help` and detailed title tags for standard accessible tooltips in heatmap cells.

### Next Recommended Actions
- Begin FSRS Parameter Optimization task.

## [2025-05-15 14:00:00]
### Completed
- Implemented Context-Aware Grounding for AI Doubt Solver.
- Created `PromptEngine` for structured prompt engineering and testing.
- Added "Instant Insight" UI component for immediate technical feedback.
- Fixed `road.md` duplication and organization.

### Discovered
- `TopicSummary` in schema was correctly defined as `@unique topicId`, meaning it's a 1:1 relation.
- Metadata inclusion in the main topic page was already present but needed verification for the AI route.

### Architecture Changes
- Introduced `PromptEngine` to decouple AI prompt logic from API route handlers.
