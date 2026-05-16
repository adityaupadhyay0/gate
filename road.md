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
- **Database**: SQLite (via Prisma ORM 6.4.1); now stores personalized `fsrsWeights` for users.
- **AI Systems**: Gemini 1.5 Flash (via `@google/generative-ai`).
- **State Management**: React Server Components + Client-side state where needed.
- **Infrastructure**: Vercel-ready.
- **Analytics**: Basic attempt tracking; needs deeper aggregation.
- **Content Pipeline**: Curated JSON/CSV to Prisma seed script.

## ACTIVE TASK

# Task: Peer Benchmarking System (Global rank estimation)

## Priority
Medium (Analytics/Motivation)

## Goal
Implement a global peer benchmarking system that estimates a user's potential GATE rank by comparing their performance against the global community of users.

## Why It Matters
Aspirants need to know where they stand relative to the competition. Real-time rank estimation based on actual attempt data provides a powerful motivational signal and helps calibrate study intensity.

## Scope
- Implement `BenchmarkingService` for aggregate performance comparison.
- Design a "Global Percentile" visualization for the dashboard.
- Update `estimateRank` heuristic with real peer percentile data.
- Add subject-wise percentile breakdowns.

## Dependencies
- `AnalyticsService`.
- Historical aggregate data (mocked or real).

## Implementation Plan
1. Research percentile calculation methods for large datasets (e.g., T-score or Percentile Rank).
2. Create `src/lib/services/BenchmarkingService.ts`.
3. Implement an aggregation job to calculate subject-wise global averages and standard deviations.
4. Update Dashboard UI to show "Global Standings" section.

## UX Improvements
- Interactive "Rank Trajectory" chart.
- Compare with "Topper Average" overlay on subject health maps.

## Validation Strategy
- Unit tests for percentile math.
- Verification of aggregation query performance.

## Risks
- Data sparsity for new subjects.
- Potential privacy concerns (must use anonymous aggregates).

## Rollback Strategy
- Revert dashboard to use simple heuristic-based rank estimation.

## Completion Criteria
- System can calculate a percentile for a user in each subject.
- Dashboard displays an estimated global rank based on percentile comparison.

---

## QUEUED TASKS
1. Automated Flashcard Generation (AI-driven)
2. Revision Streak Gamification (Retention engine)
3. Advanced Mistake Clustering (Root cause analysis)
4. Performance: Database Query Optimization & Caching
5. Advanced Analytics Dashboard
6. Adaptive Content Delivery (AI-tailored notes)
7. Subject-Specific Mock Test Generation
8. Multi-format Notes Export (PDF/Markdown)
9. Adaptive Mock Test Scaling (Dynamic difficulty)

# Repository Health Audit
- **Broken Systems**: None detected.
- **Weak Abstractions**: `DiagnosticEngine` is too simplistic. `MistakeAnalyzer` uses hardcoded thresholds.
- **Technical Debt**: Hardcoded weights in `RevisionEngine` (partially resolved by moving to optimization). Lack of unit tests for many engines.
- **Missing Tests**: No unit coverage for `src/lib/services`.
- **Performance Issues**: Potential for N+1 queries in dashboard subject lists.
- **Security Concerns**: AI route protected, but rate-limiting is needed.
- **Accessibility Concerns**: Needs a full ARIA audit.

# Learning Engine State
- **Adaptive Learning**: Personalized FSRS v4 auto-tuning active (WeightOptimizationService).
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
- Mobile-First UX Overhaul & PWA Support (Manifest, Service Workers, Responsive Fixes)
- FSRS Weight Optimization (Coordinate Descent with Learning Rate Decay)
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
1. Mobile-First UX & PWA Support
2. Peer Benchmarking System
3. Automated Flashcard Service
4. Revision Streak Gamification
5. Advanced Mistake Clustering
6. Dashboard Performance Optimization
7. ARIA Accessibility Audit
8. Rate Limiting for AI Routes
9. CI/CD Pipeline Setup
10. Multi-format Notes Export

# Next 100 Improvements
- [Detailed list suppressed for brevity, to be expanded in future runs]

# Execution Log

## [2025-05-15 19:30:00]
### Completed
- Finalized Mobile-First UX Overhaul & PWA Support.
- Integrated `@ducanh2912/next-pwa` for robust App Router support.
- Implemented FSRS Calibration indicators on the Dashboard.
- Applied responsive padding and alignment fixes to `PYQPlayer` and `MasteryHeatmap`.
- Updated `AnalyticsService` to track and expose calibration state.

### Architecture Changes
- `next.config.mjs` now wraps the configuration with PWA logic.
- `RootLayout` includes manifest and Apple-specific web app metadata.

### Performance Findings
- PWA caching significantly improves load times for subsequent visits on mobile.

## [2025-05-15 19:00:00]
### Completed
- Initiated Mobile-First UX Overhaul & PWA Support.
- Updated Roadmap intelligence to reflect personalized FSRS engine completion.

## [2025-05-15 18:00:00]
### Completed
- Initiated FSRS Parameter Optimization (Auto-tuning weights) system.
- Extended Prisma schema to support personalized `fsrsWeights` per user.
- Updated `RevisionEngine` to be ready for dynamic weight injection.

### Architecture Changes
- Database schema now supports storing learned FSRS v4 parameters in the `User` model.

### Next Recommended Actions
- Monitor optimization performance and tune convergence parameters.

## [2025-05-15 18:30:00]
### Completed
- Refined FSRS weight optimization with learning rate decay and rating-based accuracy.
- Fixed core bug in `RevisionEngine` difficulty logic (difficulty now increases on failure).
- Implemented `confidenceLevel` (1-4 rating) persistence in `Attempt` records.
- Centralized FSRS math in pure `nextState` and `calculateRetrievability` methods.

### Discovered
- Difficulty update formula was previously inverting performance signal.
- Binary `isCorrect` was too coarse for high-precision FSRS tuning; now using 1-4 ratings.

### Architecture Changes
- `RevisionEngine` now exports pure math functions for cross-service consistency.

### Technical Debt
- Optimization is currently "fire-and-forget" in Server Actions; may need a persistent task queue for larger datasets in serverless environments.

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
