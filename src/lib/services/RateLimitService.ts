import prisma from "@/lib/db/prisma";
import { addHours, isAfter } from "date-fns";

export interface RateLimitStatus {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: Date;
}

export class RateLimitService {
  private static LIMIT = 20;
  private static WINDOW_HOURS = 24;

  /**
   * Checks if a user is within their rate limit for a specific action.
   * If allowed, it increments the count.
   */
  static async checkAndIncrement(userId: string, action: string): Promise<RateLimitStatus> {
    const now = new Date();

    // Find existing rate limit record
    const rateLimit = await prisma.rateLimit.findUnique({
      where: {
        userId_action: {
          userId,
          action,
        },
      },
    });

    if (!rateLimit) {
      // First time using this action
      try {
        const newLimit = await prisma.rateLimit.create({
          data: {
            userId,
            action,
            count: 1,
            windowStart: now,
          },
        });

        return {
          allowed: true,
          limit: this.LIMIT,
          remaining: this.LIMIT - 1,
          reset: addHours(newLimit.windowStart, this.WINDOW_HOURS),
        };
      } catch (e: any) {
        // Handle race condition where record was created between findUnique and create
        if (e.code === 'P2002') {
          return this.checkAndIncrement(userId, action);
        }
        throw e;
      }
    }

    const windowEnd = addHours(rateLimit.windowStart, this.WINDOW_HOURS);

    // If window has expired, reset the counter
    if (isAfter(now, windowEnd)) {
      const resetLimit = await prisma.rateLimit.update({
        where: { id: rateLimit.id },
        data: {
          count: 1,
          windowStart: now,
        },
      });

      return {
        allowed: true,
        limit: this.LIMIT,
        remaining: this.LIMIT - 1,
        reset: addHours(resetLimit.windowStart, this.WINDOW_HOURS),
      };
    }

    // Within window, check count
    if (rateLimit.count >= this.LIMIT) {
      return {
        allowed: false,
        limit: this.LIMIT,
        remaining: 0,
        reset: windowEnd,
      };
    }

    // Increment count
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
      limit: this.LIMIT,
      remaining: this.LIMIT - updatedLimit.count,
      reset: windowEnd,
    };
  }

  /**
   * Just gets the current status without incrementing.
   */
  static async getStatus(userId: string, action: string): Promise<RateLimitStatus> {
    const now = new Date();

    const rateLimit = await prisma.rateLimit.findUnique({
      where: {
        userId_action: {
          userId,
          action,
        },
      },
    });

    if (!rateLimit) {
      return {
        allowed: true,
        limit: this.LIMIT,
        remaining: this.LIMIT,
        reset: addHours(now, this.WINDOW_HOURS),
      };
    }

    const windowEnd = addHours(rateLimit.windowStart, this.WINDOW_HOURS);

    if (isAfter(now, windowEnd)) {
      return {
        allowed: true,
        limit: this.LIMIT,
        remaining: this.LIMIT,
        reset: addHours(now, this.WINDOW_HOURS),
      };
    }

    return {
      allowed: rateLimit.count < this.LIMIT,
      limit: this.LIMIT,
      remaining: Math.max(0, this.LIMIT - rateLimit.count),
      reset: windowEnd,
    };
  }
}
