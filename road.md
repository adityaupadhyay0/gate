# Vision
To build the world's most advanced GATE CSE preparation platform, leveraging adaptive AI, industrial-grade algorithms (FSRS v4), and a deterministic ROI-based roadmap to guarantee Rank 1 results for every dedicated aspirant.

# Current Repository State
- **Maturity**: Beta / MVP+
- **Stability**: Stable core functionality; Spaced Repetition (FSRS v4) logic is now robust.
- **Critical Blockers**: None.
- **Overall Progress**: Rate limiting for AI routes is now fully implemented and verified. The platform is ready for the Peer Benchmarking System.

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
High (Motivation & Gamification)

## Goal
Implement a system that allows users to compare their performance with peers, providing a simulated "Global Rank" based on diagnostic tests and FSRS mastery scores.

## Why It Matters
GATE is a competitive exam where relative performance is everything. A benchmarking system provides aspirants with a realistic view of their standing, driving healthy competition and increased engagement.

## Scope
- Global aggregation of user mastery scores.
- Percentile calculation logic.
- Rank estimation algorithm.
- Dashboard visualization for global standing.

## Dependencies
- `AnalyticsService` for performance data.
- Aggregation queries in Prisma.

## Implementation Plan
1. Research percentile calculation methods for sparse datasets.
2. Implement backend service for rank estimation.
3. Add global statistics tracking in the database.
4. Build rank visualization components for the dashboard.
5. Integrate with the existing mastery engine.

## UX Improvements
- Cinematic rank reveal animations.
- Relative performance heatmaps.

## Validation Strategy
- Simulation tests with mock user populations.
- Accuracy verification against known performance distributions.

## Risks
- Data privacy concerns (mitigated by using anonymized percentiles).
- Performance impact of heavy aggregation queries.

## Rollback Strategy
- Feature flag to disable rank display.

## Completion Criteria
- User sees their estimated global rank and percentile on the dashboard.
- Rankings update periodically based on fresh performance data.

---

## QUEUED TASKS
1. Deep Learning Recommendation Engine
2. Real-time Collaborative Study Rooms
3. Formula & Cheat Sheet Generator
4. Spaced Repetition for Formulas
5. Advanced Analytics V2
6. Automated PYQ Tagging System
7. Mock Test Series Engine
8. AI Tutor Memory Integration
9. Concept Mastery Visualization

# Repository Health Audit
- **Broken Systems**: None.
- **Weak Abstractions**: `DiagnosticEngine` needs more granular subject-topic mapping.
- **Technical Debt**: Standardized E2E auth mocking for tests.
- **Missing Tests**: E2E coverage for the revision loop.
- **Performance Issues**: Potential for N+1 queries in dashboard subject lists.
- **Security Concerns**: None (Rate limiting for AI endpoints implemented).
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
- **Inconsistencies**: None major.
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
- **Rate Limiting**: Implemented for AI routes (20 req/24h).

# Testing State
- **Unit Coverage**: Core engines and services (RateLimitService) covered.
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
- **Architecture Ideas**: Move heavy aggregation jobs to a background task runner.

# Recently Completed Tasks
- Rate Limiting for AI Routes (20 requests/24h)
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
1. Peer Benchmarking System
2. Deep Learning Recommendation Engine
3. Real-time Collaborative Study Rooms
4. Formula & Cheat Sheet Generator
5. Spaced Repetition for Formulas
6. Advanced Analytics V2
7. Automated PYQ Tagging System
8. Mock Test Series Engine
9. AI Tutor Memory Integration
10. Concept Mastery Visualization

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

## [2025-05-16 02:45:00]
### Completed
- Rate Limiting for AI Routes (20 requests/24h) fully implemented.
- Added `RateLimit` model to Prisma schema.
- Developed `RateLimitService` with window-based (24h) reset logic.
- Integrated rate limiting into `/api/ai/explain` with `X-RateLimit-*` headers.
- Enhanced `PYQPlayer` UI to handle 429 status codes and display 'Limit Reached' state.
- Verified implementation with unit tests and Playwright visual E2E scripts.

### Architecture Changes
- Introduced `RateLimitService` for centralized usage tracking.
- Centralized AI constants in `src/lib/config/ai.ts`.

### UX Findings
- Informative "Limit Reached" UI blocks prevent user confusion when API calls fail due to quotas.
- Proper header tracking allows for future client-side budget indicators.

### AI Improvements
- Protection against automated credit drain ensures the platform remains sustainable.

### Next Recommended Actions
- Implement Peer Benchmarking System to drive competitive motivation.
