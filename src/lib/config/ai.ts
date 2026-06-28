/**
 * AI System Configuration
 * Centralizes model selection and rate limits for AI-powered features.
 */

export const AI_CONFIG = {
  /**
   * Models used across the platform.
   * Gemini 1.5 Flash is preferred for low latency and cost efficiency.
   */
  MODELS: {
    DEFAULT: "gemini-1.5-flash",
    EXPLAIN: "gemini-1.5-flash",
  },

  /**
   * Rate limiting rules (per user).
   */
  LIMITS: {
    // Explanation feature (Gemini 1.5 Flash)
    EXPLAIN: {
      KEY: "ai_explain",
      MAX_REQUESTS: 20,
      WINDOW_HOURS: 24,
    },
  }
} as const;
