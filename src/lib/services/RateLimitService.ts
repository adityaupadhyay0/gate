import prisma from "@/lib/db/prisma";
import { addHours } from "date-fns";

export interface RateLimitResult {
  isLimited: boolean;
  remaining: number;
  reset: Date;
  limit: number;
}

export class RateLimitService {
  private static DEFAULT_LIMITS: Record<string, { count: number; windowHours: number }> = {
    'ai_explain': { count: 20, windowHours: 24 }
  };

  /**
   * Checks if a user has exceeded the rate limit for a given key.
   * If not limited, it increments the count and returns the status.
   */
  static async checkAndIncrement(userId: string, key: string): Promise<RateLimitResult> {
    const config = this.DEFAULT_LIMITS[key] || { count: 10, windowHours: 24 };
    const now = new Date();

    const rateLimit = await prisma.rateLimit.upsert({
      where: {
        userId_key: { userId, key }
      },
      create: {
        userId,
        key,
        count: 1,
        resetAt: addHours(now, config.windowHours)
      },
      update: {
        count: { increment: 1 }
      }
    });

    // If window has expired, reset
    if (now > rateLimit.resetAt) {
      const updated = await prisma.rateLimit.update({
        where: { id: rateLimit.id },
        data: {
          count: 1,
          resetAt: addHours(now, config.windowHours)
        }
      });
      return {
        isLimited: false,
        remaining: config.count - 1,
        reset: updated.resetAt,
        limit: config.count
      };
    }

    // If limit reached (before this increment)
    // Actually, upsert already incremented it if it existed.
    // So we need to check if it's ABOVE the limit now.
    if (rateLimit.count > config.count) {
      // Revert the increment if we want to be strict, but for simple rate limiting,
      // just blocking is enough.
      return {
        isLimited: true,
        remaining: 0,
        reset: rateLimit.resetAt,
        limit: config.count
      };
    }

    return {
      isLimited: false,
      remaining: Math.max(0, config.count - rateLimit.count),
      reset: rateLimit.resetAt,
      limit: config.count
    };
  }

  /**
   * Get current status without incrementing
   */
  static async getStatus(userId: string, key: string): Promise<RateLimitResult> {
    const config = this.DEFAULT_LIMITS[key] || { count: 10, windowHours: 24 };
    const now = new Date();

    const rateLimit = await prisma.rateLimit.findUnique({
      where: {
        userId_key: { userId, key }
      }
    });

    if (!rateLimit || now > rateLimit.resetAt) {
      return {
        isLimited: false,
        remaining: config.count,
        reset: addHours(now, config.windowHours),
        limit: config.count
      };
    }

    return {
      isLimited: rateLimit.count >= config.count,
      remaining: Math.max(0, config.count - rateLimit.count),
      reset: rateLimit.resetAt,
      limit: config.count
    };
  }
}
