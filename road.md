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
Medium (Retention & Gamification)

## Goal
Implement a real-time benchmarking system that allows users to see their progress relative to the entire cohort of GATE aspirants on the platform.

## Why It Matters
Aspirants need to know "where they stand" in the competitive landscape. Peer benchmarking provides the psychological drive to improve and validates their preparation progress against realistic global standards.

## Scope
- Global leaderboard logic (Mastery-based).
- Percentile calculation for each subject and overall.
- "Rank Estimation" widget based on historical GATE data.
- Comparison metrics (User vs. Top 10% vs. Average).

## Dependencies
- `AnalyticsService` for underlying mastery data.
- Periodic aggregation jobs or optimized aggregate queries.

## Implementation Plan
1. Design efficient aggregation queries for global mastery stats.
2. Implement percentile calculation logic in `AnalyticsService`.
3. Build a "Global Standings" component for the Dashboard.
4. Integrate rank estimation logic based on mastery percentiles.
5. Verify performance with simulated large datasets.

## UX Improvements
- Visual comparison charts (Radar or Bar).
- Achievement badges for reaching certain percentiles (e.g., Top 1%).

## Validation Strategy
- Load testing with simulated 10k+ users.
- Verification of percentile math accuracy.

## Risks
- Performance bottlenecks on large user tables.
- Data privacy (anonymized rankings).

## Rollback Strategy
- Feature flag to disable benchmarking dashboard.

## Completion Criteria
- User can see their global percentile on the dashboard.
- Global rank estimate is updated based on topic mastery.

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
9. Deep Learning Recommendation Engine (V2)

# Repository Health Audit
- **Broken Systems**: None.
- **Weak Abstractions**: `DiagnosticEngine` needs more granular subject-topic mapping.
- **Technical Debt**: Standardized E2E auth mocking for tests.
- **Missing Tests**: E2E coverage for the revision loop.
- **Performance Issues**: Potential for N+1 queries in dashboard subject lists.
- **Security Concerns**: Rate-limiting for AI routes (20 req/24h).
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
- **Rate Limiting**: Active for AI routes (20 req/24h).

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
3. Dashboard Performance Optimization
4. CI/CD Pipeline Setup
5. Advanced Mistake Clustering
6. ARIA Accessibility Audit
7. Subject Heatmap Component
8. Global Search & Quick Navigation
9. Multi-device State Sync
10. Spaced Repetition for Formulas

# Next 100 Improvements
- [Detailed list suppressed for brevity, to be expanded in future runs]

# Execution Log

## [2025-05-16 02:15:00]
### Completed
- Rate Limiting for AI Routes fully implemented and verified.
- Database: Added `RateLimit` model with unique constraint on `[userId, key]`.
- Service: Implemented `RateLimitService` with atomic `upsert` and window-based resets.
- API: Integrated rate check into `/api/ai/explain` with `X-RateLimit-*` headers and 429 status.
- UI: Updated `PYQPlayer` with a "Limit Reached" state (rose-colored USAGE PROTECTION block).
- Performance: Centralized AI config in `src/lib/config/ai.ts` for easier management.
- Verified: All unit tests passed; E2E manual verification of 429 UI successful.

### Architecture Changes
- `RateLimitService` now acts as a gatekeeper for all expensive AI server routes.
- Response headers now standardly include usage quotas for client-side budget tracking.

### UX Findings
- The rose-colored "Limit Reached" block provides strong visual feedback without being jarring.
- Explicitly showing the reset time helps manage user expectations for daily quotas.

### Next Recommended Actions
- Implement Peer Benchmarking System to drive competitive engagement.

## [2025-05-16 01:30:00]
### Completed
- Initiated Rate Limiting for AI Routes task.
- Audited repository for existing rate-limiting logic (none found).
- Defined implementation strategy for database-backed windowed limits.

### Next Recommended Actions
- Implement `RateLimit` model in Prisma.

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
