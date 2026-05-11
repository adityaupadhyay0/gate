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

# Task: Integrated AI Doubt Solver V2 (Context-aware grounding)

## Priority
High (Learning-critical / AI quality)

## Goal
Enhance the AI doubt solver by grounding its explanations in precomputed metadata (PYQMetadata) and TopicSummaries to reduce hallucinations and improve technical depth.

## Why It Matters
Generic AI explanations often miss subtle GATE-specific nuances or common pitfalls. Grounding ensures the AI "knows" what concepts are being tested and what typical mistakes students make.

## Scope
- Update `PYQPlayer.tsx` to pass `pyqId`.
- Update `/api/ai/explain` to fetch metadata.
- Refine AI prompt for grounded reasoning.

## Dependencies
- Prisma schema (PYQMetadata, TopicSummary).
- Gemini API.

## Implementation Plan
1. Update `PYQPlayer.tsx` to include `pyqId` in the API request.
2. Modify the API route to fetch `PYQMetadata` and `TopicSummary`.
3. Enhance the AI prompt to incorporate fetched context.
4. Add unit tests for prompt grounding logic.

## UX Improvements
- Display precomputed "One-line explanation" instantly while AI generates the full derivation.

## Validation Strategy
- Compare AI responses with and without grounding.
- Unit tests for metadata fetching and prompt construction.

## Risks
- Missing metadata for some questions might lead to inconsistent quality (needs fallback).

## Rollback Strategy
- Revert API route to use only raw question/options/answer data.

## Completion Criteria
- AI explanations include specific references to `conceptTags` and `typicalMistakes` when available.
- Seamless fallback when metadata is missing.
- Verified data flow from client to AI route.

---

## QUEUED TASKS
1. FSRS Parameter Optimization (Auto-tuning weights)
2. Subject Mastery Heatmaps (Visual progress tracking)
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
- **Technical Debt**: Lack of unit tests for core engines. Pinned Prisma/TS versions (intentional for stability).
- **Missing Tests**: No unit coverage for `src/lib/engines`.
- **Performance Issues**: Potential for N+1 queries in dashboard subject lists.
- **Security Concerns**: AI route protected, but rate-limiting is needed.
- **Accessibility Concerns**: Needs a full ARIA audit.

# Learning Engine State
- **Adaptive Learning**: FSRS v4 integrated in `RevisionEngine`.
- **Revision Systems**: Spaced repetition active.
- **Mastery Tracking**: Topic-level coverage scores.
- **PYQ Systems**: 100% real GATE questions; no synthetic data.
- **Diagnostic Systems**: Basic 15-question test; currently being upgraded.

# AI Systems State
- **Prompt Systems**: Structured prompts for explanations.
- **Retrieval Systems**: None (Direct DB query).
- **Tutoring Systems**: Step-by-step conceptual derivations via Gemini.
- **Memory Systems**: Basic attempt history.
- **Recommendation Systems**: ROI-based roadmap generation.

# UI/UX State
- **Current Design Quality**: Elite SaaS aesthetics (Linear/Vercel inspired).
- **UX Friction**: Onboarding diagnostic needs more "industrial" feel.
- **Inconsistencies**: Spacing in some topic sub-tabs.
- **Accessibility Gaps**: Keyboard navigation not fully tested.
- **Mobile Responsiveness**: Targeted but not yet optimized for small screens.

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
- **Unit Coverage**: 0%
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
- Industrial-Grade Diagnostic Test Engine
- Vitest Test Suite Setup
- Premium UI Overhaul for Diagnostic Test
- Proportional Subject Sampling Logic
- FSRS v4 Integration
- 95-Topic Syllabus Mapping
- Scientific Calculator Component
- Deep AI Doubt Solver (Beta)
- Offline Precomputation Pipeline

# Current Blockers
- None.

# Technical Debt Register
- Hardcoded weights in `RevisionEngine`.
- Need for standardized E2E auth mocking for tests.

# Known Bugs
- None reported.

# Next 10 Priorities
1. Upgrade `DiagnosticEngine`
2. Set up Vitest test suite
3. Improve AI Explanation Grounding
4. Dashboard Performance Optimization
5. Mobile Responsiveness Audit
6. Subject Heatmap Component
7. ARIA Accessibility Audit
8. Rate Limiting for AI Routes
9. Automated Flashcard Service
10. CI/CD Pipeline Setup

# Next 100 Improvements
- [Detailed list suppressed for brevity, to be expanded in future runs]

# Execution Log

## [2025-05-15 14:00:00]
### Completed
- Implemented Context-Aware Grounding for AI Doubt Solver.
- Created `PromptEngine` for structured prompt engineering and testing.
- Added "Instant Insight" UI component for immediate technical feedback.
- Fixed `road.md` duplication and organization.

### Discovered
- `TopicSummary` in schema was correctly defined as `@unique topicId`, meaning it's a 1:1 relation, but Prisma naming convention sometimes uses plurals in relations.
- Metadata inclusion in the main topic page was already present but needed verification for the AI route.

### Architecture Changes
- Introduced `PromptEngine` to decouple AI prompt logic from API route handlers.

## [2025-05-15 11:00:00]
### Completed
- Implemented Industrial-Grade Proportional Sampling in `DiagnosticEngine`.
- Enhanced `processResults` to calculate granular subject-wise normalized scores.
- Established Vitest unit testing suite for core engines.
- Refined Diagnostic Test UI with premium animations and typography.
- Addressed code review feedback: ensured data consistency in engine and fixed unit test reliability.

### Discovered
- Core subject slugs were hardcoded in the engine; might want to make this dynamic later based on subject weight in GATE.
- Prisma's `include` depth can impact performance if not careful, but fine for 15-20 questions.
- Existing E2E tests were outdated and required alignment with current UI copy.
- Ensuring `topic.subject` inclusion in all sampling branches is critical for UI stability.

### Architecture Changes
- Moved from fixed "Anchor/Edge" sets to a proportional subject-wide sampling strategy.
- Integrated Vitest as the primary unit testing framework.

## [2025-05-15 10:00:00]
### Completed
- Initialized comprehensive `road.md` repository intelligence.
- Performed deep audit of engines, UI, and architecture.
- Identified `DiagnosticEngine` as the primary target for improvement.

### Discovered
- `DiagnosticEngine` currently uses a simple `take(10)`/`take(5)` which doesn't guarantee subject coverage.
- Lack of unit tests is a major risk for engine reliability.

### Architecture Changes
- None yet.

### Performance Findings
- Dashboard might slow down as `Attempt` table grows; needs indexing.

### UX Findings
- The diagnostic test feels a bit "lightweight" for an elite platform.

### AI Improvements
- Explanations could benefit from "grounding" in specific textbook references.

### New Technical Debt
- Identified need for standardized testing framework.

### Next Recommended Actions
- Implement Proportional Sampling in `DiagnosticEngine`.
- Setup Vitest.
