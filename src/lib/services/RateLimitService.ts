import prisma from "@/lib/db/prisma";
import { addHours, isAfter } from "date-fns";

export interface RateLimitResult {
  isAllowed: boolean;
  remaining: number;
  limit: number;
  reset: Date;
}

export class RateLimitService {
  /**
   * Checks if a user has exceeded their rate limit for a given key.
   * If not, it increments the usage count.
   *
   * @param userId The ID of the user to check
   * @param key The service key (e.g., 'ai_explain')
   * @param limit The maximum number of requests allowed in the window
   * @param windowHours The window size in hours
   */
  static async checkAndIncrement(
    userId: string,
    key: string,
    limit: number,
    windowHours: number
  ): Promise<RateLimitResult> {
    const now = new Date();

    // Use a transaction or upsert to handle atomic increment/reset
    const rateLimit = await prisma.rateLimit.upsert({
      where: {
        userId_key: { userId, key },
      },
      update: {},
      create: {
        userId,
        key,
        count: 0,
        lastReset: now,
      },
    });

    const resetTime = addHours(rateLimit.lastReset, windowHours);
    const isWindowExpired = isAfter(now, resetTime);

    if (isWindowExpired) {
      // Reset the window
      const updated = await prisma.rateLimit.update({
        where: { id: rateLimit.id },
        data: {
          count: 1,
          lastReset: now,
        },
      });
      return {
        isAllowed: true,
        remaining: limit - 1,
        limit,
        reset: addHours(now, windowHours),
      };
    }

    if (rateLimit.count >= limit) {
      return {
        isAllowed: false,
        remaining: 0,
        limit,
        reset: resetTime,
      };
    }

    // Increment usage
    const updated = await prisma.rateLimit.update({
      where: { id: rateLimit.id },
      data: {
        count: { increment: 1 },
      },
    });

    return {
      isAllowed: true,
      remaining: limit - updated.count,
      limit,
      reset: resetTime,
    };
  }
}
