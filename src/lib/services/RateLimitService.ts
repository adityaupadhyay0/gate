import prisma from "@/lib/db/prisma";
import { addHours } from "date-fns";

export interface RateLimitResult {
  isLimited: boolean;
  limit: number;
  remaining: number;
  reset: Date;
}

export class RateLimitService {
  /**
   * Checks if a user has exceeded their rate limit for a given key.
   * Increments the count if not limited.
   */
  static async checkRateLimit(
    userId: string,
    key: string,
    limit: number,
    windowHours: number
  ): Promise<RateLimitResult> {
    const now = new Date();

    // Find or create rate limit record
    let rateLimit = await prisma.rateLimit.findUnique({
      where: {
        userId_key: {
          userId,
          key,
        },
      },
    });

    // If no record or reset period passed, reset the limit
    if (!rateLimit || now > rateLimit.resetAt) {
      const resetAt = addHours(now, windowHours);
      rateLimit = await prisma.rateLimit.upsert({
        where: {
          userId_key: {
            userId,
            key,
          },
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
        isLimited: false,
        limit,
        remaining: limit - 1,
        reset: resetAt,
      };
    }

    // Check if limit exceeded
    if (rateLimit.count >= limit) {
      return {
        isLimited: true,
        limit,
        remaining: 0,
        reset: rateLimit.resetAt,
      };
    }

    // Increment count
    rateLimit = await prisma.rateLimit.update({
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
      isLimited: false,
      limit,
      remaining: limit - rateLimit.count,
      reset: rateLimit.resetAt,
    };
  }

  /**
   * Returns rate limit headers based on the result.
   */
  static getHeaders(result: RateLimitResult) {
    return {
      "X-RateLimit-Limit": result.limit.toString(),
      "X-RateLimit-Remaining": result.remaining.toString(),
      "X-RateLimit-Reset": Math.ceil(result.reset.getTime() / 1000).toString(),
    };
  }
}
