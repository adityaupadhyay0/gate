import prisma from "@/lib/db/prisma";
import { addHours, isBefore } from "date-fns";
import { AI_CONFIG } from "@/lib/config/ai";

export class RateLimitService {
  /**
   * Checks and increments the rate limit for a specific user and key.
   * Returns an object indicating if the request is allowed and the current limit status.
   */
  static async checkAndIncrement(userId: string, key: string) {
    const now = new Date();
    const windowStart = addHours(now, -AI_CONFIG.RATE_LIMIT_WINDOW_HOURS);

    // Find existing rate limit record
    const rateLimit = await prisma.rateLimit.findUnique({
      where: {
        userId_key: {
          userId,
          key,
        },
      },
    });

    // If no record exists or last reset was before the window, create/reset
    if (!rateLimit || isBefore(rateLimit.lastReset, windowStart)) {
      const updated = await prisma.rateLimit.upsert({
        where: {
          userId_key: {
            userId,
            key,
          },
        },
        update: {
          count: 1,
          lastReset: now,
        },
        create: {
          userId,
          key,
          count: 1,
          lastReset: now,
        },
      });

      return {
        allowed: true,
        remaining: AI_CONFIG.RATE_LIMIT_LIMIT - 1,
        limit: AI_CONFIG.RATE_LIMIT_LIMIT,
        reset: addHours(updated.lastReset, AI_CONFIG.RATE_LIMIT_WINDOW_HOURS),
      };
    }

    // Check if limit exceeded
    if (rateLimit.count >= AI_CONFIG.RATE_LIMIT_LIMIT) {
      return {
        allowed: false,
        remaining: 0,
        limit: AI_CONFIG.RATE_LIMIT_LIMIT,
        reset: addHours(rateLimit.lastReset, AI_CONFIG.RATE_LIMIT_WINDOW_HOURS),
      };
    }

    // Increment count
    const updated = await prisma.rateLimit.update({
      where: {
        id: rateLimit.id,
      },
      data: {
        count: {
          increment: 1,
        },
      },
    });

    return {
      allowed: true,
      remaining: AI_CONFIG.RATE_LIMIT_LIMIT - updated.count,
      limit: AI_CONFIG.RATE_LIMIT_LIMIT,
      reset: addHours(updated.lastReset, AI_CONFIG.RATE_LIMIT_WINDOW_HOURS),
    };
  }
}
