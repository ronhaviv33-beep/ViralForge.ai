import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSession } from "@/lib/auth";
import { signupSchema } from "@/lib/validation";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  // Throttle signups per IP to slow abuse.
  const rl = rateLimit(clientKey(req, "signup"), 10, 60_000);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again shortly." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  const { email, password, name } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, name: name ?? null, passwordHash },
    });

    await createSession(user.id);

    // Non-blocking: send verification email. Failure does not abort signup.
    const verifyToken = randomBytes(32).toString("hex");
    prisma.verificationToken
      .create({
        data: {
          userId: user.id,
          token: verifyToken,
          type: "EMAIL_VERIFICATION",
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      })
      .then(() => sendVerificationEmail(user.email, verifyToken))
      .catch((err: unknown) => console.error("[signup] verification email:", err));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[signup]", err);
    return NextResponse.json(
      { error: "Could not create your account. Please try again." },
      { status: 500 }
    );
  }
}
