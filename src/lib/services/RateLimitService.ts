import prisma from "@/lib/db/prisma";

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetInSeconds: number;
}

export class RateLimitService {
  /**
   * Checks and increments request counter for a given rate limit key.
   * @param key Unique rate limit key (e.g. `ai_explain:${userId}`)
   * @param limit Maximum allowed requests within the time window
   * @param windowInSeconds Window size in seconds
   */
  static async check(
    key: string,
    limit: number = 10,
    windowInSeconds: number = 600
  ): Promise<RateLimitResult> {
    const now = new Date();
    const existing = await prisma.rateLimit.findUnique({
      where: { key }
    });

    if (!existing) {
      await prisma.rateLimit.create({
        data: {
          key,
          count: 1,
          windowStart: now
        }
      });

      return {
        success: true,
        limit,
        remaining: Math.max(0, limit - 1),
        resetInSeconds: windowInSeconds
      };
    }

    const elapsedMs = now.getTime() - new Date(existing.windowStart).getTime();
    const elapsedSeconds = Math.floor(elapsedMs / 1000);

    if (elapsedSeconds >= windowInSeconds) {
      // Window expired, reset window
      await prisma.rateLimit.update({
        where: { key },
        data: {
          count: 1,
          windowStart: now
        }
      });

      return {
        success: true,
        limit,
        remaining: Math.max(0, limit - 1),
        resetInSeconds: windowInSeconds
      };
    }

    // Window still active
    const resetInSeconds = Math.max(1, windowInSeconds - elapsedSeconds);

    if (existing.count >= limit) {
      return {
        success: false,
        limit,
        remaining: 0,
        resetInSeconds
      };
    }

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
      resetInSeconds
    };
  }
}
