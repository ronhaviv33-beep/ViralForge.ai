import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validation";
import { sendPasswordResetEmail } from "@/lib/email";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

const RESET_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

const GENERIC_OK = NextResponse.json({
  message: "If that email exists, a reset link has been sent.",
});

export async function POST(req: Request) {
  const rl = rateLimit(clientKey(req, "forgot-password"), 5, 60_000);
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

  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  const { email } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  // Return generic response regardless — don't reveal if email exists.
  if (!user) return GENERIC_OK;

  // Delete any existing pending reset tokens for this user.
  await prisma.verificationToken.deleteMany({
    where: { userId: user.id, type: "PASSWORD_RESET", usedAt: null },
  });

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + RESET_EXPIRY_MS);

  await prisma.verificationToken.create({
    data: { userId: user.id, token, type: "PASSWORD_RESET", expiresAt },
  });

  try {
    await sendPasswordResetEmail(email, token);
  } catch (err) {
    console.error("[forgot-password] email error:", err);
    // Still return generic OK — the token is in DB; log the error.
  }

  return GENERIC_OK;
}
