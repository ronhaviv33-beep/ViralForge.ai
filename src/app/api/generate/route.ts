import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { generateSchema } from "@/lib/validation";
import { generateContentPack, deriveTitle } from "@/lib/openai";
import { getUsageStatus, incrementUsage } from "@/lib/usage";
import { rateLimit } from "@/lib/rate-limit";
import { getBrandProfile, formatBrandProfileForPrompt } from "@/lib/brand-profile";
import { startAgentRun, completeAgentRun, failAgentRun } from "@/lib/agent-runs";
import { getAgentUsageStatus } from "@/lib/agent-limits";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  // Per-user burst protection (separate from monthly plan limits).
  const rl = rateLimit(`generate:${user.id}`, 8, 60_000);
  if (!rl.success) {
    return NextResponse.json(
      { error: "You're generating too fast. Please wait a moment." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = generateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  // Enforce monthly plan limits.
  const usage = await getUsageStatus(user.id, user.plan);
  if (!usage.canGenerate) {
    return NextResponse.json(
      {
        error:
          "You've reached your monthly generation limit. Upgrade your plan to keep creating.",
        code: "LIMIT_REACHED",
      },
      { status: 402 }
    );
  }

  const { text, tone, platforms } = parsed.data;

  const brandProfile = await getBrandProfile(user.id);
  let brandContext = formatBrandProfileForPrompt(brandProfile);

  // Plan gating: if the Creator Agent is blocked (plan or monthly limit),
  // generation proceeds normally — just without personalization. Never turn a
  // working generation into a hard failure over agent limits.
  let agentBlockedReason: "plan" | "limit" | null = null;
  if (brandContext) {
    const agentStatus = await getAgentUsageStatus(user.id, user.plan);
    if (agentStatus.blocked) {
      brandContext = null;
      agentBlockedReason = agentStatus.blockedReason;
    }
  }

  // Runtime tracking: only Creator Agent-assisted runs (i.e. profile applied).
  // A null runId (no context, or tracking failure) makes the finalizers no-ops.
  const runId = brandContext
    ? await startAgentRun({
        userId: user.id,
        agentType: "creator_agent",
        actionType: "generate_pack",
      })
    : null;

  let pack;
  let meta;
  try {
    ({ pack, meta } = await generateContentPack(text, tone, platforms, brandContext));
  } catch (err) {
    console.error("[generate] AI error", err);
    await failAgentRun(runId, err instanceof Error ? err.message : "AI call failed");
    const message =
      err instanceof Error && err.message.startsWith("OPENAI")
        ? "AI service is not configured. Please contact support."
        : "We couldn't generate your content. Please try again.";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  try {
    const generation = await prisma.generation.create({
      data: {
        userId: user.id,
        inputText: text,
        tone,
        platforms,
        outputJson: pack,
        title: deriveTitle(text),
      },
    });

    // Only count successful, persisted generations against the quota.
    await incrementUsage(user.id);

    await completeAgentRun(runId, { generationId: generation.id, ...meta });

    return NextResponse.json({
      id: generation.id,
      output: pack,
      agentApplied: Boolean(brandContext),
      agentBlockedReason,
    });
  } catch (err) {
    console.error("[generate] persist error", err);
    // The AI work itself succeeded (and cost was incurred) — record it as a
    // successful run without a generation link.
    await completeAgentRun(runId, meta);
    return NextResponse.json(
      { error: "Generated, but failed to save. Please try again." },
      { status: 500 }
    );
  }
}
