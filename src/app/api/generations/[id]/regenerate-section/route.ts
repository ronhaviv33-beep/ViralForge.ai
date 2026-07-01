import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { regenerateSectionSchema } from "@/lib/validation";
import { regenerateSection } from "@/lib/openai";
import { getBrandProfile, formatBrandProfileForPrompt } from "@/lib/brand-profile";
import { ContentPackSchema } from "@/lib/content-types";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const rl = rateLimit(`regen-section:${user.id}`, 10, 60_000);
  if (!rl.success) {
    return NextResponse.json(
      { error: "You're regenerating too fast. Please wait a moment." },
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

  const brandProfile = await getBrandProfile(user.id);
  const brandContext = formatBrandProfileForPrompt(brandProfile);

  let newValue: unknown;
  try {
    newValue = await regenerateSection(
      section,
      {
        inputText: generation.inputText,
        tone: generation.tone,
        platforms: generation.platforms,
        outputJson: pack,
      },
      brandContext
    );
  } catch (err) {
    console.error("[regen-section] AI error", err);
    return NextResponse.json(
      { error: "We couldn't regenerate this section. Please try again." },
      { status: 502 }
    );
  }

  // Merge new value and re-validate the complete pack before saving.
  const mergedResult = ContentPackSchema.safeParse({ ...pack, [section]: newValue });
  if (!mergedResult.success) {
    console.error("[regen-section] merged pack invalid", mergedResult.error);
    return NextResponse.json(
      { error: "The AI returned an unexpected format. Please try again." },
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
    return NextResponse.json(
      { error: "Regenerated but failed to save. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ section, value: mergedResult.data[section] });
}
