import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Runtime tracking for Creator Agent-assisted AI work.
 *
 * Every function here is fail-safe by design: tracking must never break the
 * user-facing flow, so errors are logged and swallowed. A null runId (from a
 * failed start) turns the finalizers into no-ops.
 */

export type AgentActionType = "generate_pack" | "regenerate_section";

export interface AgentRunMeta {
  generationId?: string | null;
  model?: string | null;
  inputTokens?: number | null;
  outputTokens?: number | null;
}

/**
 * Estimated USD cost per token pair, from a small static pricing map.
 * Internal observability only — not invoice-grade. Unknown model → null.
 * Prices are USD per 1M tokens: [input, output].
 */
const MODEL_PRICING_PER_1M: Record<string, [number, number]> = {
  "gpt-4o-mini": [0.15, 0.6],
  "gpt-4o": [2.5, 10],
  "gpt-4.1-mini": [0.4, 1.6],
  "gpt-4.1": [2, 8],
};

export function estimateCostUsd(
  model: string | null | undefined,
  inputTokens: number | null | undefined,
  outputTokens: number | null | undefined
): number | null {
  if (!model || inputTokens == null || outputTokens == null) return null;
  // Match snapshot names like "gpt-4o-mini-2024-07-18" to their base model.
  const key = Object.keys(MODEL_PRICING_PER_1M)
    .sort((a, b) => b.length - a.length)
    .find((k) => model === k || model.startsWith(`${k}-`));
  if (!key) return null;
  const [inPrice, outPrice] = MODEL_PRICING_PER_1M[key];
  return (inputTokens * inPrice + outputTokens * outPrice) / 1_000_000;
}

/** Creates a pending run row. Returns the run id, or null if tracking failed. */
export async function startAgentRun(params: {
  userId: string;
  agentType: string;
  actionType: AgentActionType;
  generationId?: string | null;
}): Promise<string | null> {
  try {
    const run = await prisma.agentRun.create({
      data: {
        userId: params.userId,
        agentType: params.agentType,
        actionType: params.actionType,
        generationId: params.generationId ?? null,
      },
    });
    return run.id;
  } catch (err) {
    console.error("[agent-runs] start failed", err);
    return null;
  }
}

/** Marks a run successful with whatever metadata is available. No-op when runId is null. */
export async function completeAgentRun(
  runId: string | null,
  meta: AgentRunMeta = {}
): Promise<void> {
  if (!runId) return;
  try {
    await prisma.agentRun.update({
      where: { id: runId },
      data: {
        status: "success",
        completedAt: new Date(),
        generationId: meta.generationId ?? undefined,
        model: meta.model ?? undefined,
        inputTokens: meta.inputTokens ?? undefined,
        outputTokens: meta.outputTokens ?? undefined,
        estimatedCostUsd:
          estimateCostUsd(meta.model, meta.inputTokens, meta.outputTokens) ??
          undefined,
      },
    });
  } catch (err) {
    console.error("[agent-runs] complete failed", err);
  }
}

/** Marks a run failed. No-op when runId is null. */
export async function failAgentRun(
  runId: string | null,
  errorMessage: string,
  meta: AgentRunMeta = {}
): Promise<void> {
  if (!runId) return;
  try {
    await prisma.agentRun.update({
      where: { id: runId },
      data: {
        status: "error",
        completedAt: new Date(),
        errorMessage: errorMessage.slice(0, 500),
        model: meta.model ?? undefined,
        inputTokens: meta.inputTokens ?? undefined,
        outputTokens: meta.outputTokens ?? undefined,
      },
    });
  } catch (err) {
    console.error("[agent-runs] fail-update failed", err);
  }
}
