import prisma from "@/lib/db/prisma";
import { addHours } from "date-fns";

export interface RateLimitStatus {
  limit: number;
  remaining: number;
  reset: Date;
}

export class RateLimitService {
  static async checkLimit(
    userId: string,
    key: string,
    limit: number,
    windowHours: number
  ): Promise<RateLimitStatus> {
    const rateLimit = await prisma.rateLimit.findUnique({
      where: {
        userId_key: { userId, key }
      }
    });

    const now = new Date();

    if (!rateLimit || now > rateLimit.resetAt) {
      return {
        limit,
        remaining: limit,
        reset: addHours(now, windowHours)
      };
    }

    return {
      limit,
      remaining: Math.max(0, limit - rateLimit.count),
      reset: rateLimit.resetAt
    };
  }

  static async incrementUsage(
    userId: string,
    key: string,
    windowHours: number
  ): Promise<void> {
    const now = new Date();

    const rateLimit = await prisma.rateLimit.findUnique({
      where: {
        userId_key: { userId, key }
      }
    });

    if (!rateLimit || now > rateLimit.resetAt) {
      await prisma.rateLimit.upsert({
        where: {
          userId_key: { userId, key }
        },
        update: {
          count: 1,
          resetAt: addHours(now, windowHours)
        },
        create: {
          userId,
          key,
          count: 1,
          resetAt: addHours(now, windowHours)
        }
      });
    } else {
      await prisma.rateLimit.update({
        where: {
          userId_key: { userId, key }
        },
        data: {
          count: { increment: 1 }
        }
      });
    }
  }
}
