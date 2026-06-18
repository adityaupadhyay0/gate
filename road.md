# Vision
To build the world's most advanced GATE CSE preparation platform, leveraging adaptive AI, industrial-grade algorithms (FSRS v4), and a deterministic ROI-based roadmap to guarantee Rank 1 results for every dedicated aspirant.

# Current Repository State
- **Maturity**: Beta / MVP+
- **Stability**: Stable; AI usage is now protected by a robust rate-limiting system.
- **Critical Blockers**: None.
- **Overall Progress**: Learning engines are calibrated; Mobile UX is polished; Infrastructure is secured against AI cost drain.

# Current Architecture
- **Frontend**: Next.js 14 (App Router), Tailwind CSS (Premium UI), Framer Motion (Animations), Lucide React (Icons).
- **Backend**: Next.js Server Actions, Route Handlers.
- **Database**: SQLite (via Prisma ORM 6.4.1); `RateLimit` model added for usage tracking.
- **AI Systems**: Gemini 1.5 Flash; Rate-limited to 20 requests/24h per user.
- **State Management**: React Server Components + Client-side state (interactive players).
- **Infrastructure**: Vercel-ready; PWA Support enabled.
- **Analytics**: `AnalyticsService` handles mastery, streaks, and weakness detection.
- **Content Pipeline**: Curated JSON/CSV to Prisma seed script.

## ACTIVE TASK

# Task: Peer Benchmarking System (Global rank estimation)

## Priority
High (Engagement & Competition)

## Goal
Implement a live benchmarking system that calculates a user's estimated GATE rank based on their performance across topics compared to the global user base.

## Why It Matters
Rank prediction is the #1 feature GATE aspirants seek. It provides a concrete metric for progress and creates a competitive environment that drives consistency.

## Scope
- Global percentile calculation logic in `AnalyticsService`.
- "Rank Mode" dashboard widget showing estimated rank range.
- Subject-wise benchmarking (User vs. Average).
- Leaderboard (Anonymized).

## Dependencies
- Robust `Attempt` data across multiple users.
- Normalized difficulty scoring from `ROIEngine`.

## Implementation Plan
1. Extend `AnalyticsService` to aggregate global performance stats.
2. Implement rank estimation algorithm based on topic mastery and difficulty.
3. Design and build the "Rank Mode" UI components.
4. Add global performance overlays to subject cards.
5. Verify calculations with mock datasets.

## UX Improvements
- High-stakes "Rank Mode" visual aesthetic.
- Comparative charts (User vs. Global Top 10%).

## Validation Strategy
- Statistical verification of the ranking algorithm.
- E2E tests for the dashboard rank widget.

## Risks
- Skewed rankings with small initial datasets.

## Rollback Strategy
- Fallback to "Mastery Percentage" if rank data is too sparse.

## Completion Criteria
- Users can see an estimated rank range on their dashboard.
- Subject cards display their percentile ranking.

---

## QUEUED TASKS
1. Deep Learning Recommendation Engine (V2 Roadmap)
2. Real-time Collaborative Study Rooms
3. Formula & Cheat Sheet Generator (AI-assisted)
4. Spaced Repetition for Formulas (FSRS-based)
5. Advanced Analytics V2 (Mistake clustering)
6. Automated PYQ Tagging System
7. Mock Test Series Engine
8. AI Tutor Memory Integration
9. Multi-device State Sync Audit

# Repository Health Audit
- **Broken Systems**: None.
- **Weak Abstractions**: `DiagnosticEngine` needs more granular subject-topic mapping.
- **Technical Debt**: Standardized E2E auth mocking for tests.
- **Missing Tests**: E2E coverage for the rate-limiting UI.
- **Performance Issues**: Potential for N+1 queries in dashboard subject lists.
- **Security Concerns**: None (Rate limiting addressed).
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
- **Inconsistencies**: None significant.
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
- **Rate Limiting**: Implemented (20 requests/24h for AI).

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
- Rate Limiting for AI Routes (20 req/24h)
- Mobile-First UX Overhaul (PWA support)
- Full FSRS v4 Rating Integration in PYQPlayer
- FSRS Parameter Optimization (Auto-tuning weights)
- Real-time Dashboard Analytics & Mastery Engine
- Integrated AI Doubt Solver V2

# Current Blockers
- None.

# Technical Debt Register
- Hardcoded weights in `RevisionEngine` (partially resolved).
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
10. Multi-device State Sync

# Next 100 Improvements
- [Detailed list suppressed for brevity]

# Execution Log

## [2025-05-16 02:00:00]
### Completed
- Rate Limiting for AI Routes (20 requests/24h) implemented.
- Created `RateLimit` database model and `RateLimitService` for atomic usage tracking.
- Integrated rate limiting into `/api/ai/explain` with X-RateLimit headers.
- Updated `PYQPlayer` UI to handle 429 status and display "Limit Reached" feedback.
- Verified logic with unit tests and E2E visual verification.

### Architecture Changes
- Added `RateLimit` table to Prisma schema.
- API responses now include rate limit budget headers.

### UX Findings
- The "Limit Reached" state in the player prevents user confusion when the AI button stops responding.
- Using a dedicated error card with a Brain icon maintains visual consistency with the tutoring system.

### Performance Findings
- Rate limiting check adds negligible latency (<5ms) due to indexed userId_key lookup.

### New Technical Debt
- RateLimitService currently uses fixed window (24h from first request); sliding window might be smoother for high-frequency users.

### Next Recommended Actions
- Begin implementation of the Peer Benchmarking System to leverage the attempt data being collected.
