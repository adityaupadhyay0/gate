# Vision
To build the world's most advanced GATE CSE preparation platform, leveraging adaptive AI, industrial-grade algorithms (FSRS v4), and a deterministic ROI-based roadmap to guarantee Rank 1 results for every dedicated aspirant.

# Current Repository State
- **Maturity**: Beta / MVP+
- **Stability**: Stable core functionality; Spaced Repetition (FSRS v4) and Peer Benchmarking engines active.
- **Critical Blockers**: None.
- **Overall Progress**: Optimization engines are active; Mobile-First UX and Peer Benchmarking with global rank estimation are complete.

# Current Architecture
- **Frontend**: Next.js 14 (App Router), Tailwind CSS (Premium UI), Framer Motion (Animations), Lucide React (Icons).
- **Backend**: Next.js Server Actions, Route Handlers.
- **Database**: SQLite (via Prisma ORM 6.4.1); personalized `fsrsWeights` and aggregated progress tracking.
- **AI Systems**: Gemini 1.5 Flash (via `@google/generative-ai`).
- **State Management**: React Server Components + Client-side state for interactive players.
- **Infrastructure**: Vercel-ready; PWA Support enabled.
- **Analytics**: `AnalyticsService` & `PeerBenchmarkingService` handle mastery, peer percentiles, streaks, and weakness detection.
- **Content Pipeline**: Curated JSON/CSV to Prisma seed script.

## ACTIVE TASK

# Task: Automated Flashcard Generation (AI-driven)

## Priority
High (Active Recall & Memory Retention)

## Goal
Automatically generate high-yield active recall flashcards from topic concepts and incorrect PYQ attempts using AI.

## Why It Matters
Active recall is proven to be the most effective strategy for long-term retention in GATE CSE. Dynamically generated flashcards tailored to a student's weak points create an optimal learning loop.

## Scope
- AI Flashcard generation service using Gemini Flash.
- Integration with user mistake logs and topic summaries.
- Interactive Flashcard Review UI component.
- Progress & mastery tracking for flashcard decks.

## Dependencies
- `@google/generative-ai` for flashcard synthesis.
- Framer Motion for card flip and swipe animations.

## Implementation Plan
1. Create `FlashcardService` for generating and retrieving active recall cards.
2. Build interactive `FlashcardDeck` component with motion flips.
3. Integrate mistake-driven flashcard queue on Revision page.
4. Add unit and integration test coverage.

## UX Improvements
- Smooth 3D card flip transitions.
- Quick rating inputs (Easy, Good, Hard).
- Ergonomic keyboard shortcuts (Space to flip, 1-3 to rate).

## Validation Strategy
- Unit tests for flashcard parsing and generation fallback.
- E2E Playwright verification for card flip interactions.

## Risks
- Generative AI latency during flashcard creation.

## Rollback Strategy
- Fallback to pre-computed static flashcards from topic summaries.

## Completion Criteria
- AI generates structured active recall flashcards on demand.
- Flashcard review UI runs smoothly on desktop and mobile.

---

## QUEUED TASKS
1. Revision Streak Gamification (Retention engine)
2. Advanced Mistake Clustering (Root cause analysis)
3. Performance: Database Query Optimization & Caching
4. Advanced Analytics Dashboard
5. Adaptive Content Delivery (AI-tailored notes)
6. Subject-Specific Mock Test Generation
7. Multi-device State Sync (Reliability audit)
8. Global Search & Fast Command Palette
9. Diagnostic Test Granularity & Subject Heatmaps

# Repository Health Audit
- **Broken Systems**: None.
- **Weak Abstractions**: `DiagnosticEngine` needs more granular subject-topic mapping.
- **Technical Debt**: Standardized E2E auth mocking for tests.
- **Missing Tests**: E2E coverage for the revision loop.
- **Performance Issues**: Minimal (Database-level `groupBy` aggregation implemented for benchmarking).
- **Security Concerns**: Rate-limiting needed for AI endpoints.
- **Accessibility Concerns**: Needs a full ARIA audit.

# Learning Engine State
- **Adaptive Learning**: FSRS v4 integrated; Weight optimization active.
- **Revision Systems**: Spaced repetition active.
- **Mastery Tracking**: Topic-level coverage scores and global peer percentiles.
- **PYQ Systems**: 100% real GATE questions; Rating integration complete.
- **Diagnostic Systems**: Proportional Sampling (v2.0).

# AI Systems State
- **Prompt Systems**: Structured prompts via `PromptEngine`.
- **Retrieval Systems**: Context-aware grounding.
- **Tutoring Systems**: Step-by-step technical derivations.
- **Memory Systems**: Attempt history and peer benchmarking.
- **Recommendation Systems**: ROI-based roadmap generation.

# UI/UX State
- **Current Design Quality**: Elite SaaS aesthetics; Peer Benchmarking card added to Command Center.
- **UX Friction**: Minimized with mobile-responsive navigation and real-time standing cards.
- **Inconsistencies**: Loading states in players.
- **Accessibility Gaps**: Keyboard navigation not fully tested.
- **Mobile Responsiveness**: High fidelity (375px - 4K).

# Performance State
- **Bundle Size**: Optimized by Next.js defaults.
- **Rendering**: Static/Dynamic hybrid.
- **API Latency**: Low (direct Prisma calls & 10-min in-memory caching).
- **Query Bottlenecks**: None (`prisma.userProgress.groupBy` handles global distributions).
- **Caching**: 10-minute in-memory distribution cache active.

# Security State
- **Auth Systems**: Auth.js (v5 beta) with JWT.
- **Validation Coverage**: Zod/Prisma validation.
- **Vulnerabilities**: None known.
- **Secrets Handling**: `.env.example` provided.
- **Rate Limiting**: Missing for AI endpoints.

# Testing State
- **Unit Coverage**: 21 passed unit tests covering core engines, analytics, and benchmarking.
- **Integration Coverage**: 0%
- **E2E Coverage**: Minimal (Playwright verification active for UI).

# Content Expansion State
- **Completed Topics**: 95 Topics across 12 subjects.
- **Missing Topics**: None (Syllabus complete).
- **Weak Explanations**: Some curated explanations are oneliners.
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
- Need for standardized E2E auth mocking for tests.

# Known Bugs
- None reported.

# Next 10 Priorities
1. Automated Flashcard Service
2. Revision Streak Gamification
3. Advanced Mistake Clustering
4. Database Query Optimization & Caching
5. CI/CD Pipeline Setup
6. ARIA Accessibility Audit
7. Subject Heatmap Component
8. Global Search & Quick Navigation
9. Multi-device State Sync
10. Adaptive Content Delivery

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
- Peer Benchmarking System (Global rank estimation) implemented and integrated.
- Created `PeerBenchmarkingService.ts` using formula `(Diagnostic Average * 0.4) + (Syllabus Coverage * 0.6)`.
- Leveraged `prisma.userProgress.groupBy` for database-level aggregation to prevent OOM errors on large user distributions.
- Integrated dynamic subject count from database (`prisma.subject.count()`).
- Restricted global peer distribution to users with `onboardingComplete: true`.
- Added 10-minute in-memory distribution caching with `_clearCache()` test isolation helper.
- Built `PeerBenchmarkingCard.tsx` component with elite SaaS design: `tracking-tighter`, `font-black`, and `text-emerald-600` percentile highlights.
- Integrated benchmarking into `AnalyticsService.getOverallStats` and rendered on Command Center dashboard.
- Written comprehensive unit test suite in `PeerBenchmarkingService.test.ts` (5 tests) and updated `AnalyticsService.test.ts` (all 21 unit tests passed).

### Architecture Changes
- `PeerBenchmarkingService` provides real-time percentile and rank estimation across active users.
- `AnalyticsService` now delegates global rank estimation to `PeerBenchmarkingService`.

### Performance Findings
- In-memory 10-minute cache reduces database load from global score queries to O(1) on cached hits.
- `prisma.userProgress.groupBy` handles global user distributions at database level.

### UX Findings
- The Peer Benchmarking card on Command Center gives clear visibility into standing (Top X%), composite score, and performance vs peer average.
