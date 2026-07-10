import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    redirect("/login?verified=error");
  }

  const record = await prisma.verificationToken.findUnique({ where: { token } });

  if (
    !record ||
    record.type !== "EMAIL_VERIFICATION" ||
    record.usedAt !== null ||
    record.expiresAt < new Date()
  ) {
    redirect("/login?verified=error");
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: new Date() },
    }),
    prisma.verificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);

  redirect("/login?verified=true");
}
