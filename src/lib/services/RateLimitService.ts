import prisma from "@/lib/db/prisma";
import { addHours, isAfter } from "date-fns";

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
}

export class RateLimitService {
  /**
   * Checks if a user has exceeded a rate limit for a specific key.
   * If the limit is not exceeded, it increments the count.
   * If the reset period has passed, it resets the count.
   *
   * @param userId The ID of the user
   * @param key The rate limit key (e.g., 'ai-explain')
   * @param limit The maximum number of requests allowed in the window
   * @param windowHours The window duration in hours
   * @returns RateLimitResult containing status and metadata
   */
  static async checkRateLimit(
    userId: string,
    key: string,
    limit: number,
    windowHours: number
  ): Promise<RateLimitResult> {
    const now = new Date();

    // Fetch current rate limit state
    let rateLimit = await prisma.rateLimit.findUnique({
      where: {
        userId_key: { userId, key },
      },
    });

    // If no record exists or if the reset period has passed, initialize/reset
    if (!rateLimit || isAfter(now, rateLimit.resetAt)) {
      const resetAt = addHours(now, windowHours);

      rateLimit = await prisma.rateLimit.upsert({
        where: {
          userId_key: { userId, key },
        },
        update: {
          count: 1,
          resetAt,
        },
        create: {
          userId,
          key,
          count: 1,
          resetAt,
        },
      });

      return {
        allowed: true,
        limit,
        remaining: limit - 1,
        resetAt: rateLimit.resetAt,
      };
    }

    // If the limit is already reached, return denied
    if (rateLimit.count >= limit) {
      return {
        allowed: false,
        limit,
        remaining: 0,
        resetAt: rateLimit.resetAt,
      };
    }

    // Otherwise, increment the count
    rateLimit = await prisma.rateLimit.update({
      where: { id: rateLimit.id },
      data: {
        count: {
          increment: 1,
        },
      },
    });

    return {
      allowed: true,
      limit,
      remaining: limit - rateLimit.count,
      resetAt: rateLimit.resetAt,
    };
  }
}
