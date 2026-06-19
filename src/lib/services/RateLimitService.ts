import prisma from "@/lib/db/prisma";
import { addHours, isAfter } from "date-fns";

export interface RateLimitResult {
  allowed: boolean;
  count: number;
  limit: number;
  remaining: number;
  resetAt: Date;
}

export class RateLimitService {
  /**
   * Checks if a user has exceeded the rate limit for a specific key
   * and increments the count if allowed.
   */
  static async checkAndIncrement(
    userId: string,
    key: string,
    limit: number,
    windowHours: number = 24
  ): Promise<RateLimitResult> {
    const now = new Date();

    // 1. Fetch current rate limit record
    const rateLimit = await prisma.rateLimit.findUnique({
      where: {
        userId_key: { userId, key }
      }
    });

    // 2. If no record or reset window passed, reset the counter
    if (!rateLimit || isAfter(now, rateLimit.resetAt)) {
      const resetAt = addHours(now, windowHours);

      const newRecord = await prisma.rateLimit.upsert({
        where: {
          userId_key: { userId, key }
        },
        create: {
          userId,
          key,
          count: 1,
          resetAt
        },
        update: {
          count: 1,
          resetAt
        }
      });

      return {
        allowed: true,
        count: 1,
        limit,
        remaining: limit - 1,
        resetAt: newRecord.resetAt
      };
    }

    // 3. Check if limit exceeded
    if (rateLimit.count >= limit) {
      return {
        allowed: false,
        count: rateLimit.count,
        limit,
        remaining: 0,
        resetAt: rateLimit.resetAt
      };
    }

    // 4. Increment the counter atomically
    const updatedRecord = await prisma.rateLimit.update({
      where: { id: rateLimit.id },
      data: { count: { increment: 1 } }
    });

    return {
      allowed: true,
      count: updatedRecord.count,
      limit,
      remaining: Math.max(0, limit - updatedRecord.count),
      resetAt: updatedRecord.resetAt
    };
  }
}
