import "server-only";
import { prisma } from "@/lib/prisma";
import type { Plan } from "@prisma/client";
import type { PlanId } from "@/lib/plans";

/**
 * Creator Agent plan gating — single source of truth.
 *
 * Rules (MVP):
 * - A "run" is one Creator Agent-assisted AI action (full pack generation or
 *   section regeneration where the user's saved profile was applied).
 * - Only SUCCESSFUL runs consume the monthly limit. Failed runs stay visible
 *   in AgentRun for internal observability but never charge the user's quota.
 * - Limits reset at the start of each calendar month (UTC), matching the
 *   existing generation-quota behavior in src/lib/usage.ts.
 * - Estimated cost is aggregated for internal awareness only. It is NOT used
 *   for blocking in this first layer (run counts are deterministic; cost data
 *   can be partial when a model is unknown), and it must never be shown to
 *   users as exact billing.
 *
 * Limit rationale: free gets a small trial so users feel the value before
 * upgrading; paid tiers get headroom above their generation limits since
 * section regenerations also consume agent runs.
 */
export interface AgentPlanLimit {
  /** Whether the Creator Agent personalizes content on this plan. */
  enabled: boolean;
  /** Max successful Creator Agent runs per calendar month. */
  monthlyRuns: number;
}

export const AGENT_LIMITS: Record<PlanId, AgentPlanLimit> = {
  free: { enabled: true, monthlyRuns: 5 },
  creator: { enabled: true, monthlyRuns: 150 },
  pro: { enabled: true, monthlyRuns: 500 },
  agency: { enabled: true, monthlyRuns: 1500 },
};

export interface AgentUsageStatus {
  /** Creator Agent is available on this plan at all. */
  enabled: boolean;
  /** Successful runs this calendar month. */
  used: number;
  /** Monthly run limit for the plan. */
  limit: number;
  /** Runs left this month (0 when blocked or disabled). */
  remaining: number;
  /** True when the agent must not be applied (plan disabled or limit hit). */
  blocked: boolean;
  /** Why the agent is blocked, when it is. */
  blockedReason: "plan" | "limit" | null;
  /** Internal-only: estimated cost of this month's runs (partial data safe). */
  estimatedMonthCostUsd: number;
}

/** Start of the current calendar month in UTC. */
function monthStartUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

/** Successful Creator Agent runs for the current month. */
export async function getCurrentMonthAgentRunCount(userId: string): Promise<number> {
  return prisma.agentRun.count({
    where: {
      userId,
      agentType: "creator_agent",
      status: "success",
      createdAt: { gte: monthStartUtc() },
    },
  });
}

/** Internal-only estimated cost of this month's Creator Agent runs. Null-cost rows contribute 0. */
export async function getCurrentMonthAgentCost(userId: string): Promise<number> {
  const result = await prisma.agentRun.aggregate({
    where: {
      userId,
      agentType: "creator_agent",
      createdAt: { gte: monthStartUtc() },
    },
    _sum: { estimatedCostUsd: true },
  });
  return result._sum.estimatedCostUsd ?? 0;
}

/** Full gating status for a user. */
export async function getAgentUsageStatus(
  userId: string,
  plan: Plan | PlanId
): Promise<AgentUsageStatus> {
  const config = AGENT_LIMITS[plan as PlanId] ?? AGENT_LIMITS.free;

  if (!config.enabled) {
    return {
      enabled: false,
      used: 0,
      limit: 0,
      remaining: 0,
      blocked: true,
      blockedReason: "plan",
      estimatedMonthCostUsd: 0,
    };
  }

  const [used, estimatedMonthCostUsd] = await Promise.all([
    getCurrentMonthAgentRunCount(userId),
    getCurrentMonthAgentCost(userId),
  ]);

  const remaining = Math.max(0, config.monthlyRuns - used);
  const blocked = remaining <= 0;

  return {
    enabled: true,
    used,
    limit: config.monthlyRuns,
    remaining,
    blocked,
    blockedReason: blocked ? "limit" : null,
    estimatedMonthCostUsd,
  };
}

/** Convenience boolean check for the generation paths. */
export async function canUseCreatorAgent(
  userId: string,
  plan: Plan | PlanId
): Promise<boolean> {
  const status = await getAgentUsageStatus(userId, plan);
  return !status.blocked;
}
