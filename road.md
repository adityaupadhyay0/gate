# GATE CSE Prep System - Research & Optimization

## 1. Revision Surety: FSRS v4 Integration
The system has been upgraded from basic SM-2/Exponential decay to the **Free Spaced Repetition Scheduler (FSRS) v4**.

### Key Advancements:
- **Stability-Based Scheduling:** Intervals are now calculated based on memory stability (S), which represents the time for recall probability to drop to 90%.
- **Retention Targeting:** Users can target a specific retention rate (default: 90%).
- **Multi-Factor Input:** Stability and Difficulty (D) are updated using 17 parameters (weights) optimized for long-term retention.

## 2. Expanded Syllabus (95 Topics)
The curriculum now covers 12 subjects with a total of 95 granular topics to ensure no "marks are left at stake".

| Subject | Topics |
|---------|--------|
| Algorithms | 9 |
| Data Structures | 12 |
| C Programming | 5 |
| Compiler Design | 6 |
| Theory of Computation | 10 |
| Operating System | 9 |
| Computer Network | 7 |
| Computer Organization | 9 |
| Database Management System | 9 |
| Discrete Mathematics | 11 |
| Digital Logic | 4 |
| Engineering Mathematics | 4 |

## 3. Industrial-Grade Features
- **Scientific Calculator:** Built-in JS-based parser for complex GATE numerical calculations.
- **Deep AI Doubt Solver:** Live Gemini 1.5 Flash integration for step-by-step conceptual derivation.
- **Offline Precomputation Pipeline:** Batch scripts for question tagging and topic summarization to eliminate runtime AI latency and costs.
