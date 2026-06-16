import prisma from "@/lib/db/prisma";
import { addHours } from "date-fns";

export class RateLimitService {
  /**
   * Checks if a user has exceeded the rate limit for a specific feature.
   * @param userId The ID of the user.
   * @param key The feature key (e.g., 'ai_explain').
   * @param limit The maximum number of requests allowed in the window.
   * @param windowHours The window duration in hours.
   */
  static async checkLimit(
    userId: string,
    key: string,
    limit: number = 20,
    windowHours: number = 24
  ) {
    const now = new Date();

    const rateLimit = await prisma.rateLimit.findUnique({
      where: {
        userId_key: {
          userId,
          key,
        },
      },
    });

    if (!rateLimit) {
      return {
        isAllowed: true,
        remaining: limit,
        resetAt: addHours(now, windowHours),
      };
    }

    if (now > rateLimit.resetAt) {
      // Window expired, reset count
      await prisma.rateLimit.update({
        where: { id: rateLimit.id },
        data: {
          count: 0,
          resetAt: addHours(now, windowHours),
        },
      });

      return {
        isAllowed: true,
        remaining: limit,
        resetAt: addHours(now, windowHours),
      };
    }

    const isAllowed = rateLimit.count < limit;
    const remaining = Math.max(0, limit - rateLimit.count);

    return {
      isAllowed,
      remaining,
      resetAt: rateLimit.resetAt,
    };
  }

  /**
   * Checks the limit and increments usage in one atomic-like operation to prevent race conditions.
   * Note: SQLite through Prisma doesn't support complex atomic transactions with conditionals easily,
   * but upsert with increment is the safest pattern here.
   */
  static async checkAndIncrement(
    userId: string,
    key: string,
    limit: number = 20,
    windowHours: number = 24
  ) {
    const now = new Date();

    // 1. Check current state
    const current = await prisma.rateLimit.findUnique({
      where: { userId_key: { userId, key } }
    });

    // 2. Handle reset or initial creation
    if (!current || now > current.resetAt) {
      await prisma.rateLimit.upsert({
        where: { userId_key: { userId, key } },
        create: {
          userId,
          key,
          count: 1,
          resetAt: addHours(now, windowHours),
        },
        update: {
          count: 1,
          resetAt: addHours(now, windowHours),
        },
      });
      return { isAllowed: true, remaining: limit - 1, resetAt: addHours(now, windowHours) };
    }

    // 3. Check if allowed
    if (current.count >= limit) {
      return {
        isAllowed: false,
        remaining: 0,
        resetAt: current.resetAt
      };
    }

    // 4. Increment usage
    const updated = await prisma.rateLimit.update({
      where: { id: current.id },
      data: { count: { increment: 1 } }
    });

    return {
      isAllowed: true,
      remaining: limit - updated.count,
      resetAt: current.resetAt
    };
  }

  /**
   * Increments the usage count for a user and feature.
   * @deprecated Use checkAndIncrement to prevent race conditions
   */
  static async incrementUsage(
    userId: string,
    key: string,
    windowHours: number = 24
  ) {
    const now = new Date();

    await prisma.rateLimit.upsert({
      where: {
        userId_key: {
          userId,
          key,
        },
      },
      create: {
        userId,
        key,
        count: 1,
        resetAt: addHours(now, windowHours),
      },
      update: {
        count: {
          increment: 1,
        },
      },
    });
  }
}
