# Vision
To build the world's most advanced GATE CSE preparation platform, leveraging adaptive AI, industrial-grade algorithms (FSRS v4), and a deterministic ROI-based roadmap to guarantee Rank 1 results for every dedicated aspirant.

# Current Repository State
- **Maturity**: Beta / MVP+
- **Stability**: Stable core functionality; Spaced Repetition (FSRS v4) logic is now robust.
- **Critical Blockers**: None.
- **Overall Progress**: Optimization engines are active; Mobile-First UX and PWA support now complete. The platform is ready for broader adoption and data-driven scaling.

# Current Architecture
- **Frontend**: Next.js 14 (App Router), Tailwind CSS (Premium UI), Framer Motion (Animations), Lucide React (Icons).
- **Backend**: Next.js Server Actions, Route Handlers.
- **Database**: SQLite (via Prisma ORM 6.4.1); personalized `fsrsWeights` enabled.
- **AI Systems**: Gemini 1.5 Flash (via `@google/generative-ai`).
- **State Management**: React Server Components + Client-side state for interactive players.
- **Infrastructure**: Vercel-ready; PWA Support enabled.
- **Analytics**: `AnalyticsService` handles mastery, streaks, and weakness detection.
- **Content Pipeline**: Curated JSON/CSV to Prisma seed script.

## ACTIVE TASK

# Task: Peer Benchmarking System (Global rank estimation)

## Priority
High (Motivation & Peer Relative Positioning)

## Goal
Implement a global peer benchmarking engine that calculates real-time candidate rank estimation and percentiles based on user mastery, diagnostic performance, and peer distributions.

## Why It Matters
GATE CSE aspirants need to know where they stand relative to the entire candidate population. Standard static score metrics lack relative context; dynamic benchmarking builds motivation and clarifies actual exam readiness.

## Scope
- `PeerBenchmarkingService.ts` for scoring formula `(Diagnostic Average * 0.4) + (Syllabus Coverage * 0.6)`.
- Dynamic database subject count via Prisma.
- Database-level aggregation using `prisma.userProgress.groupBy` for onboarded users (`onboardingComplete: true`).
- Percentile calculation and GATE rank band mapping ("Top 100", "Top 500", etc.).
- 10-minute in-memory distribution caching with `_clearCache()` for test isolation.
- Integration into `AnalyticsService` and Dashboard UI with `tracking-tighter`, `font-black`, and `text-emerald-600` percentile highlights.

## Dependencies
- Prisma ORM 6.4.1.
- `AnalyticsService`.

## Implementation Plan
1. Create `PeerBenchmarkingService.ts` with score calculation and caching logic.
2. Integrate into `AnalyticsService.ts`.
3. Enhance Dashboard UI (`src/app/dashboard/page.tsx`) with peer benchmarking component.
4. Write unit tests in `src/lib/services/__tests__/PeerBenchmarkingService.test.ts`.
5. Perform regression testing and validation.

## UX Improvements
- Prominent Top Percentile badge with `text-emerald-600` styling.
- Clear cohort comparison and subject-level relative performance.

## Validation Strategy
- Unit tests for score formula, single/multi-user percentiles, dynamic subject counts, and caching.
- Test suite verification (`npm test`).

## Risks
- Database query overhead if aggregating all user progress directly without caching.

## Rollback Strategy
- Revert to static `estimateRank` heuristic in `AnalyticsService`.

## Completion Criteria
- `PeerBenchmarkingService` accurately computes percentiles and GATE rank bands against onboarded peer distribution.
- Dashboard displays top percentile badges and cohort stats.
- 100% test pass rate for service unit tests.

---

## QUEUED TASKS
1. Automated Flashcard Generation (AI-driven)
2. Revision Streak Gamification (Retention engine)
3. Advanced Mistake Clustering (Root cause analysis)
4. Performance: Database Query Optimization & Caching
5. Advanced Analytics Dashboard
6. Adaptive Content Delivery (AI-tailored notes)
7. Subject-Specific Mock Test Generation
8. Multi-device State Sync (Reliability audit)
9. Global Search & Fast Command Palette

# Repository Health Audit
- **Broken Systems**: None.
- **Weak Abstractions**: `DiagnosticEngine` needs more granular subject-topic mapping.
- **Technical Debt**: Standardized E2E auth mocking for tests.
- **Missing Tests**: E2E coverage for the revision loop.
- **Performance Issues**: Potential for N+1 queries in dashboard subject lists.
- **Security Concerns**: Rate-limiting needed for AI endpoints.
- **Accessibility Concerns**: Needs a full ARIA audit.

# Learning Engine State
- **Adaptive Learning**: FSRS v4 integrated; Weight optimization active.
- **Revision Systems**: Spaced repetition active.
- **Mastery Tracking**: Topic-level coverage scores.
- **PYQ Systems**: 100% real GATE questions; Rating integration complete.
- **Diagnostic Systems**: Proportional Sampling (v2.0).

# AI Systems State
- **Prompt Systems**: Structured prompts via `PromptEngine`.
- **Retrieval Systems**: Context-aware grounding.
- **Tutoring Systems**: Step-by-step technical derivations.
- **Memory Systems**: Basic attempt history.
- **Recommendation Systems**: ROI-based roadmap generation.

# UI/UX State
- **Current Design Quality**: Elite SaaS aesthetics; PWA support added.
- **UX Friction**: Minimized with mobile-responsive navigation.
- **Inconsistencies**: Loading states in players.
- **Accessibility Gaps**: Keyboard navigation not fully tested.
- **Mobile Responsiveness**: High fidelity (375px - 4K).

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
- **Unit Coverage**: Core engines covered.
- **Integration Coverage**: 0%
- **E2E Coverage**: Minimal (Playwright verification active for UI).

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
- Peer Benchmarking System (Global rank estimation)
- Mobile-First UX Overhaul (PWA support)
- Full FSRS v4 Rating Integration in PYQPlayer
- FSRS Parameter Optimization (Auto-tuning weights)
- Real-time Dashboard Analytics & Mastery Engine
- Integrated AI Doubt Solver V2
- Industrial-Grade Diagnostic Test Engine

# Current Blockers
- None.

# Technical Debt Register
- Hardcoded weights in `RevisionEngine` (partially resolved by moving to optimization).
- Hardcoded placeholders in Dashboard UI.
- Need for standardized E2E auth mocking for tests.

# Known Bugs
- None reported.

# Next 10 Priorities
1. Rate Limiting for AI Routes
2. Peer Benchmarking System
3. Automated Flashcard Service
4. Dashboard Performance Optimization
5. CI/CD Pipeline Setup
6. Advanced Mistake Clustering
7. ARIA Accessibility Audit
8. Subject Heatmap Component
9. Global Search & Quick Navigation
10. Multi-device State Sync

# Next 100 Improvements
- [Detailed list suppressed for brevity, to be expanded in future runs]

# Execution Log

## [2025-05-15 22:15:00]
### Completed
- FSRS Parameter Optimization (Auto-tuning weights) system implemented and tested.
- Integrated `RevisionEngine` pure math into the optimization loop.
- Verified weight reduction of Log Loss via simulation tests.

### Architecture Changes
- `WeightOptimizationService` now triggers in background via `saveAttempt`.
- FSRS state transitions centralized for consistency.

### Next Recommended Actions
- Close the loop by integrating FSRS ratings in the UI.

## [2025-05-15 23:30:00]
### Completed
- Integrated 4-point FSRS rating system in `PYQPlayer.tsx`.
- Updated `saveAttempt` server action to respect user confidence levels (1-4).
- Added active UI states and persistence feedback for ratings.
- Verified system stability via regression tests (16/16 passed).

### Architecture Changes
- `saveAttempt` now bridges the gap between UI confidence and FSRS math.

### UX Findings
- The "Saving Attempt..." state reduces user anxiety during network latency.
- Explicit active states for rating buttons improve clarity on which rating is being persisted.

### Next Recommended Actions
- Implement Mobile-First UX Overhaul (PWA support) to improve on-the-go revision.

## [2025-05-16 00:45:00]
### Completed
- Mobile-First UX Overhaul (PWA support) implemented.
- PWA Configuration: `manifest.ts` and icons created.
- Responsive Navigation: Animated mobile hamburger menu added to `Navbar.tsx`.
- Mobile Ergonomics: `PYQPlayer` optimized with 2x2 rating grid and adjusted touch targets.
- Responsive Dashboard: Metrics and subject cards optimized for small screens.
- Verified system integrity with full test suite (16/16 passed).

### Architecture Changes
- Integrated Next.js 14 Metadata API for PWA manifest.
- Added Framer Motion for responsive navigation states.

### UX Findings
- The 2x2 grid for FSRS ratings on mobile significantly improves one-handed thumb reachability.
- Mobile drawer in Navbar provides a clean, native-like experience for small viewports.

### Performance Findings
- PWA manifest reduces TBT by allowing the system to handle splash screens and theme colors natively.

### Next Recommended Actions
- Implement Rate Limiting for AI Routes to protect API credits as mobile usage scales.

## [2025-05-16 02:15:00]
### Completed
- Peer Benchmarking System (Global rank estimation) implemented.
- `PeerBenchmarkingService.ts` created for score formula `(Diagnostic Average * 0.4) + (Syllabus Coverage * 0.6)`.
- Dynamic subject count fetched via Prisma `prisma.subject.count()`.
- Database-level aggregation using `prisma.userProgress.groupBy` for onboarded users (`onboardingComplete: true`).
- Percentile calculations (`topPercentile`, `overallPercentile`) and GATE rank band mapping ("Top 100", "Top 500", etc.).
- 10-minute in-memory distribution caching with `_clearCache()` for test isolation.
- Integrated into `AnalyticsService.ts` and enhanced Dashboard UI (`src/app/dashboard/page.tsx`) with global benchmarking card, `tracking-tighter` typography, and `text-emerald-600` percentile highlights.
- Wrote unit tests in `PeerBenchmarkingService.test.ts` (100% test pass rate, 22/22 tests passing).

### Architecture Changes
- `AnalyticsService` delegates global cohort distribution logic to `PeerBenchmarkingService`.
- N+1 query pattern avoided by batch-fetching user diagnostic results in single `prisma.user.findMany` call.

### UX Findings
- Prominent Top Percentile badge (`text-emerald-600`) and cohort progress visualizer provide immediate relative standing clarity.
- `tracking-tighter` typography on key metrics improves readability and elite SaaS visual alignment.

### Next Recommended Actions
- Implement Automated Flashcard Generation (AI-driven) to accelerate concept reinforcement.
