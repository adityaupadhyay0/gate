# Vision
To build the world's most advanced GATE CSE preparation platform, leveraging adaptive AI, industrial-grade algorithms (FSRS v4), and a deterministic ROI-based roadmap to guarantee Rank 1 results for every dedicated aspirant.

# Current Repository State
- **Maturity**: Beta / MVP+
- **Stability**: Stable core functionality; Spaced Repetition (FSRS v4) logic is now robust.
- **Critical Blockers**: None.
- **Overall Progress**: Optimization engines are active; Mobile-First UX and PWA support complete. Rate limiting implemented for AI routes to protect infrastructure.

# Current Architecture
- **Frontend**: Next.js 14 (App Router), Tailwind CSS (Premium UI), Framer Motion (Animations), Lucide React (Icons).
- **Backend**: Next.js Server Actions, Route Handlers.
- **Database**: SQLite (via Prisma ORM 6.4.1); personalized `fsrsWeights` enabled. `RateLimit` system active.
- **AI Systems**: Gemini 1.5 Flash (via `@google/generative-ai`).
- **State Management**: React Server Components + Client-side state for interactive players.
- **Infrastructure**: Vercel-ready; PWA Support enabled.
- **Analytics**: `AnalyticsService` handles mastery, streaks, and weakness detection.
- **Content Pipeline**: Curated JSON/CSV to Prisma seed script.

## ACTIVE TASK

# Task: Peer Benchmarking System (Global rank estimation)

## Priority
High (Motivation & Accuracy)

## Goal
Implement a benchmarking system that compares user performance against global averages to provide a realistic rank estimation.

## Why It Matters
Aspirants need to know where they stand in a competitive exam like GATE. Real-time rank estimation based on peer data significantly improves motivation and focus.

## Scope
- Aggregate performance data across users.
- Calculate percentile ranks for subjects and topics.
- Implement a "Global Rank" indicator on the dashboard.
- Develop a heuristic for rank estimation based on diagnostic and syllabus mastery.

## Dependencies
- Robust database aggregation queries.
- `AnalyticsService` extensions.

## Implementation Plan
1. Research rank estimation heuristics (GATE specifics).
2. Create aggregation services for peer data.
3. Update `User` model if necessary for public/private profile settings.
4. Implement benchmarking UI on the Dashboard.
5. Verify calculations with sample data.

## UX Improvements
- Interactive rank progression charts.
- Peer comparison highlights in topic views.

## Validation Strategy
- Compare estimated ranks against historical GATE data.
- Load testing for aggregation queries.

## Risks
- Data privacy concerns.
- Performance impact of heavy aggregations.

## Rollback Strategy
- Feature flag or revert to local-only mastery indicators.

## Completion Criteria
- Users can see their estimated rank and percentile.
- Data is updated in real-time or via daily batch jobs.

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
9. ARIA Accessibility Audit & Fixes

# Repository Health Audit
- **Broken Systems**: None.
- **Weak Abstractions**: `DiagnosticEngine` needs more granular subject-topic mapping.
- **Technical Debt**: Standardized E2E auth mocking for tests.
- **Missing Tests**: E2E coverage for the revision loop.
- **Performance Issues**: Potential for N+1 queries in dashboard subject lists.
- **Security Concerns**: AI routes are now rate-limited.
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
- **Rate Limiting**: Implemented for AI endpoints (20 req/24h).

# Testing State
- **Unit Coverage**: Core engines and RateLimitService covered.
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
10. AI-driven Personalized Notes

# Next 100 Improvements
- [Detailed list suppressed for brevity, to be expanded in future runs]

# Execution Log

## [2025-05-16 01:15:00]
### Completed
- Rate Limiting for AI Routes implemented.
- Added `RateLimit` model to Prisma schema with unique `[userId, key]` constraint.
- Implemented `RateLimitService` with window-based tracking using `date-fns`.
- Integrated rate limiting into `/api/ai/explain` (20 requests per 24 hours).
- Added unit tests for `RateLimitService` (100% coverage).
- Verified system integrity with 20/20 passing tests.

### Architecture Changes
- New `RateLimit` table in SQLite to track usage across various keys.
- `RateLimitService` centralized as a singleton-friendly class.
- API responses now include standard rate-limiting headers (`X-RateLimit-*`).

### Security Findings
- Enforced `session.user.id` check in AI routes to ensure reliable rate limiting.
- Cascade delete ensures user cleanup also removes rate limit history.

### Next Recommended Actions
- Implement Peer Benchmarking System (Global rank estimation) to increase platform stickiness.
