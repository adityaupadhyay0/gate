import prisma from "@/lib/db/prisma";

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
  retryAfterSeconds: number;
}

export class RateLimitService {
  /**
   * Checks and updates rate limit counter for a given key.
   * @param key Unique identifier for rate limiting (e.g. `ai_explain:${userId}`)
   * @param limit Maximum allowed requests within the window
   * @param windowMs Window duration in milliseconds (default: 10 minutes)
   */
  static async checkRateLimit(
    key: string,
    limit: number = 10,
    windowMs: number = 10 * 60 * 1000
  ): Promise<RateLimitResult> {
    const now = new Date();

    // Asynchronously trigger cleanup of expired rate limits (non-blocking)
    this.cleanupExpired().catch(() => {});

    const record = await prisma.rateLimit.findUnique({
      where: { key }
    });

    if (!record || now >= record.resetAt) {
      const resetAt = new Date(now.getTime() + windowMs);
      await prisma.rateLimit.upsert({
        where: { key },
        create: {
          key,
          count: 1,
          resetAt
        },
        update: {
          count: 1,
          resetAt
        }
      });

      return {
        success: true,
        limit,
        remaining: Math.max(0, limit - 1),
        resetAt,
        retryAfterSeconds: 0
      };
    }

    if (record.count < limit) {
      const updated = await prisma.rateLimit.update({
        where: { key },
        data: {
          count: { increment: 1 }
        }
      });

      return {
        success: true,
        limit,
        remaining: Math.max(0, limit - updated.count),
        resetAt: record.resetAt,
        retryAfterSeconds: 0
      };
    }

    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((record.resetAt.getTime() - now.getTime()) / 1000)
    );

    return {
      success: false,
      limit,
      remaining: 0,
      resetAt: record.resetAt,
      retryAfterSeconds
    };
  }

  /**
   * Removes expired rate limit entries to prevent table bloat.
   */
  private static async cleanupExpired(): Promise<void> {
    try {
      await prisma.rateLimit.deleteMany({
        where: {
          resetAt: { lt: new Date() }
        }
      });
    } catch (e) {
      // Non-critical background task
    }
  }
}
