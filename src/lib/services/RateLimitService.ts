import prisma from "@/lib/db/prisma";

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetInSeconds: number;
  resetAt: Date;
}

export class RateLimitService {
  /**
   * Checks and enforces rate limits for a given key.
   * @param key Unique key identifying the rate limit target (e.g. `ai_explain:user_123`)
   * @param limit Maximum allowed requests within the window
   * @param windowInSeconds Time window duration in seconds
   */
  static async checkRateLimit(
    key: string,
    limit: number = 10,
    windowInSeconds: number = 600
  ): Promise<RateLimitResult> {
    const now = new Date();

    const existing = await prisma.rateLimit.findUnique({
      where: { key }
    });

    if (!existing || now >= existing.resetAt) {
      const resetAt = new Date(now.getTime() + windowInSeconds * 1000);
      await prisma.rateLimit.upsert({
        where: { key },
        create: {
          key,
          points: 1,
          resetAt
        },
        update: {
          points: 1,
          resetAt
        }
      });

      return {
        success: true,
        limit,
        remaining: Math.max(0, limit - 1),
        resetInSeconds: windowInSeconds,
        resetAt
      };
    }

    const resetInSeconds = Math.max(1, Math.ceil((existing.resetAt.getTime() - now.getTime()) / 1000));

    if (existing.points >= limit) {
      return {
        success: false,
        limit,
        remaining: 0,
        resetInSeconds,
        resetAt: existing.resetAt
      };
    }

    const updated = await prisma.rateLimit.update({
      where: { key },
      data: {
        points: { increment: 1 }
      }
    });

    return {
      success: true,
      limit,
      remaining: Math.max(0, limit - updated.points),
      resetInSeconds,
      resetAt: existing.resetAt
    };
  }
}
