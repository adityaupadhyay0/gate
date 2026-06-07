import prisma from "@/lib/db/prisma";
import { addHours } from "date-fns";

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: Date;
}

export class RateLimitService {
  /**
   * Checks if a user has exceeded the rate limit for a specific feature.
   * Defaults to 20 requests per 24 hours.
   */
  static async checkLimit(
    userId: string,
    key: string,
    limit: number = 20,
    windowHours: number = 24
  ): Promise<RateLimitResult> {
    const now = new Date();

    // Find or create the rate limit record
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
    if (now > rateLimit.resetAt) {
      const updatedLimit = await prisma.rateLimit.update({
        where: { id: rateLimit.id },
        data: {
          count: 1,
          resetAt: addHours(now, windowHours),
        },
      });

      return {
        allowed: true,
        limit,
        remaining: limit - 1,
        reset: updatedLimit.resetAt,
      };
    }

    // Check if the limit is exceeded
    if (rateLimit.count >= limit) {
      return {
        allowed: false,
        limit,
        remaining: 0,
        reset: rateLimit.resetAt,
      };
    }

    // Increment the counter
    const updatedLimit = await prisma.rateLimit.update({
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
      remaining: limit - updatedLimit.count,
      reset: updatedLimit.resetAt,
    };
  }
}
