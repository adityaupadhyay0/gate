import prisma from "@/lib/db/prisma";

export interface RateLimitConfig {
  limit?: number; // max allowed requests within window (default: 10)
  windowSeconds?: number; // duration of window in seconds (default: 600 = 10 minutes)
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetInSeconds: number;
  headers: Record<string, string>;
}

export class RateLimitService {
  /**
   * Checks and enforces rate limits for a given identifier using Prisma.
   *
   * @param identifier Unique rate limit key, e.g. `ai_explain:${userId}`
   * @param config Optional limit and window duration configuration
   */
  static async checkLimit(
    identifier: string,
    config: RateLimitConfig = {}
  ): Promise<RateLimitResult> {
    const limit = config.limit ?? 10;
    const windowSeconds = config.windowSeconds ?? 600;
    const now = new Date();

    const record = await prisma.rateLimit.findUnique({
      where: { identifier },
    });

    if (!record) {
      await prisma.rateLimit.create({
        data: {
          identifier,
          count: 1,
          windowStart: now,
        },
      });

      return this.formatResult(true, limit, limit - 1, windowSeconds);
    }

    const elapsedSeconds = (now.getTime() - record.windowStart.getTime()) / 1000;

    if (elapsedSeconds >= windowSeconds) {
      // Window has expired; reset count and new window start
      await prisma.rateLimit.update({
        where: { identifier },
        data: {
          count: 1,
          windowStart: now,
        },
      });

      return this.formatResult(true, limit, limit - 1, windowSeconds);
    }

    // Within current window
    const resetInSeconds = Math.max(1, Math.ceil(windowSeconds - elapsedSeconds));

    if (record.count >= limit) {
      return this.formatResult(false, limit, 0, resetInSeconds);
    }

    const newCount = record.count + 1;
    await prisma.rateLimit.update({
      where: { identifier },
      data: {
        count: newCount,
      },
    });

    return this.formatResult(true, limit, limit - newCount, resetInSeconds);
  }

  private static formatResult(
    success: boolean,
    limit: number,
    remaining: number,
    resetInSeconds: number
  ): RateLimitResult {
    const headers: Record<string, string> = {
      "X-RateLimit-Limit": limit.toString(),
      "X-RateLimit-Remaining": remaining.toString(),
      "X-RateLimit-Reset": resetInSeconds.toString(),
    };

    if (!success) {
      headers["Retry-After"] = resetInSeconds.toString();
    }

    return {
      success,
      limit,
      remaining,
      resetInSeconds,
      headers,
    };
  }
}
