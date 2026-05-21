# Vision
To build the world's most advanced GATE CSE preparation platform, leveraging adaptive AI, industrial-grade algorithms (FSRS v4), and a deterministic ROI-based roadmap to guarantee Rank 1 results for every dedicated aspirant.

# Current Repository State
- **Maturity**: Beta / MVP+
- **Stability**: Stable core functionality; Spaced Repetition (FSRS v4) logic is now robust.
- **Critical Blockers**: None currently.
- **Overall Progress**: Mobile-first overhaul complete. PWA support integrated. FSRS loop fully functional in UI.

# Current Architecture
- **Frontend**: Next.js 14 (App Router), Tailwind CSS (Premium UI), Framer Motion (Animations), Lucide React (Icons).
- **Backend**: Next.js Server Actions, Route Handlers.
- **Database**: SQLite (via Prisma ORM 6.4.1).
- **AI Systems**: Gemini 1.5 Flash (via `@google/generative-ai`).
- **State Management**: React Server Components + Client-side state.
- **Infrastructure**: Vercel-ready.
- **Analytics**: `AnalyticsService` handles mastery, streaks, and weakness detection.
- **Content Pipeline**: Curated JSON/CSV to Prisma seed script.

## ACTIVE TASK

# Task: Rate Limiting for AI Routes

## Priority
Medium (Security/Infrastructure)

## Goal
Implement rate limiting for `/api/ai/explain` and other AI-related endpoints to prevent abuse and manage API costs.

## Why It Matters
AI inference is expensive and vulnerable to denial-of-service or automated scraping if not throttled.

## Scope
- Implement a middleware or utility for rate limiting.
- Apply to AI route handlers.
- Return 429 Too Many Requests when limits are exceeded.

---

## QUEUED TASKS
1. Peer Benchmarking System (Global rank estimation)
2. Automated Flashcard Generation (AI-driven)
3. Revision Streak Gamification (Retention engine)
4. Advanced Mistake Clustering (Root cause analysis)
5. Performance: Database Query Optimization & Caching
6. Advanced Analytics Dashboard
7. Adaptive Content Delivery (AI-tailored notes)
8. Subject-Specific Mock Test Generation
9. Global Search (Command Palette)

# Repository Health Audit
- **Broken Systems**: None.
- **Weak Abstractions**: `DiagnosticEngine` is too simplistic.
- **Technical Debt**: Standardized E2E auth mocking for tests.
- **Missing Tests**: E2E coverage for the revision loop.
- **Performance Issues**: Potential for N+1 queries in dashboard subject lists.
- **Security Concerns**: Rate-limiting needed for AI endpoints.
- **Accessibility Concerns**: Keyboard navigation needs audit.

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
- **UX Friction**: Improved mobile navigation and layout.
- **Inconsistencies**: Loading states in players.
- **Accessibility Gaps**: Keyboard navigation and screen reader support need audit.
- **Mobile Responsiveness**: High (Optimized).

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
- **Rate Limiting**: Critical missing piece for AI.

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

# Recently Completed Tasks
- Mobile-First UX Overhaul (PWA support)
- Full FSRS v4 Rating Integration in PYQPlayer
- FSRS Parameter Optimization (Auto-tuning weights)
- Real-time Dashboard Analytics & Mastery Engine
- Integrated AI Doubt Solver V2
- Industrial-Grade Diagnostic Test Engine
- Vitest Test Suite Setup

# Current Blockers
- None.

# Technical Debt Register
- Hardcoded placeholders in Dashboard UI.
- Need for standardized E2E auth mocking for tests.

# Known Bugs
- None reported.

# Next 10 Priorities
1. Rate Limiting for AI Routes
2. Dashboard Performance Optimization
3. Automated Flashcard Service
4. CI/CD Pipeline Setup
5. Advanced Mistake Clustering
6. ARIA Accessibility Audit
7. Peer Benchmarking System
8. Subject Heatmap Component
9. Global Search (Command Palette)
10. ROI-Based Content Generation

# Next 100 Improvements
- [Detailed list suppressed for brevity]

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

## [2025-05-16 01:20:00]
### Completed
- Implemented Mobile-First UX Overhaul and PWA support.
- Added `manifest.ts`, `robots.ts` and PWA icons.
- Created responsive mobile navigation with hamburger menu in `Navbar.tsx`.
- Optimized `PYQPlayer.tsx` and Dashboard `page.tsx` for mobile viewports.
- Updated `.gitignore` to prevent log pollution.
- Verified via unit tests and Playwright mobile screenshots.

### Architecture Changes
- PWA metadata integrated into root layout.
- Mobile navigation logic added to shared Layout components.

### UX Findings
- The 2x2 grid for FSRS ratings on mobile significantly improves hit accuracy compared to a single row.
- Mobile menu overlay provides a clean, focused navigation experience on small screens.

### Next Recommended Actions
- Implement rate limiting for AI endpoints to secure infrastructure.
