import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id } = await params;

  // Ownership enforced via the userId filter.
  const account = await prisma.connectedAccount.findFirst({
    where: { id, userId: user.id },
  });
  if (!account) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  // Cascade removes the account's external posts and their snapshots.
  await prisma.connectedAccount.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
