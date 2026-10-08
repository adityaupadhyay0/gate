# Vision
To build the world's most advanced GATE CSE preparation platform, leveraging adaptive AI, industrial-grade algorithms (FSRS v4), and a deterministic ROI-based roadmap to guarantee Rank 1 results for every dedicated aspirant.

# Current Repository State
- **Maturity**: Beta / MVP+
- **Stability**: Stable core functionality; Rate Limiting and Spaced Repetition (FSRS v4) logic are robust.
- **Critical Blockers**: None.
- **Overall Progress**: Optimization engines are active; AI endpoint rate limiting and PWA mobile experience complete. Ready for peer benchmarking and global rank estimation.

# Current Architecture
- **Frontend**: Next.js 14 (App Router), Tailwind CSS (Premium UI), Framer Motion (Animations), Lucide React (Icons).
- **Backend**: Next.js Server Actions, Route Handlers.
- **Database**: SQLite (via Prisma ORM 6.4.1); `RateLimit` model and personalized `fsrsWeights` enabled.
- **AI Systems**: Gemini 1.5 Flash (via `@google/generative-ai`) with `RateLimitService` protection.
- **State Management**: React Server Components + Client-side state for interactive players.
- **Infrastructure**: Vercel-ready; PWA Support enabled.
- **Analytics**: `AnalyticsService` handles mastery, streaks, and weakness detection.
- **Content Pipeline**: Curated JSON/CSV to Prisma seed script.

## ACTIVE TASK

# Task: Peer Benchmarking System (Global rank estimation)

## Priority
High (Motivation & Realistic Assessment)

## Goal
Provide aspirants with real-time cohort position calculations and dynamic global rank projections based on mastery level, accuracy, and topic coverage.

## Why It Matters
Aspirants need clear feedback on how their performance compares with the competitive GATE cohort to adjust study intensity and target weaknesses effectively.

## Scope
- Global percentile calculation engine.
- Cohort distribution model and mock benchmark comparison.
- Visual percentile badge & rank distribution card on Dashboard.

## Dependencies
- `AnalyticsService` mastery metrics.
- Prisma user aggregation queries.

## Implementation Plan
1. Design `PeerBenchmarkingService` for percentiles and target score calculations.
2. Integrate benchmarking data into Dashboard layout.
3. Write unit tests for score distribution math and tier boundaries.
4. Verify user rank responsiveness.

## UX Improvements
- Interactive rank distribution graph.
- Clear percentile pill indicators ("Top 5%", "Top 15%").

## Validation Strategy
- Unit tests for benchmark calculation math.
- End-to-end verification of dashboard rendering.

## Risks
- Data skew with small user sample sizes.

## Rollback Strategy
- Fallback to static tier estimates in `AnalyticsService.estimateRank`.

## Completion Criteria
- Aspirants receive real-time percentile and dynamic estimated GATE rank.

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
- **Security Concerns**: None active (Rate limiting active for AI routes).
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
- **Tutoring Systems**: Step-by-step technical derivations (Gemini 1.5 Flash).
- **Memory Systems**: Basic attempt history.
- **Recommendation Systems**: ROI-based roadmap generation.
- **Protection Systems**: `RateLimitService` enforces 10 req/10 min quota per user.

# UI/UX State
- **Current Design Quality**: Elite SaaS aesthetics; PWA support and AI quota notice cards added.
- **UX Friction**: Minimized with mobile-responsive navigation.
- **Inconsistencies**: Loading states in players.
- **Accessibility Gaps**: Keyboard navigation not fully tested.
- **Mobile Responsiveness**: High fidelity (375px - 4K).

# Performance State
- **Bundle Size**: Optimized by Next.js defaults.
- **Rendering**: Static/Dynamic hybrid.
- **API Latency**: Low (direct Prisma calls with indexed rate limits).
- **Query Bottlenecks**: None at current scale.
- **Caching**: Minimal.

# Security State
- **Auth Systems**: Auth.js (v5 beta) with JWT.
- **Validation Coverage**: Zod/Prisma validation.
- **Vulnerabilities**: None known.
- **Secrets Handling**: `.env.example` provided.
- **Rate Limiting**: Enforced via DB-backed `RateLimitService` on AI routes.

# Testing State
- **Unit Coverage**: Core engines and `RateLimitService` covered (21/21 passed).
- **Integration Coverage**: API route tests included.
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
- Rate Limiting for AI Routes
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
2. Automated Flashcard Service
3. Revision Streak Gamification
4. Advanced Mistake Clustering
5. Dashboard Performance Optimization
6. CI/CD Pipeline Setup
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

## [2025-05-16 02:00:00]
### Completed
- Rate Limiting for AI Routes implemented.
- Added `RateLimit` model to Prisma schema with indexed `key` and `expiresAt` fields.
- Created `RateLimitService` (`src/lib/services/RateLimitService.ts`) enforcing sliding/fixed window rate limits (default 10 requests per 10 minutes).
- Updated `/api/ai/explain` route to enforce rate limits per authenticated user and attach standard HTTP headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `Retry-After`).
- Updated `PYQPlayer.tsx` to handle 429 response status and display warning-styled quota notice cards with Gemini 1.5 Flash provider labeling.
- Added comprehensive unit tests in `src/lib/services/__tests__/RateLimitService.test.ts`. All 21 tests pass.

### Architecture Changes
- Database-backed rate limiting via `RateLimitService` prevents API token exhaustion without requiring external Redis instances for local/SQLite deployments.
- `/api/ai/explain` route returns standard HTTP 429 status and rate limit headers.

### UX Findings
- Clear warning notice in `PYQPlayer` when quota is exceeded helps students understand the limit without confusing it for a broken application error.

### Next Recommended Actions
- Implement Peer Benchmarking System (Global rank estimation) to provide students with dynamic cohort percentiles.
