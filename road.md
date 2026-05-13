# Vision
To build the world's most advanced GATE CSE preparation platform, leveraging adaptive AI, industrial-grade algorithms (FSRS v4), and a deterministic ROI-based roadmap to guarantee Rank 1 results for every dedicated aspirant.

# Current Repository State
- **Maturity**: Beta / MVP+
- **Stability**: Stable core functionality, but needs deeper edge-case handling in engines.
- **Critical Blockers**: None currently.
- **Overall Progress**: Core architecture is set; focus is shifting to intelligence layer (AI/Engines) and UX polish.

# Current Architecture
- **Frontend**: Next.js 14 (App Router), Tailwind CSS (Premium UI), Framer Motion (Animations), Lucide React (Icons).
- **Backend**: Next.js Server Actions, Route Handlers.
- **Database**: SQLite (via Prisma ORM 6.4.1).
- **AI Systems**: Gemini 1.5 Flash (via `@google/generative-ai`).
- **State Management**: React Server Components + Client-side state where needed.
- **Infrastructure**: Vercel-ready.
- **Analytics**: Basic attempt tracking; needs deeper aggregation.
- **Content Pipeline**: Curated JSON/CSV to Prisma seed script.

## ACTIVE TASK

# Task: Real-time Dashboard Analytics & Mastery Engine

## Priority
High (Data Consistency / UX Quality)

## Goal
Replace hardcoded dashboard placeholders with real-time analytics aggregated from user attempts, progress, and diagnostic results.

## Why It Matters
A preparation platform is only as good as the feedback it provides. Real-time mastery and streak tracking are essential for student motivation and identifying learning gaps.

## Scope
- Implement `AnalyticsService` for server-side aggregation.
- Calculate `Overall Mastery`, `Revision Streak`, and `Critical Weaknesses`.
- Implement a deterministic `Rank Estimation` formula.
- Refactor Dashboard UI to consume dynamic data.
- Add `MasteryHeatmap` component for visual subject health.

## Dependencies
- Prisma (Attempt, UserProgress, MistakeLog models).
- Existing `DiagnosticEngine` results.

## Implementation Plan
1. Create `src/lib/services/AnalyticsService.ts`.
2. Implement aggregation methods (mastery, streak, weaknesses, rank).
3. Build `src/components/dashboard/MasteryHeatmap.tsx`.
4. Update `src/app/dashboard/page.tsx` to use the new service.
5. Benchmark query performance and add unit tests.

## UX Improvements
- Dynamic progress counters.
- Visual heatmap for subject mastery.
- Real-time streak display.

## Validation Strategy
- Unit tests for calculation logic.
- Performance benchmarking of aggregation queries.
- Verification of data consistency between topic-level progress and dashboard summary.

## Risks
- Slow aggregation queries as the `Attempt` table grows (addressed via indexing and efficient Prisma queries).

## Rollback Strategy
- Revert dashboard to use static placeholders if aggregation performance is unacceptable.

## Completion Criteria
- Dashboard displays real, non-hardcoded values for all 4 top-level stats.
- Subject list shows real mastery percentages and heatmap.
- Streak correctly increments based on daily attempts.

---

## QUEUED TASKS
1. FSRS Parameter Optimization (Auto-tuning weights)
2. Subject Mastery Heatmaps (Visual progress tracking) - [In Progress as part of Active Task]
3. Mobile-First UX Overhaul (PWA support)
4. Peer Benchmarking System (Global rank estimation)
5. Automated Flashcard Generation (AI-driven)
6. Revision Streak Gamification (Retention engine)
7. Advanced Mistake Clustering (Root cause analysis)
8. Performance: Database Query Optimization & Caching
9. Advanced Analytics Dashboard

# Repository Health Audit
- **Broken Systems**: None detected.
- **Weak Abstractions**: `DiagnosticEngine` is too simplistic. `MistakeAnalyzer` uses hardcoded thresholds.
- **Technical Debt**: Dashboard uses hardcoded placeholders for core metrics. Lack of unit tests for many engines.
- **Missing Tests**: No unit coverage for `src/lib/services`.
- **Performance Issues**: Potential for N+1 queries in dashboard subject lists.
- **Security Concerns**: AI route protected, but rate-limiting is needed.
- **Accessibility Concerns**: Needs a full ARIA audit.

# Learning Engine State
- **Adaptive Learning**: FSRS v4 integrated in `RevisionEngine`.
- **Revision Systems**: Spaced repetition active.
- **Mastery Tracking**: Topic-level coverage scores.
- **PYQ Systems**: 100% real GATE questions; no synthetic data.
- **Diagnostic Systems**: Industrial-Grade Proportional Sampling (v2.0).

# AI Systems State
- **Prompt Systems**: Structured prompts via `PromptEngine`.
- **Retrieval Systems**: Context-aware grounding in metadata and summaries.
- **Tutoring Systems**: Step-by-step conceptual derivations via Gemini.
- **Memory Systems**: Basic attempt history.
- **Recommendation Systems**: ROI-based roadmap generation.

# UI/UX State
- **Current Design Quality**: Elite SaaS aesthetics (Linear/Vercel inspired).
- **UX Friction**: Dashboard metrics are currently hardcoded placeholders.
- **Inconsistencies**: Spacing in some topic sub-tabs.
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
- **Unit Coverage**: Core engines (Diagnostic, Prompt) covered.
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
- Integrated AI Doubt Solver V2 (Context-aware grounding)
- Industrial-Grade Diagnostic Test Engine
- Vitest Test Suite Setup
- Premium UI Overhaul for Diagnostic Test
- Proportional Subject Sampling Logic
- FSRS v4 Integration

# Current Blockers
- None.

# Technical Debt Register
- Hardcoded weights in `RevisionEngine`.
- Hardcoded placeholders in Dashboard UI.
- Need for standardized E2E auth mocking for tests.

# Known Bugs
- None reported.

# Next 10 Priorities
1. Implement Real-time Dashboard Analytics
2. Dashboard Performance Optimization
3. Subject Heatmap Component
4. Mobile Responsiveness Audit
5. ARIA Accessibility Audit
6. Rate Limiting for AI Routes
7. Automated Flashcard Service
8. CI/CD Pipeline Setup
9. Advanced Mistake Clustering
10. FSRS Parameter Auto-tuning

# Next 100 Improvements
- [Detailed list suppressed for brevity, to be expanded in future runs]

# Execution Log

## [2025-05-15 15:00:00]
### Completed
- Initiated Dashboard Analytics overhaul.
- Defined `AnalyticsService` architecture.
- Updated `road.md` with new Active Task and repository health audit.

### Discovered
- Dashboard stats were entirely hardcoded, providing a misleading UX.
- Subject progress dots were static and didn't reflect real user data accurately.

### Next Recommended Actions
- Implement `AnalyticsService.getOverallStats`.
- Implement `MasteryHeatmap` component.

## [2025-05-15 14:00:00]
### Completed
- Implemented Context-Aware Grounding for AI Doubt Solver.
- Created `PromptEngine` for structured prompt engineering and testing.
- Added "Instant Insight" UI component for immediate technical feedback.
- Fixed `road.md` duplication and organization.

### Discovered
- `TopicSummary` in schema was correctly defined as `@unique topicId`, meaning it's a 1:1 relation.
- Metadata inclusion in the main topic page was already present but needed verification for the AI route.

### Architecture Changes
- Introduced `PromptEngine` to decouple AI prompt logic from API route handlers.
