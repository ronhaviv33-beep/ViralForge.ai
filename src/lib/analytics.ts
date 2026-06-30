import "server-only";
import { prisma } from "@/lib/prisma";
import { getUsageStatus } from "@/lib/usage";
import type { Plan } from "@prisma/client";

/** Hours of manual work we estimate each generated pack replaces. */
export const HOURS_SAVED_PER_GENERATION = 2;

export interface DashboardAnalytics {
  generatedThisMonth: number;
  /** Remaining generations this month. `null` when the plan is unlimited. */
  creditsRemaining: number | null;
  unlimited: boolean;
  estimatedHoursSaved: number;
  mostUsedTone: string | null;
  mostUsedPlatform: string | null;
  totalPacks: number;
}

/**
 * Computes dashboard analytics from existing Generation + Usage data.
 * No new tables required — tone counts use groupBy and platform counts use
 * a parameterized `unnest` query since platforms is a string array column.
 */
export async function getDashboardAnalytics(
  userId: string,
  plan: Plan
): Promise<DashboardAnalytics> {
  const usage = await getUsageStatus(userId, plan);

  const [total, toneGroups, platformRows] = await Promise.all([
    prisma.generation.count({ where: { userId } }),
    prisma.generation.groupBy({
      by: ["tone"],
      where: { userId },
      _count: { tone: true },
      orderBy: { _count: { tone: "desc" } },
      take: 1,
    }),
    prisma.$queryRaw<Array<{ platform: string }>>`
      SELECT unnest(platforms) AS platform, COUNT(*) AS count
      FROM "Generation"
      WHERE "userId" = ${userId}
      GROUP BY platform
      ORDER BY count DESC
      LIMIT 1
    `,
  ]);

  return {
    generatedThisMonth: usage.used,
    creditsRemaining: usage.unlimited ? null : usage.remaining,
    unlimited: usage.unlimited,
    estimatedHoursSaved: total * HOURS_SAVED_PER_GENERATION,
    mostUsedTone: toneGroups[0]?.tone ?? null,
    mostUsedPlatform: platformRows[0]?.platform ?? null,
    totalPacks: total,
  };
}

// ─── Analytics page ────────────────────────────────────────────────────────────

export interface RecentGeneration {
  id: string;
  title: string;
  tone: string;
  platforms: string[];
  createdAt: Date;
}

export interface UserAnalytics extends DashboardAnalytics {
  recentGenerations: RecentGeneration[];
  platformBreakdown: { platform: string; count: number }[];
  toneBreakdown: { tone: string; count: number }[];
  last30Days: { date: string; count: number }[];
}

/**
 * Extends getDashboardAnalytics with a recent-generations list.
 * Used exclusively by the /dashboard/analytics page.
 */
export async function getUserAnalytics(
  userId: string,
  plan: Plan
): Promise<UserAnalytics> {
  const [base, recentGenerations, platformRows, toneGroups, activityRows] =
    await Promise.all([
      getDashboardAnalytics(userId, plan),
      prisma.generation.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          title: true,
          tone: true,
          platforms: true,
          createdAt: true,
        },
      }),
      prisma.$queryRaw<Array<{ platform: string; count: bigint }>>`
        SELECT unnest(platforms) AS platform, COUNT(*) AS count
        FROM "Generation"
        WHERE "userId" = ${userId}
        GROUP BY platform
        ORDER BY count DESC
      `,
      prisma.generation.groupBy({
        by: ["tone"],
        where: { userId },
        _count: { tone: true },
        orderBy: { _count: { tone: "desc" } },
      }),
      prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
        SELECT DATE("createdAt") AS date, COUNT(*) AS count
        FROM "Generation"
        WHERE "userId" = ${userId}
          AND "createdAt" >= NOW() - INTERVAL '30 days'
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `,
    ]);

  return {
    ...base,
    recentGenerations,
    platformBreakdown: platformRows.map((r) => ({
      platform: r.platform,
      count: Number(r.count),
    })),
    toneBreakdown: toneGroups.map((r) => ({
      tone: r.tone,
      count: r._count.tone,
    })),
    last30Days: activityRows.map((r) => ({
      date:
        r.date instanceof Date
          ? r.date.toISOString().slice(0, 10)
          : String(r.date).slice(0, 10),
      count: Number(r.count),
    })),
  };
}
