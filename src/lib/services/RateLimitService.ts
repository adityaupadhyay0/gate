import prisma from "@/lib/db/prisma";
import { addHours } from "date-fns";

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: Date;
}

export class RateLimitService {
  /**
   * Checks if a user has exceeded their rate limit for a given key.
   * Increments the count if within limits.
   * @param userId The ID of the user
   * @param key The feature key (e.g., 'ai_explain')
   * @param limit The maximum number of requests allowed
   * @param windowHours The window size in hours
   */
  static async checkLimit(
    userId: string,
    key: string,
    limit: number,
    windowHours: number = 24
  ): Promise<RateLimitResult> {
    const now = new Date();

    // Use a transaction or atomic upsert to handle race conditions
    const rateLimit = await prisma.rateLimit.upsert({
      where: {
        userId_key: {
          userId,
          key,
        },
      },
      update: {},
      create: {
        userId,
        key,
        count: 0,
        resetAt: addHours(now, windowHours),
      },
    });

    // If the reset time has passed, reset the counter
    if (rateLimit.resetAt < now) {
      const updated = await prisma.rateLimit.update({
        where: { id: rateLimit.id },
        data: {
          count: 1,
          resetAt: addHours(now, windowHours),
        },
      });

      return {
        success: true,
        limit,
        remaining: limit - 1,
        reset: updated.resetAt,
      };
    }

    // If under limit, increment
    if (rateLimit.count < limit) {
      const updated = await prisma.rateLimit.update({
        where: { id: rateLimit.id },
        data: {
          count: { increment: 1 },
        },
      });

      return {
        success: true,
        limit,
        remaining: limit - updated.count,
        reset: rateLimit.resetAt,
      };
    }

    // Limit exceeded
    return {
      success: false,
      limit,
      remaining: 0,
      reset: rateLimit.resetAt,
    };
  }
}
