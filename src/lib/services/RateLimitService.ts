import prisma from "@/lib/db/prisma";
import { addHours, isBefore } from "date-fns";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  reset: Date;
}

export class RateLimitService {
  /**
   * Checks if a user has exceeded their rate limit for a specific key
   * and increments the count if allowed.
   */
  static async checkAndIncrement(
    userId: string,
    key: string,
    limit: number,
    windowHours: number = 24
  ): Promise<RateLimitResult> {
    const now = new Date();

    // Find or create rate limit record
    const record = await prisma.rateLimit.upsert({
      where: {
        userId_key: { userId, key }
      },
      update: {},
      create: {
        userId,
        key,
        count: 0,
        lastReset: now
      }
    });

    const resetTime = addHours(record.lastReset, windowHours);
    const isWindowExpired = isBefore(resetTime, now);

    if (isWindowExpired) {
      // Reset the window
      const updated = await prisma.rateLimit.update({
        where: { id: record.id },
        data: {
          count: 1,
          lastReset: now
        }
      });

      return {
        allowed: true,
        remaining: limit - 1,
        limit,
        reset: addHours(now, windowHours)
      };
    }

    if (record.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        limit,
        reset: resetTime
      };
    }

    // Increment count
    const updated = await prisma.rateLimit.update({
      where: { id: record.id },
      data: {
        count: { increment: 1 }
      }
    });

    return {
      allowed: true,
      remaining: limit - updated.count,
      limit,
      reset: resetTime
    };
  }
}
