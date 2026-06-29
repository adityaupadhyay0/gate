import prisma from "@/lib/db/prisma";
import { addHours, isAfter } from "date-fns";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  reset: Date;
  limit: number;
}

export class RateLimitService {
  /**
   * Checks if a user has exceeded their rate limit for a specific action.
   * If not, increments the count.
   *
   * @param userId The ID of the user
   * @param key A unique key for the rate-limited action (e.g., 'ai_explain')
   * @param limit The maximum number of allowed requests in the window
   * @param windowInHours The duration of the window in hours
   */
  static async checkAndIncrement(
    userId: string,
    key: string,
    limit: number,
    windowInHours: number
  ): Promise<RateLimitResult> {
    const now = new Date();

    // Use a transaction or atomic update to prevent race conditions
    // Since we're using SQLite, we can use an upsert with conditional logic
    // or just fetch and then update. For robustness, let's fetch first.

    const rateLimit = await prisma.rateLimit.upsert({
      where: {
        userId_key: { userId, key },
      },
      update: {},
      create: {
        userId,
        key,
        count: 0, // Initialize at 0, will be incremented below
        lastReset: now,
      },
    });

    const resetTime = addHours(rateLimit.lastReset, windowInHours);

    if (isAfter(now, resetTime)) {
      // Window has expired, reset the count
      await prisma.rateLimit.update({
        where: { id: rateLimit.id },
        data: {
          count: 1,
          lastReset: now,
        },
      });

      return {
        allowed: true,
        remaining: limit - 1,
        reset: addHours(now, windowInHours),
        limit,
      };
    }

    if (rateLimit.count >= limit) {
      // Limit reached
      return {
        allowed: false,
        remaining: 0,
        reset: resetTime,
        limit,
      };
    }

    // Within window and under limit, increment count
    const updated = await prisma.rateLimit.update({
      where: { id: rateLimit.id },
      data: {
        count: { increment: 1 },
      },
    });

    return {
      allowed: true,
      remaining: limit - updated.count,
      reset: resetTime,
      limit,
    };
  }
}
