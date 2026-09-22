# Vision
To build the world's most advanced GATE CSE preparation platform, leveraging adaptive AI, industrial-grade algorithms (FSRS v4), and a deterministic ROI-based roadmap to guarantee Rank 1 results for every dedicated aspirant.

# Current Repository State
- **Maturity**: Beta / MVP+
- **Stability**: High; Spaced Repetition (FSRS v4), Mobile-First PWA, and Peer Benchmarking active.
- **Critical Blockers**: None.
- **Overall Progress**: Dynamic peer benchmarking now fully functional and integrated into the Dashboard Command Center.

# Current Architecture
- **Frontend**: Next.js 14 (App Router), Tailwind CSS (Premium UI), Framer Motion (Animations), Lucide React (Icons).
- **Backend**: Next.js Server Actions, Route Handlers.
- **Database**: SQLite (via Prisma ORM 6.4.1); aggregated score distributions and user progress tracking enabled.
- **AI Systems**: Gemini 1.5 Flash (via `@google/generative-ai`).
- **State Management**: React Server Components + Client-side state for interactive players.
- **Infrastructure**: Vercel-ready; PWA Support enabled.
- **Analytics**: `AnalyticsService` + `PeerBenchmarkingService` for real-time mastery, streaks, and global peer rank/percentile distribution.
- **Content Pipeline**: Curated JSON/CSV to Prisma seed script.

## ACTIVE TASK

# Task: Automated Flashcard Generation (AI-driven)

## Priority
High (Active Recall & Memory Retention)

## Goal
Implement an AI-driven automated flashcard generation system that creates bite-sized, active recall flashcards from topic summaries and PYQ mistake patterns to accelerate concept retention.

## Why It Matters
Active recall is the single most effective study technique for complex GATE concepts (like OS paging, COA cache mapping, algorithms time complexity). Automated AI generation turns passive notes into active recall flashcards instantly.

## Scope
- Design JSON schema for Flashcards.
- Implement `FlashcardService.ts` for AI prompt generation and retrieval.
- Create interactive Flashcard Deck UI component with flip animations and active recall confidence ratings.
- Integrate flashcard generation into topic detail pages.

## Dependencies
- `@google/generative-ai` (Gemini 1.5 Flash).
- Framer Motion for 3D card flip effects.

## Implementation Plan
1. Define Prisma/JSON models for Flashcards.
2. Build `FlashcardService` to parse topic summaries into active recall pairs.
3. Build responsive `FlashcardPlayer` component with Framer Motion 3D card flips.
4. Integrate into `src/app/topic/[slug]/page.tsx`.
5. Write unit tests for `FlashcardService`.

## UX Improvements
- Smooth 3D card flip transitions.
- High-contrast rating buttons (Again, Hard, Good, Easy).
- Touch and gesture support for mobile.

## Validation Strategy
- Unit test prompt creation and response parsing.
- Visual verification using Playwright screenshots.

## Risks
- API latency or quota limits from generative model.

## Rollback Strategy
- Fall back to static pre-computed flashcards from `TopicSummary`.

## Completion Criteria
- AI flashcard generation endpoint functional.
- Interactive card deck UI complete with animations.
- Unit tests passing.

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
9. Global Search & Quick Navigation

# Repository Health Audit
- **Broken Systems**: None.
- **Weak Abstractions**: `DiagnosticEngine` needs more granular subject-topic mapping.
- **Technical Debt**: Standardized E2E auth mocking for tests.
- **Missing Tests**: E2E coverage for the revision loop.
- **Performance Issues**: Potential for N+1 queries in dashboard subject lists (partially optimized via aggregate queries).
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
- **Current Design Quality**: Elite SaaS aesthetics; Dashboard peer rank card and percentile badge active.
- **UX Friction**: Minimized with mobile-responsive navigation.
- **Inconsistencies**: Loading states in players.
- **Accessibility Gaps**: Keyboard navigation not fully tested.
- **Mobile Responsiveness**: High fidelity (375px - 4K).

# Performance State
- **Bundle Size**: Optimized by Next.js defaults.
- **Rendering**: Static/Dynamic hybrid.
- **API Latency**: Low (direct Prisma calls).
- **Query Bottlenecks**: None at current scale.
- **Caching**: 10-minute in-memory cache active for peer benchmarking distributions.

# Security State
- **Auth Systems**: Auth.js (v5 beta) with JWT.
- **Validation Coverage**: Zod/Prisma validation.
- **Vulnerabilities**: None known.
- **Secrets Handling**: `.env.example` provided.
- **Rate Limiting**: Missing for AI endpoints.

# Testing State
- **Unit Coverage**: Core engines and services covered (20/20 unit tests passing).
- **Integration Coverage**: 0%
- **E2E Coverage**: Visual Playwright verification active for UI.

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
4. Advanced Mistake Clustering
5. AI Doubt Solver V2 Enhancements
6. Adaptive Content Delivery
7. Subject-Specific Mock Test Generation
8. Performance: Database Query Optimization & Caching
9. Multi-device State Sync
10. Automated Revision Notes Generation

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
- Implement Peer Benchmarking System (Global rank estimation) to provide dynamic peer feedback on Dashboard.

## [2025-05-16 02:15:00]
### Completed
- Implemented `PeerBenchmarkingService.ts` for relative global peer ranking and percentile calculation.
- Integrated composite scoring formula `(Diagnostic Average * 0.4) + (Syllabus Coverage * 0.6)`.
- Added 10-minute in-memory caching mechanism for global distribution aggregations with `_clearCache()` test helper.
- Integrated `PeerBenchmarkingService` into `AnalyticsService.getOverallStats`.
- Updated Dashboard UI Command Center (`src/app/dashboard/page.tsx`) with global rank estimation card, peer percentile badge, subValue context labels, and elite typography (`tracking-tighter`, `font-black`, `text-emerald-600`).
- Added comprehensive unit test suite in `PeerBenchmarkingService.test.ts` (4/4 passed) and updated `AnalyticsService.test.ts` (8/8 passed). Total test suite: 20/20 passed.
- Verified frontend rendering visually with Playwright screenshot (`dashboard_peer_benchmarking.png`).

### Architecture Changes
- Added database-level aggregation via `prisma.userProgress.groupBy` in `PeerBenchmarkingService` to scale global distribution calculation.
- Expanded `DashboardStats` interface in `AnalyticsService` to return `peerBenchmark` result object.

### UX Findings
- Displaying percentile bands (e.g. "Top 50%") alongside global rank estimation provides clear motivational feedback for aspirants.
- Contextual subValue labels under metric cards give immediate clarity without overcrowding the dashboard interface.

### Performance Findings
- 10-minute in-memory cache avoids repetitive expensive database joins across all onboarded users on every dashboard load.

### Next Recommended Actions
- Implement Automated Flashcard Generation (AI-driven) to boost active recall retention for key concepts.
