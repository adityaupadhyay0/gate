import prisma from "@/lib/db/prisma";
import { addHours, isAfter } from "date-fns";

export class RateLimitService {
  /**
   * Checks if a user has exceeded a rate limit for a given key.
   * Increments the count and handles window resets.
   *
   * @param userId The user's unique identifier
   * @param key The feature key (e.g., 'ai_explain')
   * @param limit The maximum number of requests allowed in the window
   * @param windowHours The rolling window size in hours
   * @returns Object containing usage details
   */
  static async checkRateLimit(
    userId: string,
    key: string,
    limit: number,
    windowHours: number
  ) {
    const now = new Date();

    // Fetch current rate limit state
    const current = await prisma.rateLimit.findUnique({
      where: {
        userId_key: {
          userId,
          key,
        },
      },
    });

    // If no record exists or window has expired, reset
    if (!current || isAfter(now, current.resetAt)) {
      const resetAt = addHours(now, windowHours);

      const record = await prisma.rateLimit.upsert({
        where: {
          userId_key: {
            userId,
            key,
          },
        },
        create: {
          userId,
          key,
          count: 1,
          resetAt,
        },
        update: {
          count: 1,
          resetAt,
        },
      });

      return {
        count: record.count,
        limit,
        remaining: limit - record.count,
        resetAt: record.resetAt,
        isBlocked: record.count > limit,
      };
    }

    // Otherwise, increment existing record
    const record = await prisma.rateLimit.update({
      where: {
        userId_key: {
          userId,
          key,
        },
      },
      data: {
        count: {
          increment: 1,
        },
      },
    });

    return {
      count: record.count,
      limit,
      remaining: Math.max(0, limit - record.count),
      resetAt: record.resetAt,
      isBlocked: record.count > limit,
    };
  }
}
