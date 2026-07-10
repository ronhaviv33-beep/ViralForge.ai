import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { resetPasswordSchema } from "@/lib/validation";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const rl = rateLimit(clientKey(req, "reset-password"), 10, 60_000);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a minute." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  const { token, password } = parsed.data;

  const record = await prisma.verificationToken.findUnique({ where: { token } });

  if (
    !record ||
    record.type !== "PASSWORD_RESET" ||
    record.usedAt !== null ||
    record.expiresAt < new Date()
  ) {
    return NextResponse.json(
      { error: "This reset link is invalid or has expired." },
      { status: 400 }
    );
  }

  const passwordHash = await hashPassword(password);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    prisma.verificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
