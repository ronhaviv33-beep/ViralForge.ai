import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  isSocialPlatform,
  verifyConnectState,
  completeConnection,
} from "@/lib/social-integrations";

export const runtime = "nodejs";

function integrationsUrl(param?: string): string {
  const base = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
  return `${base}/dashboard/integrations${param ? `?${param}` : ""}`;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params;
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  // The user denied access, or the provider returned an error.
  if (!code || !state || searchParams.get("error")) {
    return NextResponse.redirect(integrationsUrl("error=connect_failed"));
  }

  if (!isSocialPlatform(platform)) {
    return NextResponse.redirect(integrationsUrl("error=unavailable"));
  }

  // The signed state must be valid, match this platform, and belong to the
  // user who is currently logged in — this defeats CSRF and login confusion.
  const statePayload = await verifyConnectState(state);
  const user = await getCurrentUser();
  if (
    !statePayload ||
    statePayload.platform !== platform ||
    !user ||
    user.id !== statePayload.userId
  ) {
    return NextResponse.redirect(integrationsUrl("error=connect_failed"));
  }

  try {
    await completeConnection(user.id, platform, code);
  } catch (err) {
    console.error(`[integrations] ${platform} connection failed`, err);
    return NextResponse.redirect(integrationsUrl("error=connect_failed"));
  }

  return NextResponse.redirect(integrationsUrl("connected=1"));
}
