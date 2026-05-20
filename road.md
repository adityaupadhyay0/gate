# Vision
To build the world's most advanced GATE CSE preparation platform, leveraging adaptive AI, industrial-grade algorithms (FSRS v4), and a deterministic ROI-based roadmap to guarantee Rank 1 results for every dedicated aspirant.

# Current Repository State
- **Maturity**: Beta / MVP+
- **Stability**: Stable core functionality; Mobile-first architecture and PWA support active.
- **Critical Blockers**: None currently.
- **Overall Progress**: Optimization engines are active; Responsive UX is now production-grade.

# Current Architecture
- **Frontend**: Next.js 14 (App Router), Tailwind CSS (Premium UI), Framer Motion (Animations), Lucide React (Icons).
- **Backend**: Next.js Server Actions, Route Handlers.
- **Database**: SQLite (via Prisma ORM 6.4.1); personalized `fsrsWeights` enabled.
- **AI Systems**: Gemini 1.5 Flash (via `@google/generative-ai`).
- **State Management**: React Server Components + Client-side state for interactive players.
- **Infrastructure**: Vercel-ready.
- **Analytics**: `AnalyticsService` handles mastery, streaks, and weakness detection.
- **Content Pipeline**: Curated JSON/CSV to Prisma seed script.

## ACTIVE TASK

# Task: Peer Benchmarking System (Global rank estimation)

## Priority
High (Competitive Intelligence)

## Goal
Implement a system that benchmarks a user's progress against the community to provide a realistic global rank estimation based on mastery and accuracy.

## Why It Matters
GATE is a competitive exam where relative performance is the only metric that matters. Providing a "Predicted Rank" based on historical data and current community performance significantly increases user motivation and platform stickiness.

## Scope
- Analytics aggregation for community-wide performance.
- Percentile calculation engine.
- Rank estimation UI component on the Dashboard.

## Dependencies
- `AnalyticsService` (Mastery & Accuracy).
- Historical GATE rank vs. score datasets.

## Implementation Plan
1. Create `BenchmarkingService` to aggregate anonymized user mastery levels.
2. Implement rank estimation formula using historical cutoffs and current user mastery.
3. Design and build a "Global Rank Indicator" component.
4. Add "Global Mastery Distribution" chart to the analytics page.

## UX Improvements
- High-visibility rank display.
- Dynamic "What-if" analysis (e.g., "Improve Algorithms mastery by 10% to jump 500 ranks").

## Validation Strategy
- Compare estimated ranks with historical 2023/2024 GATE data.
- Unit test percentile logic with mock user sets.

## Risks
- Data sparsity for new users leading to inaccurate initial ranks.

## Rollback Strategy
- Feature flag or hide the rank display if data is insufficient.

## Completion Criteria
- User sees a realistic estimated rank on their dashboard.
- Users can see where they stand in the community distribution.

---

## QUEUED TASKS
1. Automated Flashcard Generation (AI-driven)
2. Revision Streak Gamification (Retention engine)
3. Advanced Mistake Clustering (Root cause analysis)
4. Performance: Database Query Optimization & Caching
5. Advanced Analytics Dashboard
6. Adaptive Content Delivery (AI-tailored notes)
7. Subject-Specific Mock Test Generation
8. Rank Mode toggle for intense prep
9. CI/CD Pipeline & Automated Accessibility Testing

# Repository Health Audit
- **Broken Systems**: None.
- **Weak Abstractions**: `DiagnosticEngine` needs more granular topic weighting.
- **Technical Debt**: Standardized E2E auth mocking for tests.
- **Missing Tests**: E2E coverage for the revision loop.
- **Performance Issues**: Potential for N+1 queries in dashboard subject lists.
- **Security Concerns**: Rate-limiting needed for AI endpoints.
- **Accessibility Concerns**: Keyboard navigation audit for the new mobile menu.

# Learning Engine State
- **Adaptive Learning**: FSRS v4 integrated; Weight optimization active.
- **Revision Systems**: Spaced repetition active.
- **Mastery Tracking**: Topic-level coverage scores.
- **PYQ Systems**: 100% real GATE questions.
- **Diagnostic Systems**: Proportional Sampling (v2.0).

# AI Systems State
- **Prompt Systems**: Structured prompts via `PromptEngine`.
- **Retrieval Systems**: Context-aware grounding.
- **Tutoring Systems**: Step-by-step technical derivations.
- **Memory Systems**: Basic attempt history.
- **Recommendation Systems**: ROI-based roadmap generation.

# UI/UX State
- **Current Design Quality**: Elite SaaS aesthetics; PWA support active.
- **UX Friction**: Loading states in players could be smoother.
- **Inconsistencies**: Mobile menu keyboard trap potential.
- **Accessibility Gaps**: ARIA labels needed for some icons.
- **Mobile Responsiveness**: Core learning flows (Dashboard, Player) optimized.

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
- **Rate Limiting**: Missing for AI endpoints.

# Testing State
- **Unit Coverage**: Core engines (Diagnostic, Prompt, Analytics, Revision) covered.
- **Integration Coverage**: 0%
- **E2E Coverage**: Mobile flow verification scripts established.

# Content Expansion State
- **Completed Topics**: 95 Topics across 12 subjects.
- **Missing Topics**: None (Syllabus complete).
- **Weak Explanations**: Some curated explanations are one-liners.
- **Needed Enrichments**: Diagrams for COA/Networks.

# Infrastructure State
- **Deployment**: Vercel (Next.js).
- **CI/CD**: Manual deployment for now.
- **Monitoring**: None.
- **Logging**: Console-based.

# Research Notes
- **Product Ideas**: "Rank Mode" toggle for intense prep.
- **Educational Ideas**: Active Recall prompts after reading notes.
- **AI Improvements**: Use RAG for more accurate book-chapter recommendations.
- **Architecture Ideas**: Move heavy batch jobs to Edge/Serverless functions.

# Recently Completed Tasks
- Mobile-First UX Overhaul (PWA support)
- Full FSRS v4 Rating Integration in PYQPlayer
- FSRS Parameter Optimization (Auto-tuning weights)
- Real-time Dashboard Analytics & Mastery Engine
- Integrated AI Doubt Solver V2
- Industrial-Grade Diagnostic Test Engine

# Current Blockers
- None.

# Technical Debt Register
- Hardcoded placeholders in Dashboard UI.
- Need for standardized E2E auth mocking for tests.

# Known Bugs
- None reported.

# Next 10 Priorities
1. Peer Benchmarking System (Rank Estimation)
2. Rate Limiting for AI Routes
3. Automated Flashcard Service
4. CI/CD Pipeline Setup
5. Advanced Mistake Clustering
6. ARIA Accessibility Audit
7. Subject Heatmap Component
8. Rank Mode toggle for intense prep
9. Performance: Database Query Optimization
10. E2E Test Suite Expansion

# Next 100 Improvements
- [Detailed list suppressed for brevity, to be expanded in future runs]

# Execution Log

## [2025-05-15 22:15:00]
### Completed
- FSRS Parameter Optimization (Auto-tuning weights) system implemented and tested.
- Integrated `RevisionEngine` pure math into the optimization loop.
- Verified weight reduction of Log Loss via simulation tests.

## [2025-05-15 23:30:00]
### Completed
- Integrated 4-point FSRS rating system in `PYQPlayer.tsx`.
- Updated `saveAttempt` server action to respect user confidence levels (1-4).
- Added active UI states and persistence feedback for ratings.
- Verified system stability via regression tests (16/16 passed).

## [2025-05-16 01:15:00]
### Completed
- Configured PWA support via `manifest.ts` and Next.js 14 Metadata.
- Implemented responsive mobile navigation (hamburger menu) with Framer Motion.
- Refactored `PYQPlayer` for mobile (grid-based FSRS ratings, responsive padding).
- Fixed JSX parsing error in `DiagnosticTestClient.tsx`.
- Verified UI changes across mobile viewports using Playwright.

### Architecture Changes
- Added PWA manifest and viewport configuration to root layout.
- Introduced mobile-specific navigation state management in `Navbar`.

### Next Recommended Actions
- Implement Peer Benchmarking System to provide competitive feedback.
