# Vision
To build the world's most advanced GATE CSE preparation platform, leveraging adaptive AI, industrial-grade algorithms (FSRS v4), and a deterministic ROI-based roadmap to guarantee Rank 1 results for every dedicated aspirant.

# Current Repository State
- **Maturity**: Beta / MVP+
- **Stability**: Stable core functionality with advanced intelligence layers.
- **Critical Blockers**: None currently.
- **Overall Progress**: Core architecture and AI engines are robust; focusing on deep educational analytics and performance.

# Current Architecture
- **Frontend**: Next.js 14 (App Router), Tailwind CSS (Premium UI), Framer Motion (Animations), Lucide React (Icons), PWA support.
- **Backend**: Next.js Server Actions, Route Handlers.
- **Database**: SQLite (via Prisma ORM 6.4.1).
- **AI Systems**: Gemini 1.5 Flash (via `@google/generative-ai`), Context-aware grounding.
- **State Management**: React Server Components + Client-side state where needed.
- **Infrastructure**: Vercel-ready.
- **Analytics**: Benchmarking Engine, Mistake Analyzer, ROI Engine.
- **Content Pipeline**: Curated JSON/CSV to Prisma seed script.

## ACTIVE TASK

# Task: CI/CD Pipeline Setup

## Priority
Medium (Infrastructure)

## Goal
Establish a robust Continuous Integration and Continuous Deployment (CI/CD) pipeline using GitHub Actions to automate testing, linting, and deployment to Vercel, ensuring high code quality and reliable releases.

## Why It Matters
As the platform evolves into a "Production-Grade Educational OS," manual testing and deployment are no longer sufficient. CI/CD ensures that every commit is verified against the test suite, preventing regressions in core learning engines and maintaining a stable environment for Rank 1 aspirants.

## Scope
- GitHub Actions workflow configuration.
- Automated Vitest and Playwright execution.
- Vercel deployment automation.

## Dependencies
- GitHub Repository access.
- Vercel Project.

## Implementation Plan
1. Create `.github/workflows/ci.yml`.
2. Configure steps for Node.js setup, dependency installation, and linting.
3. Integrate Prisma migration checks and client generation.
4. Execute unit tests (`npm test`) and E2E tests in the pipeline.
5. Set up Vercel Preview deployments for Pull Requests.

## UX Improvements
- Faster feature delivery with confidence.
- Zero-downtime deployments.

## Validation Strategy
- Trigger manual workflow runs.
- Verify status checks on Pull Requests.

## Risks
- Flaky E2E tests in CI environment (needs stable mock data).

## Rollback Strategy
- Revert workflow files or disable GitHub Actions.

## Completion Criteria
- GitHub Action passes on every push to `main`.
- Tests are executed automatically.
- Vercel deployments are triggered upon successful build.

---

## QUEUED TASKS
1. Automated Voice Explanations (AI-driven)
2. Peer Challenges (Social learning)
3. Subject Mastery Certificates (Verified)
4. Automated Voice Explanations (AI-driven)
5. Peer Challenges (Social learning)
6. Subject Mastery Certificates
7. Dark Mode Optimization
8. Integration with External Practice Sets
9. Global Leaderboard (Verified)

# Repository Health Audit
- **Broken Systems**: None detected.
- **Weak Abstractions**: `MistakeAnalyzer` is too simplistic.
- **Technical Debt**: Need more unit tests for new services.
- **Missing Tests**: Low coverage for `FlashcardService` and `BenchmarkingEngine`.
- **Performance Issues**: Dashboard query optimization needed for large datasets.
- **Security Concerns**: Rate-limiting is needed for AI endpoints.
- **Accessibility Concerns**: Full ARIA audit pending.

# Learning Engine State
- **Adaptive Learning**: FSRS v4 with personalized auto-tuning.
- **Revision Systems**: Spaced repetition + AI Flashcards.
- **Mastery Tracking**: Heatmaps and ROI-based prioritization.
- **PYQ Systems**: 100% real GATE questions.
- **Diagnostic Systems**: Industrial-grade proportional sampling.

# Execution Log

## [2025-05-15 23:00:00]
### Completed
- Implemented Advanced Analytics Dashboard.
- Created `/dashboard/analytics` with Subject ROI Analysis and Error Profiles.
- Developed aggregation logic for Learning Gain vs. Time Investment.
- Integrated AI Diagnosis for error bottlenecks.
- Linked analytics from the main Command Center.

### Discovered
- ROI metrics (Gain/Time) provide a much clearer "Effort vs. Result" signal than simple completion percentages.

## [2025-05-15 22:00:00]
### Completed
- Implemented Database Optimization & Caching Layer.
- Added performance indexes to `Attempt` and `UserProgress` tables.
- Refactored Dashboard with `unstable_cache` and `Promise.all` for parallel fetching.
- Implemented fine-grained cache invalidation via `revalidateTag` in server actions.

### Discovered
- `unstable_cache` significantly reduces DB load but requires careful tag management to ensure data consistency across multiple devices/sessions.

## [2025-05-15 21:00:00]
### Completed
- Upgraded `MistakeAnalyzer` with Advanced Clustering.
- Grouped mistakes by `conceptTags` and `mistakeType`.
- Implemented `ConceptualBlockers` UI component.
- Integrated root cause analysis reports into the Dashboard.

### Discovered
- Multi-tag questions (e.g., "Paging, Virtual Memory") are best handled by splitting and counting tags individually to identify specific conceptual friction points.

## [2025-05-15 20:00:00]
### Completed
- Implemented Revision Streak Gamification.
- Added `currentStreak` and `lastAttemptDate` to `User` model.
- Developed robust streak calculation logic in `saveAttempt` action.
- Integrated dynamic streak counter (Flame icon) on the dashboard.

### Discovered
- UTC-based date normalization is critical to prevent streak resets across different user sessions.

## [2025-05-15 19:00:00]
### Completed
- Implemented Automated AI Flashcard Generation.
- Added `Flashcard` model to Prisma and synced database.
- Created `FlashcardService` using Gemini 1.5 Flash for high-quality conceptual cards.
- Developed interactive `FlashcardPlayer` component with 3D flip animations.

### Discovered
- Prisma formatting is essential when adding new relation fields to avoid validation errors.
- AI-generated flashcards need strict structured JSON prompts to ensure consistent UI rendering.

## [2025-05-15 18:00:00]
### Completed
- Implemented Peer Benchmarking System.
- Created `BenchmarkingEngine` with percentile logic and population baseline.
- Integrated dynamic Rank Estimation on the dashboard.

### Discovered
- Global rank estimation requires a significant baseline; implemented a "Mock Global Baseline" to provide realistic feedback for early adopters.

## [2025-05-15 17:00:00]
### Completed
- Implemented Mobile-First UX Overhaul and PWA support.
- Added `manifest.json` and viewport metadata.
- Developed a mobile bottom navigation bar for small screens.
- Refined responsive layouts across core pages.

## [2025-05-15 16:00:00]
### Completed
- Implemented Subject Mastery Heatmaps on the dashboard.
- Created responsive `MasteryHeatmap` component with color-scaled cells.
- Refactored Dashboard layout into a 2-column grid for better information density.

## [2025-05-15 15:00:00]
### Completed
- Implemented FSRS Parameter Optimization (Auto-tuning weights).
- Added `fsrsWeights` to `User` model.
- Developed adaptive tuning logic in `RevisionEngine` based on global performance trends.
- Automated periodic tuning (every 50 attempts).

## [2025-05-15 14:00:00]
### Completed
- Implemented Context-Aware Grounding for AI Doubt Solver.
- Created `PromptEngine` for structured prompt engineering and testing.
- Added "Instant Insight" UI component for immediate technical feedback.

# Technical Debt Register
- Hardcoded weights in `RevisionEngine` (partially resolved with auto-tuning).
- Need for standardized E2E auth mocking for tests.
