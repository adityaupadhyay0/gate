import prisma from "@/lib/db/prisma";
import { addHours } from "date-fns";

export class RateLimitService {
  /**
   * Checks if a user has exceeded the rate limit for a specific key.
   * Returns true if allowed, false if limited.
   * @param userId The user's ID
   * @param key The feature key (e.g., 'ai-explain')
   * @param limit The maximum number of requests allowed in the window
   * @param windowHours The window duration in hours (default: 24)
   */
  static async checkLimit(
    userId: string,
    key: string,
    limit: number,
    windowHours: number = 24
  ): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
    const now = new Date();

    const rateLimit = await prisma.rateLimit.findUnique({
      where: {
        userId_key: { userId, key }
      }
    });

    if (!rateLimit) {
      const resetAt = addHours(now, windowHours);
      await prisma.rateLimit.create({
        data: {
          userId,
          key,
          count: 1,
          resetAt
        }
      });
      return { allowed: true, remaining: limit - 1, resetAt };
    }

    if (now > rateLimit.resetAt) {
      // Reset window
      const resetAt = addHours(now, windowHours);
      await prisma.rateLimit.update({
        where: { id: rateLimit.id },
        data: {
          count: 1,
          resetAt
        }
      });
      return { allowed: true, remaining: limit - 1, resetAt };
    }

    if (rateLimit.count >= limit) {
      return { allowed: false, remaining: 0, resetAt: rateLimit.resetAt };
    }

    // Increment count
    const updated = await prisma.rateLimit.update({
      where: { id: rateLimit.id },
      data: {
        count: { increment: 1 }
      }
    });

    return {
      allowed: true,
      remaining: limit - updated.count,
      resetAt: rateLimit.resetAt
    };
  }
}
