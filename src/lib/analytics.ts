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
