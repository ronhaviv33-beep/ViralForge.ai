import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getBrandProfile, upsertBrandProfile } from "@/lib/brand-profile";
import { brandProfileSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET() {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const profile = await getBrandProfile(user.id);
    return NextResponse.json({ profile });
  } catch (err) {
    console.error("[brand-profile/get]", err);
    return NextResponse.json({ error: "Failed to load brand profile." }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = brandProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  try {
    const profile = await upsertBrandProfile(user.id, parsed.data);
    return NextResponse.json({ profile });
  } catch (err) {
    console.error("[brand-profile/put]", err);
    return NextResponse.json({ error: "Failed to save brand profile." }, { status: 500 });
  }
}
