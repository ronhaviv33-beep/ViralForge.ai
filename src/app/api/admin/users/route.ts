import { NextResponse } from "next/server";
import { requireAdminUser, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adminCreateUserSchema } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    await requireAdminUser();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = adminCreateUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  const { name, email, password, plan, role } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "A user with this email already exists." },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      name: name ?? null,
      passwordHash,
      plan,
      role,
      // Admin-created accounts are considered verified — no email round-trip.
      emailVerified: new Date(),
    },
  });

  return NextResponse.json({ ok: true, id: user.id });
}
