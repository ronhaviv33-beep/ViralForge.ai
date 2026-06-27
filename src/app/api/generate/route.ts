import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { generateSchema } from "@/lib/validation";
import { generateContentPack, deriveTitle } from "@/lib/openai";
import { getUsageStatus, incrementUsage } from "@/lib/usage";
import { rateLimit } from "@/lib/rate-limit";

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

  let pack;
  try {
    pack = await generateContentPack(text, tone, platforms);
  } catch (err) {
    console.error("[generate] AI error", err);
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

    return NextResponse.json({ id: generation.id, output: pack });
  } catch (err) {
    console.error("[generate] persist error", err);
    return NextResponse.json(
      { error: "Generated, but failed to save. Please try again." },
      { status: 500 }
    );
  }
}
