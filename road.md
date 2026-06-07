# Vision
To build the world's most advanced GATE CSE preparation platform, leveraging adaptive AI, industrial-grade algorithms (FSRS v4), and a deterministic ROI-based roadmap to guarantee Rank 1 results for every dedicated aspirant.

# Current Repository State
- **Maturity**: Beta / MVP+
- **Stability**: Stable; Rate-limiting for AI endpoints implemented.
- **Critical Blockers**: None.
- **Overall Progress**: Platform now includes cost-control measures for AI systems. Ready for Peer Benchmarking.

# Current Architecture
- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Framer Motion, Lucide React.
- **Backend**: Next.js Server Actions, Route Handlers.
- **Database**: SQLite (via Prisma ORM 6.4.1); `RateLimit` model added.
- **AI Systems**: Gemini 1.5 Flash; usage tracked via `RateLimitService`.
- **State Management**: React Server Components + Client-side state.
- **Infrastructure**: Vercel-ready; PWA Support enabled.
- **Analytics**: `AnalyticsService` active.
- **Content Pipeline**: Curated JSON/CSV to Prisma seed script.

## ACTIVE TASK

# Task: Peer Benchmarking System (Global rank estimation)

## Priority
High (Motivation & Realistic Assessment)

## Goal
Provide students with a simulated global rank based on their performance metrics relative to the historical and simulated aspirant population.

## Why It Matters
Aspirants need to know where they stand. Absolute marks are less important than relative rank in GATE.

## Scope
- Aggregate performance data (Mastery, Accuracy, Speed).
- Implement a rank estimation heuristic.
- Dashboard visualization for "Estimated Rank".

## Dependencies
- `AnalyticsService` for user metrics.

## Implementation Plan
1. Research historical GATE score-to-rank distributions.
2. Implement rank estimation logic in a new `BenchmarkingService`.
3. Add a Rank indicator to the Dashboard.
4. Verify with sample user data.

## UX Improvements
- High-impact rank visualization.
- "Xth percentile" indicators.

## Validation Strategy
- Compare estimated ranks against historical GATE data.

## Risks
- Misleading rank estimates if the heuristic is too simple.

## Rollback Strategy
- Hide the rank indicator until calibrated.

## Completion Criteria
- Dashboard displays a realistic rank estimate based on user progress.

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
- **Missing Tests**: Integration tests for API routes.
- **Performance Issues**: Potential for N+1 queries in dashboard subject lists.
- **Security Concerns**: None known (Rate limiting for AI endpoints added).
- **Accessibility Concerns**: Needs a full ARIA audit.

# Learning Engine State
- **Adaptive Learning**: FSRS v4 active; Weight optimization active.
- **Revision Systems**: Spaced repetition active.
- **Mastery Tracking**: Topic-level coverage scores.
- **PYQ Systems**: 100% real GATE questions.
- **Diagnostic Systems**: Proportional Sampling (v2.0).

# AI Systems State
- **Prompt Systems**: Structured prompts via `PromptEngine`.
- **Retrieval Systems**: Context-aware grounding.
- **Tutoring Systems**: Step-by-step technical derivations.
- **Memory Systems**: Basic attempt history.
- **Rate Limiting**: 20 requests / 24 hours per user for AI explanations.

# UI/UX State
- **Current Design Quality**: Elite SaaS aesthetics; PWA support added.
- **UX Friction**: Minimized; handled AI limit error states gracefully.
- **Inconsistencies**: None reported.
- **Accessibility Gaps**: Keyboard navigation not fully tested.
- **Mobile Responsiveness**: High fidelity.

# Performance State
- **Bundle Size**: Optimized.
- **Rendering**: Static/Dynamic hybrid.
- **API Latency**: Low.
- **Query Bottlenecks**: None at current scale.
- **Caching**: Minimal.

# Security State
- **Auth Systems**: Auth.js (v5 beta) with JWT.
- **Validation Coverage**: Zod/Prisma validation.
- **Vulnerabilities**: None known.
- **Secrets Handling**: `.env.example` provided.
- **Rate Limiting**: Implemented for AI endpoints.

# Testing State
- **Unit Coverage**: Core engines and RateLimitService covered.
- **Integration Coverage**: 0%
- **E2E Coverage**: Minimal (Playwright verification used for UI changes).

# Content Expansion State
- **Completed Topics**: 95 Topics across 12 subjects.
- **Missing Topics**: None (Syllabus complete).
- **Weak Explanations**: Some curated explanations are one-liners.
- **Needed Enrichments**: Diagrams for OS/COA/Networks.

# Infrastructure State
- **Deployment**: Vercel.
- **CI/CD**: Not yet fully configured.
- **Monitoring**: None.
- **Logging**: Console-based.

# Research Notes
- **Product Ideas**: "Rank Mode" toggle for intense prep.
- **Rank Estimation**: Use weighted average of (Accuracy * Mastery * Diagnostic Score).

# Recently Completed Tasks
- Rate Limiting for AI Routes
- Mobile-First UX Overhaul (PWA support)
- Full FSRS v4 Rating Integration in PYQPlayer
- FSRS Parameter Optimization (Auto-tuning weights)
- Real-time Dashboard Analytics & Mastery Engine

# Current Blockers
- None.

# Technical Debt Register
- Need for standardized E2E auth mocking for tests.
- Hardcoded placeholders in Dashboard UI.

# Known Bugs
- None.

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
10. Community Discussion Forums

# Next 100 Improvements
- [Detailed list suppressed for brevity]

# Execution Log

## [2025-05-16 02:00:00]
### Completed
- Rate Limiting for AI Routes implemented.
- Created `RateLimit` Prisma model and synced database.
- Implemented `RateLimitService` with rolling window logic.
- Integrated rate limiting into `/api/ai/explain` (20 req / 24h).
- Updated `PYQPlayer` to handle `RATE_LIMIT_EXCEEDED` error codes gracefully.
- Verified system stability with 19 passing unit tests and frontend verification.

### Architecture Changes
- Added `RateLimit` table to track usage metrics per user/feature.
- API responses now include `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` headers.

### UX Findings
- Graceful error handling for rate limits prevents user frustration when AI budget is exhausted.
- Using machine-readable error codes (`RATE_LIMIT_EXCEEDED`) makes the frontend-backend contract more robust.

### Performance Findings
- Prisma `upsert` and `increment` ensure atomic and efficient tracking of limits.

### Next Recommended Actions
- Implement Peer Benchmarking System to provide users with relative rank estimates.
