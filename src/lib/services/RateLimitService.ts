import prisma from "@/lib/db/prisma";
import { addHours, isAfter } from "date-fns";

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: Date;
}

export class RateLimitService {
  /**
   * Checks if a user has exceeded their rate limit for a given key.
   * Standard limit: 20 requests per 24 hours.
   */
  static async checkLimit(userId: string, key: string, limit: number = 20, windowHours: number = 24): Promise<RateLimitResult> {
    const now = new Date();

    // Find existing rate limit record
    let rateLimit = await prisma.rateLimit.findUnique({
      where: {
        userId_key: { userId, key }
      }
    });

    // If no record exists or reset window has passed, create/reset it
    if (!rateLimit || isAfter(now, rateLimit.resetAt)) {
      const resetAt = addHours(now, windowHours);

      rateLimit = await prisma.rateLimit.upsert({
        where: {
          userId_key: { userId, key }
        },
        update: {
          count: 1,
          resetAt: resetAt
        },
        create: {
          userId,
          key,
          count: 1,
          resetAt: resetAt
        }
      });

      return {
        success: true,
        limit,
        remaining: limit - 1,
        reset: resetAt
      };
    }

    // If within window, increment if below limit
    if (rateLimit.count < limit) {
      rateLimit = await prisma.rateLimit.update({
        where: { id: rateLimit.id },
        data: { count: { increment: 1 } }
      });

      return {
        success: true,
        limit,
        remaining: limit - rateLimit.count,
        reset: rateLimit.resetAt
      };
    }

    // Limit exceeded
    return {
      success: false,
      limit,
      remaining: 0,
      reset: rateLimit.resetAt
    };
  }
}
