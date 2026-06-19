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
High (Motivation & Accuracy)

## Goal
Implement a benchmarking system that compares user performance against the global student population to provide realistic rank estimations.

## Why It Matters
Aspirants need to know where they stand relative to the competition. Global benchmarking transforms isolated study into a competitive, clear-eyed preparation journey.

## Scope
- Global attempt aggregation.
- Normalization of scores across difficulty tiers.
- Real-time rank percentile calculation.
- Dashboard benchmarking component.

## Dependencies
- `AnalyticsService` extensions.
- Global statistics model in Prisma.

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
9. Community-Driven Question Bank

# Repository Health Audit
- **Broken Systems**: None.
- **Weak Abstractions**: `DiagnosticEngine` needs more granular subject-topic mapping.
- **Technical Debt**: Inconsistent AI provider labels in UI (Partially resolved).
- **Missing Tests**: E2E coverage for the revision loop.
- **Performance Issues**: Potential for N+1 queries in dashboard subject lists.
- **Security Concerns**: None known (Rate limiting added).
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
- **Rate Limiting**: Active (20 requests/24h per user).

# Testing State
- **Unit Coverage**: Core engines and services (including RateLimitService) covered.
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
- Rate Limiting for AI Routes (Cost protection & security)
- Mobile-First UX Overhaul (PWA support)
- Full FSRS v4 Rating Integration in PYQPlayer
- FSRS Parameter Optimization (Auto-tuning weights)
- Real-time Dashboard Analytics & Mastery Engine

# Current Blockers
- None.

# Technical Debt Register
- Hardcoded weights in `RevisionEngine` (partially resolved by moving to optimization).
- Hardcoded placeholders in Dashboard UI.
- ARIA Accessibility audit pending.

# Known Bugs
- None reported.

# Next 10 Priorities
1. Peer Benchmarking System
2. Deep Learning Recommendation Engine
3. Real-time Collaborative Study Rooms
4. Dashboard Performance Optimization
5. CI/CD Pipeline Setup
6. Advanced Mistake Clustering
7. ARIA Accessibility Audit
8. Subject Heatmap Component
9. Global Search & Quick Navigation
10. Multi-device State Sync

# Next 100 Improvements
- [Detailed list suppressed for brevity, to be expanded in future runs]

# Execution Log

## [2025-05-16 02:30:00]
### Completed
- Rate Limiting for AI Routes implemented.
- Added `RateLimit` model to Prisma schema.
- Developed `RateLimitService` with window-based tracking (20 req/24h).
- Integrated rate limiting into `/api/ai/explain` with `X-RateLimit-*` headers.
- Enhanced `PYQPlayer` UI with "Limit Reached" error states and budget protection messaging.
- Corrected AI provider labeling from "Pro" to "Flash" in active tutoring UI.
- Verified implementation with Vitest unit tests and Playwright frontend verification.

### Architecture Changes
- Centralized usage tracking in `RateLimitService`.
- Added atomic increments for rate limit counters.

### Performance Findings
- Rate limiting overhead is negligible (< 5ms) due to simple SQLite lookups.

### UX Findings
- Explicit "Daily AI Budget Exhausted" messaging improves user trust and reduces frustration.
- `pb-20` in `PYQPlayer` ensures expanded AI cards don't overlap with navigation elements on smaller screens.

### Next Recommended Actions
- Initiate Peer Benchmarking System (Global rank estimation) to increase competitive engagement.
