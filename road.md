# Vision
To build the world's most advanced GATE CSE preparation platform, leveraging adaptive AI, industrial-grade algorithms (FSRS v4), and a deterministic ROI-based roadmap to guarantee Rank 1 results for every dedicated aspirant.

# Current Repository State
- **Maturity**: Beta / MVP+
- **Stability**: Stable core functionality; Spaced Repetition (FSRS v4) logic is now robust.
- **Critical Blockers**: None currently.
- **Overall Progress**: Optimization engines are active; currently closing the loop between AI intelligence and User Interface. Rating integration is the next critical step.

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

# Task: Full FSRS v4 Rating Integration in PYQPlayer

## Priority
Critical (Learning Feedback Loop)

## Goal
Integrate the 4-point FSRS rating system (Again, Hard, Good, Easy) into the PYQPlayer UI and connect it to the backend `saveAttempt` action to enable personalized spaced repetition.

## Why It Matters
FSRS v4 requires nuanced feedback (rating 1-4) to accurately predict memory decay. Currently, the PYQPlayer only logs a binary correct/incorrect to the console. Connecting this loop is essential for the "Auto-tuning weights" system to function with real user data.

## Scope
- Implement Rating UI in `PYQPlayer.tsx`.
- Connect to `saveAttempt` server action.
- Add "Calibration Status" indicators to the Dashboard.

## Dependencies
- `RevisionEngine`.
- `WeightOptimizationService`.
- `saveAttempt` Action.

## Implementation Plan
1. Update `road.md` with current execution context.
2. Modify `saveAttempt` server action to handle 1-4 FSRS ratings instead of binary mapping.
3. Update `PYQPlayer` UI to show active states for ratings and prevent skipping.
4. Run regression tests.
5. Update `road.md` with execution log.

## UX Improvements
- Feedback animations for rating selection.
- Clear "Personalized Engine" status on dashboard to build trust.

## Validation Strategy
- Verify database records for `confidenceLevel`.
- Ensure FSRS metadata (`stability`, `difficulty`) updates correctly after rating.

## Risks
- UX friction if rating is too intrusive (must be fast and intuitive).

## Rollback Strategy
- Fallback to binary mapping (Correct = Good, Incorrect = Again).

## Completion Criteria
- Users can rate their confidence after each PYQ.
- Attempts are persisted with 1-4 ratings.
- Dashboard shows calibration progress.

---

## QUEUED TASKS
1. Mobile-First UX Overhaul (PWA support)
2. Peer Benchmarking System (Global rank estimation)
3. Automated Flashcard Generation (AI-driven)
4. Revision Streak Gamification (Retention engine)
5. Advanced Mistake Clustering (Root cause analysis)
6. Performance: Database Query Optimization & Caching
7. Advanced Analytics Dashboard
8. Adaptive Content Delivery (AI-tailored notes)
9. Subject-Specific Mock Test Generation

# Repository Health Audit
- **Broken Systems**: PYQPlayer currently lacks backend persistence.
- **Weak Abstractions**: `DiagnosticEngine` is too simplistic.
- **Technical Debt**: Standardized E2E auth mocking for tests.
- **Missing Tests**: E2E coverage for the revision loop.
- **Performance Issues**: Potential for N+1 queries in dashboard subject lists.
- **Security Concerns**: Rate-limiting needed for AI endpoints.
- **Accessibility Concerns**: Needs a full ARIA audit.

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
- **Current Design Quality**: Elite SaaS aesthetics.
- **UX Friction**: Disconnect between PYQ attempts and FSRS scheduling.
- **Inconsistencies**: Loading states in players.
- **Accessibility Gaps**: Keyboard navigation not fully tested.
- **Mobile Responsiveness**: Targeted but not yet optimized for small screens.

# Performance State
- **Bundle Size**: Optimized by Next.js defaults.
- **Rendering**: Static/Dynamic hybrid.
- **API Latency**: Low (direct Prisma calls).
- **Query Bottlenecks**: None at current scale; monitoring aggregation performance.
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
- **E2E Coverage**: Minimal (basic spec).

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
- Full FSRS v4 Rating Integration in PYQPlayer
- FSRS Parameter Optimization (Auto-tuning weights)
- Real-time Dashboard Analytics & Mastery Engine
- Integrated AI Doubt Solver V2
- Industrial-Grade Diagnostic Test Engine
- Vitest Test Suite Setup

# Current Blockers
- None.

# Technical Debt Register
- Hardcoded weights in `RevisionEngine` (partially resolved by moving to optimization).
- Hardcoded placeholders in Dashboard UI.
- Need for standardized E2E auth mocking for tests.

# Known Bugs
- None reported.

# Next 10 Priorities
1. Full FSRS v4 Rating Integration in PYQPlayer
2. Mobile-First UX Overhaul (PWA)
3. Rate Limiting for AI Routes
4. Dashboard Performance Optimization
5. Automated Flashcard Service
6. CI/CD Pipeline Setup
7. Advanced Mistake Clustering
8. ARIA Accessibility Audit
9. Peer Benchmarking System
10. Subject Heatmap Component

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
