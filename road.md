# Vision
To build the world's most advanced GATE CSE preparation platform, leveraging adaptive AI, industrial-grade algorithms (FSRS v4), and a deterministic ROI-based roadmap to guarantee Rank 1 results for every dedicated aspirant.

# Current Repository State
- **Maturity**: Beta / MVP+
- **Stability**: Stable core functionality; Spaced Repetition (FSRS v4) and Peer Benchmarking logic are robust.
- **Critical Blockers**: None.
- **Overall Progress**: Optimization engines and global benchmarking active; PWA support enabled. Ready for automated AI content generation features.

# Current Architecture
- **Frontend**: Next.js 14 (App Router), Tailwind CSS (Premium UI), Framer Motion (Animations), Lucide React (Icons).
- **Backend**: Next.js Server Actions, Route Handlers.
- **Database**: SQLite (via Prisma ORM 6.4.1); personalized `fsrsWeights` and progress aggregation active.
- **AI Systems**: Gemini 1.5 Flash (via `@google/generative-ai`).
- **State Management**: React Server Components + Client-side state for interactive players.
- **Infrastructure**: Vercel-ready; PWA Support enabled.
- **Analytics**: `AnalyticsService` and `PeerBenchmarkingService` handle mastery, streaks, weakness detection, and peer benchmarking.
- **Content Pipeline**: Curated JSON/CSV to Prisma seed script.

## ACTIVE TASK

# Task: Automated Flashcard Generation (AI-driven)

## Priority
High (Active Recall & Learning Velocity)

## Goal
Automatically generate high-yield, active recall flashcard decks from topic summaries and PYQ patterns using AI to accelerate concept retention.

## Why It Matters
Active recall via flashcards combined with FSRS v4 spaced repetition significantly enhances long-term memory retention for formula-heavy and concept-dense GATE topics.

## Scope
- Flashcard data model or JSON schema for active recall cards.
- AI prompt engineering in `PromptEngine` for generating atomic flashcards.
- Service implementation to generate, store, and serve topic flashcards.
- Flashcard revision player UI with flip animation and confidence rating integration.

## Dependencies
- `@google/generative-ai`.
- FSRS v4 rating engine.

## Implementation Plan
1. Define flashcard generation schema and prompts.
2. Build `FlashcardService` to parse AI output and structure cards.
3. Build interactive flashcard UI component with smooth flip transitions.
4. Integrate with revision loop and test with Vitest.

## UX Improvements
- Fluid 3D card flips using Framer Motion and high-contrast typography.

## Validation Strategy
- Unit tests for JSON parsing and schema validation of AI flashcards.
- Playwright E2E verification of card interaction.

## Risks
- Hallucinated or ambiguous flashcard QA pairs (mitigated by strict schema & prompt grounding).

## Rollback Strategy
- Fallback to pre-curated key formulas and summaries.

## Completion Criteria
- AI generates valid 5-10 atomic flashcards per topic.
- Flashcard player allows flipping, reviewing, and scoring retention.
- All unit tests pass.

---

## QUEUED TASKS
1. Revision Streak Gamification (Retention engine)
2. Advanced Mistake Clustering (Root cause analysis)
3. Performance: Database Query Optimization & Caching
4. Advanced Analytics Dashboard
5. Adaptive Content Delivery (AI-tailored notes)
6. Subject-Specific Mock Test Generation
7. Multi-device State Sync (Reliability audit)
8. Automated Revision Notes Generation
9. Rate Limiting for AI Routes

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
- **Revision Systems**: Spaced repetition active; Peer Benchmarking active.
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
- **Current Design Quality**: Elite SaaS aesthetics; Peer Benchmarking highlights added.
- **UX Friction**: Minimized with mobile-responsive navigation.
- **Inconsistencies**: Loading states in players.
- **Accessibility Gaps**: Keyboard navigation not fully tested.
- **Mobile Responsiveness**: High fidelity (375px - 4K).

# Performance State
- **Bundle Size**: Optimized by Next.js defaults.
- **Rendering**: Static/Dynamic hybrid.
- **API Latency**: Low (direct Prisma calls).
- **Query Bottlenecks**: None at current scale; 10-min caching on peer benchmarking.
- **Caching**: 10-minute in-memory distribution cache in `PeerBenchmarkingService`.

# Security State
- **Auth Systems**: Auth.js (v5 beta) with JWT.
- **Validation Coverage**: Zod/Prisma validation.
- **Vulnerabilities**: None known.
- **Secrets Handling**: `.env.example` provided.
- **Rate Limiting**: Missing for AI endpoints.

# Testing State
- **Unit Coverage**: Core engines and services covered (21/21 passing tests).
- **Integration Coverage**: 0%
- **E2E Coverage**: Playwright verification active for UI.

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
1. Peer Benchmarking System
2. Automated Flashcard Generation
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
- The 2x2 grid for FSRS ratings on mobile significantly improves one-handed thumb reachability.
- Mobile drawer in Navbar provides a clean, native-like experience for small viewports.

### Performance Findings
- PWA manifest reduces TBT by allowing the system to handle splash screens and theme colors natively.

### Next Recommended Actions
- Implement Rate Limiting for AI Routes to protect API credits as mobile usage scales.

## [2025-05-16 02:15:00]
### Completed
- Peer Benchmarking System (Global rank estimation) implemented and tested.
- `PeerBenchmarkingService.ts` calculates benchmark scores using formula `(Diagnostic Average * 0.4) + (Syllabus Coverage * 0.6)` with dynamic subject count.
- Integrated database-level mastery aggregation via `prisma.userProgress.groupBy` for scalability over onboarded users.
- Calculated rank and top percentile (`rank === 1 ? 1 : Math.max(1, Math.min(100, Math.round((rank / totalUsers) * 100)))`).
- Added 10-minute in-memory caching with `_clearCache()` test helper.
- Integrated with `AnalyticsService` and updated `DashboardPage` UI with `tracking-tighter`, `font-black`, `subValue` rank details, and `text-emerald-600` percentile display.
- Fixed unescaped JSX `>` character in `DiagnosticTestClient.tsx`.
- Verified 21/21 Vitest unit tests pass and Next.js production build succeeds.

### Architecture Changes
- `AnalyticsService.getOverallStats` now queries `PeerBenchmarkingService.getUserBenchmark` in parallel with other dashboard metrics.
- Added 10-minute distribution caching to prevent excessive DB aggregation queries.

### UX Findings
- Displaying 'Top X%' with explicit rank context (`Rank #1 of N`) provides clear relative performance visibility for GATE aspirants.

### Performance Findings
- Using `prisma.userProgress.groupBy` reduces memory overhead during user distribution calculation.

### Next Recommended Actions
- Proceed to Automated Flashcard Generation (AI-driven).
