# Vision
To build the world's most advanced GATE CSE preparation platform, leveraging adaptive AI, industrial-grade algorithms (FSRS v4), and a deterministic ROI-based roadmap to guarantee Rank 1 results for every dedicated aspirant.

# Current Repository State
- **Maturity**: Beta / MVP+
- **Stability**: Stable core functionality; Spaced Repetition (FSRS v4) logic and AI Rate Limiting are now robust.
- **Critical Blockers**: None.
- **Overall Progress**: Optimization engines are active; Mobile-First UX and PWA support complete. Security and cost-control measures (Rate Limiting) are now in place.

# Current Architecture
- **Frontend**: Next.js 14 (App Router), Tailwind CSS (Premium UI), Framer Motion (Animations), Lucide React (Icons).
- **Backend**: Next.js Server Actions, Route Handlers.
- **Database**: SQLite (via Prisma ORM 6.4.1); personalized `fsrsWeights` and `RateLimit` tracking enabled.
- **AI Systems**: Gemini 1.5 Flash (via `@google/generative-ai`) with user-based rate limiting.
- **State Management**: React Server Components + Client-side state for interactive players.
- **Infrastructure**: Vercel-ready; PWA Support enabled.
- **Analytics**: `AnalyticsService` handles mastery, streaks, and weakness detection.
- **Content Pipeline**: Curated JSON/CSV to Prisma seed script.

## ACTIVE TASK

# Task: Peer Benchmarking System (Global rank estimation)

## Priority
High (Motivation & Accuracy)

## Goal
Implement a real-time global rank estimation system that compares user performance against the entire cohort of aspirants.

## Why It Matters
GATE is a competitive exam where relative performance is everything. Providing a dynamic percentile and estimated rank helps users calibrate their effort and stay motivated.

## Scope
- Aggregate performance data across all users.
- Implement percentile calculation logic in `AnalyticsService`.
- Dashboard UI for "Estimated Global Rank".
- Historical rank tracking (Mastery vs. Rank correlation).

## Dependencies
- Database aggregation queries for global stats.

## Implementation Plan
1. Research percentile calculation algorithms for sparse data.
2. Implement global stats aggregation in `AnalyticsService`.
3. Create rank estimation heuristic (Diagnostic + Mastery + Accuracy).
4. Build Dashboard Benchmarking component.
5. Verify data consistency across multiple users.

## UX Improvements
- Visual rank progression charts.
- "Percentile beat" indicators on topic completion.

## Validation Strategy
- Load test with simulated user data.
- Verify rank stability under varying mastery levels.

## Risks
- Performance bottlenecks on global aggregation.
- Rank volatility with small user base.

## Rollback Strategy
- Fallback to "Mastery Tier" (Foundational/Advanced) instead of numerical rank.

## Completion Criteria
- User sees a dynamic "Estimated Rank" on their dashboard.
- Percentile is recalculated upon attempt submission.

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
9. Global Search & Quick Navigation

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
- **UX Friction**: AI Rate limit feedback added to `PYQPlayer`.
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
- **Rate Limiting**: Implemented for AI endpoints (20 req / 24h).

# Testing State
- **Unit Coverage**: Core engines and `RateLimitService` covered.
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
- Rate Limiting for AI Routes (Cost control & Security)
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
10. RAG Integration for Content Enrichment

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

## [2025-05-15 23:30:00]
### Completed
- Integrated 4-point FSRS rating system in `PYQPlayer.tsx`.
- Updated `saveAttempt` server action to respect user confidence levels (1-4).
- Added active UI states and persistence feedback for ratings.
- Verified system stability via regression tests (16/16 passed).

## [2025-05-16 00:45:00]
### Completed
- Mobile-First UX Overhaul (PWA support) implemented.
- PWA Configuration: `manifest.ts` and icons created.
- Responsive Navigation: Animated mobile hamburger menu added to `Navbar.tsx`.
- Mobile Ergonomics: `PYQPlayer` optimized with 2x2 rating grid and adjusted touch targets.
- Responsive Dashboard: Metrics and subject cards optimized for small screens.

## [2026-06-05 21:50:00]
### Completed
- Implemented `RateLimitService` for user-based API protection.
- Integrated rate limiting into `/api/ai/explain` (20 requests/24 hours).
- Updated `PYQPlayer.tsx` to handle and display rate limit error messages.
- Fixed JSX parsing error in `DiagnosticTestClient.tsx` (escaped `>`).
- Verified all systems with unit tests (21/21 passed) and production build.

### Architecture Changes
- Added `RateLimit` model to Prisma schema.
- API responses now include `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` headers.

### UX Findings
- Explicit error messages for rate limits prevent user confusion when AI help is unavailable.
- 'Instant Insight' remains available even when AI explanation is limited, preserving the "Insight-First" UX.

### Next Recommended Actions
- Move to Peer Benchmarking System to provide global rank estimation.
