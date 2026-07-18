import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { canUseIntegrations, syncConnectedAccount } from "@/lib/social-integrations";

export const runtime = "nodejs";
export const maxDuration = 60;

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

  // Platform APIs are rate-limited upstream — keep manual syncs modest.
  const rl = rateLimit(`integrations-sync:${user.id}`, 6, 60_000);
  if (!rl.success) {
    return NextResponse.json(
      { error: "You're syncing too fast. Please wait a moment." },
      { status: 429 }
    );
  }

  if (!canUseIntegrations(user.plan)) {
    return NextResponse.json(
      { error: "Integrations are available on paid plans." },
      { status: 403 }
    );
  }

  const { id } = await params;

  // Ownership enforced via the userId filter.
  const account = await prisma.connectedAccount.findFirst({
    where: { id, userId: user.id },
  });
  if (!account) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  try {
    const result = await syncConnectedAccount(account);
    return NextResponse.json({ ok: true, ...result });
  } catch {
    return NextResponse.json(
      { error: "Sync failed. Try reconnecting this account." },
      { status: 502 }
    );
  }
}
