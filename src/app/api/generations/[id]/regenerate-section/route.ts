import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { regenerateSectionSchema } from "@/lib/validation";
import { regenerateSection } from "@/lib/openai";
import { getBrandProfile, formatBrandProfileForPrompt } from "@/lib/brand-profile";
import { ContentPackSchema } from "@/lib/content-types";
import { rateLimit } from "@/lib/rate-limit";
import { startAgentRun, completeAgentRun, failAgentRun } from "@/lib/agent-runs";
import { getAgentUsageStatus } from "@/lib/agent-limits";
import { resolveContentLocale } from "@/lib/i18n";
import { getLocale, getT } from "@/lib/i18n-server";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Active site locale (vf_locale cookie): the regenerated section is written
  // in this language, keeping regeneration consistent with the visible UI.
  const locale = await getLocale();
  const t = await getT();

  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const rl = rateLimit(`regen-section:${user.id}`, 10, 60_000);
  if (!rl.success) {
    return NextResponse.json(
      { error: t("apiErrors.regenTooFast") },
      { status: 429 }
    );
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = regenerateSectionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  const { section } = parsed.data;

  // Load generation — userId filter enforces ownership.
  const generation = await prisma.generation.findFirst({
    where: { id, userId: user.id },
  });
  if (!generation) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  // Validate the stored pack is parseable.
  const packResult = ContentPackSchema.safeParse(generation.outputJson);
  if (!packResult.success) {
    return NextResponse.json({ error: "Generation data is corrupted." }, { status: 500 });
  }
  const pack = packResult.data;

  // Ensure the requested section actually exists in this pack.
  // Platform-specific sections only exist when that platform was originally selected.
  if (pack[section] === undefined) {
    return NextResponse.json(
      { error: "This section is not part of the selected generation." },
      { status: 400 }
    );
  }

  // Regenerate in the language the pack was originally generated in. Legacy
  // generations (no stored language) fall back to the active UI locale.
  const contentLocale = resolveContentLocale(generation.contentLanguage, locale);

  const brandProfile = await getBrandProfile(user.id);
  let brandContext = formatBrandProfileForPrompt(brandProfile);

  // Plan gating: when the Creator Agent is blocked (plan or monthly limit),
  // the section still regenerates — just without personalization.
  if (brandContext) {
    const agentStatus = await getAgentUsageStatus(user.id, user.plan);
    if (agentStatus.blocked) {
      brandContext = null;
    }
  }

  // Runtime tracking: only Creator Agent-assisted runs (i.e. profile applied).
  // A null runId (no context, or tracking failure) makes the finalizers no-ops.
  const runId = brandContext
    ? await startAgentRun({
        userId: user.id,
        agentType: "creator_agent",
        actionType: "regenerate_section",
        generationId: id,
      })
    : null;

  let newValue: unknown;
  let meta;
  try {
    ({ value: newValue, meta } = await regenerateSection(
      section,
      {
        inputText: generation.inputText,
        tone: generation.tone,
        platforms: generation.platforms,
        outputJson: pack,
      },
      brandContext,
      contentLocale
    ));
  } catch (err) {
    console.error("[regen-section] AI error", err);
    await failAgentRun(runId, err instanceof Error ? err.message : "AI call failed");
    return NextResponse.json(
      { error: t("apiErrors.regenFailed") },
      { status: 502 }
    );
  }

  // Merge new value and re-validate the complete pack before saving.
  const mergedResult = ContentPackSchema.safeParse({ ...pack, [section]: newValue });
  if (!mergedResult.success) {
    console.error("[regen-section] merged pack invalid", mergedResult.error);
    await failAgentRun(runId, "AI output failed pack validation", meta);
    return NextResponse.json(
      { error: t("apiErrors.regenBadFormat") },
      { status: 502 }
    );
  }

  try {
    await prisma.generation.update({
      where: { id },
      data: { outputJson: mergedResult.data },
    });
  } catch (err) {
    console.error("[regen-section] persist error", err);
    // The AI work itself succeeded (and cost was incurred) — record it.
    await completeAgentRun(runId, meta);
    return NextResponse.json(
      { error: t("apiErrors.regenSaveFailed") },
      { status: 500 }
    );
  }

  await completeAgentRun(runId, meta);
  return NextResponse.json({ section, value: mergedResult.data[section] });
}
