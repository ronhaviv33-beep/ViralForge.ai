import "server-only";
import { prisma } from "@/lib/prisma";
import { getPlanLimit, isUnlimited } from "@/lib/plans";
import type { Plan } from "@prisma/client";

/** Current month key in YYYY-MM (UTC). */
export function currentMonth(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export interface UsageStatus {
  used: number;
  limit: number; // -1 = unlimited
  unlimited: boolean;
  remaining: number; // Infinity when unlimited
  canGenerate: boolean;
  month: string;
}

/** Read the user's usage status for the current month. */
export async function getUsageStatus(
  userId: string,
  plan: Plan
): Promise<UsageStatus> {
  const month = currentMonth();
  const usage = await prisma.usage.findUnique({
    where: { userId_month: { userId, month } },
  });
  const used = usage?.generationCount ?? 0;
  const limit = getPlanLimit(plan);
  const unlimited = isUnlimited(plan);
  const remaining = unlimited ? Infinity : Math.max(0, limit - used);
  return {
    used,
    limit,
    unlimited,
    remaining,
    canGenerate: unlimited || used < limit,
    month,
  };
}

/**
 * Atomically increments this month's usage counter.
 * Call only after a successful generation.
 */
export async function incrementUsage(userId: string): Promise<void> {
  const month = currentMonth();
  await prisma.usage.upsert({
    where: { userId_month: { userId, month } },
    create: { userId, month, generationCount: 1 },
    update: { generationCount: { increment: 1 } },
  });
}
