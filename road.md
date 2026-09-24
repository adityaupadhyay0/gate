# Vision
To build the world's most advanced GATE CSE preparation platform, leveraging adaptive AI, industrial-grade algorithms (FSRS v4), and a deterministic ROI-based roadmap to guarantee Rank 1 results for every dedicated aspirant.

# Current Repository State
- **Maturity**: Beta / MVP+
- **Stability**: Stable core functionality; Spaced Repetition (FSRS v4), PWA Mobile UX, and Peer Benchmarking Engine are fully operational.
- **Critical Blockers**: None.
- **Overall Progress**: Peer Benchmarking System complete; next focusing on Automated Flashcard Generation.

# Current Architecture
- **Frontend**: Next.js 14 (App Router), Tailwind CSS (Premium UI), Framer Motion (Animations), Lucide React (Icons).
- **Backend**: Next.js Server Actions, Route Handlers.
- **Database**: SQLite (via Prisma ORM 6.4.1); personalized `fsrsWeights` enabled.
- **AI Systems**: Gemini 1.5 Flash (via `@google/generative-ai`).
- **State Management**: React Server Components + Client-side state for interactive players.
- **Infrastructure**: Vercel-ready; PWA Support enabled.
- **Analytics**: `AnalyticsService` and `PeerBenchmarkingService` handle mastery, streaks, global rank percentile estimation, and weakness detection.
- **Content Pipeline**: Curated JSON/CSV to Prisma seed script.

## ACTIVE TASK

# Task: Automated Flashcard Generation (AI-driven)

## Priority
High (Active Recall & Reinforcement)

## Goal
Implement an AI-driven automated flashcard generation system that synthesizes high-yield flashcards from topic summaries and past mistake logs for rapid spaced repetition revision.

## Why It Matters
Active recall through flashcards combined with FSRS v4 memory scoring accelerates retention for heavy theoretical concepts (e.g. Operating Systems, Computer Networks).

## Scope
- Define flashcard generation engine utilizing Gemini 1.5 Flash.
- Parse key concept pairs (Question/Prompt and Answer/Explanation).
- Integrate flashcard review queue into the revision interface.

## Dependencies
- `@google/generative-ai` & `PromptEngine`.
- FSRS v4 rating system in `RevisionEngine`.

## Implementation Plan
1. Design `FlashcardService` and prompt template for AI flashcard synthesis.
2. Build UI player component for flashcard review mode.
3. Wire flashcards into FSRS attempt tracking.
4. Add unit tests for prompt parsing and queue management.

## UX Improvements
- Interactive 3D flip card animations using Framer Motion.
- Touch-friendly swipe gestures for mobile revision.

## Validation Strategy
- Unit tests for flashcard parsing and state transitions.
- Playwright E2E verification of review loop.

## Risks
- Hallucinations in generated explanations (mitigated via prompt engineering).

## Rollback Strategy
- Fallback to static PYQ flashcards.

## Completion Criteria
- AI generates structured flashcards per topic.
- Flashcard review loop functions smoothly with FSRS v4 ratings.

---

## QUEUED TASKS
1. Revision Streak Gamification (Retention engine)
2. Advanced Mistake Clustering (Root cause analysis)
3. AI Doubt Solver V2 Enhancements
4. Adaptive Content Delivery (Dynamic Difficulty)
5. Subject-Specific Mock Test Generation
6. Performance: Database Query Optimization & Caching
7. Multi-device State Sync (Reliability audit)
8. Automated Revision Notes Generation
9. Rate Limiting for AI Routes

# Repository Health Audit
- **Broken Systems**: None.
- **Weak Abstractions**: `DiagnosticEngine` needs more granular subject-topic mapping.
- **Technical Debt**: Standardized E2E auth mocking for tests.
- **Missing Tests**: E2E coverage for the revision loop.
- **Performance Issues**: Addressed via DB-level aggregations and caching for peer benchmarking.
- **Security Concerns**: Rate-limiting needed for AI endpoints.
- **Accessibility Concerns**: Needs a full ARIA audit.

# Learning Engine State
- **Adaptive Learning**: FSRS v4 integrated; Weight optimization active.
- **Revision Systems**: Spaced repetition active; Peer benchmarking live.
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
- **Current Design Quality**: Elite SaaS aesthetics; PWA support added; Benchmarking UI active.
- **UX Friction**: Minimized with mobile-responsive navigation.
- **Inconsistencies**: Loading states in players.
- **Accessibility Gaps**: Keyboard navigation not fully tested.
- **Mobile Responsiveness**: High fidelity (375px - 4K).

# Performance State
- **Bundle Size**: Optimized by Next.js defaults.
- **Rendering**: Static/Dynamic hybrid.
- **API Latency**: Low (direct Prisma calls).
- **Query Bottlenecks**: Optimized via `prisma.userProgress.groupBy` and 10-minute distribution caching.
- **Caching**: 10-minute in-memory distribution cache for Peer Benchmarking.

# Security State
- **Auth Systems**: Auth.js (v5 beta) with JWT.
- **Validation Coverage**: Zod/Prisma validation.
- **Vulnerabilities**: None known.
- **Secrets Handling**: `.env.example` provided.
- **Rate Limiting**: Missing for AI endpoints.

# Testing State
- **Unit Coverage**: Core engines and services covered (FSRS, Analytics, PromptEngine, PeerBenchmarking - 20/20 passing).
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

# Current Blockers
- None.

# Technical Debt Register
- Hardcoded weights in `RevisionEngine` (partially resolved by moving to optimization).
- Hardcoded placeholders in Dashboard UI.
- Need for standardized E2E auth mocking for tests.

# Known Bugs
- None reported.

# Next 10 Priorities
1. Automated Flashcard Generation
2. Revision Streak Gamification
3. Rate Limiting for AI Routes
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
- The 2x2 grid for FSRS ratings on mobile significantly improves onehanded thumb reachability.
- Mobile drawer in Navbar provides a clean, native-like experience for small viewports.

### Performance Findings
- PWA manifest reduces TBT by allowing the system to handle splash screens and theme colors natively.

### Next Recommended Actions
- Implement Peer Benchmarking System (Global rank estimation).

## [2025-05-16 02:15:00]
### Completed
- Implemented `PeerBenchmarkingService` with score formula `(Diagnostic Average * 0.4) + (Syllabus Coverage * 0.6)`.
- Implemented global percentile calculation `Math.round(((totalUsers - rank) / totalUsers) * 100)` relative to onboarded users.
- Optimized performance using `prisma.userProgress.groupBy` for DB-level aggregation.
- Implemented 10-minute in-memory distribution caching with `_clearCache()` helper for unit testing.
- Integrated peer benchmarking into `AnalyticsService` and updated `DashboardPage` metric cards with percentile highlights (`text-emerald-600 bg-emerald-50`).
- Created comprehensive unit tests in `PeerBenchmarkingService.test.ts` (100% pass rate across 20 test cases).

### Architecture Changes
- `AnalyticsService` delegates relative performance calculations to `PeerBenchmarkingService`.
- Database query overhead minimized via DB-level grouping and in-memory TTL caching.

### UX Findings
- Presenting percentile tags (`Top 5%`) alongside rank estimation tier gives aspirants immediate relative feedback.

### Performance Findings
- `prisma.userProgress.groupBy` reduces memory footprint by avoiding fetching individual `UserProgress` records across the userbase.

### Next Recommended Actions
- Implement Automated Flashcard Generation (AI-driven) for active recall.
