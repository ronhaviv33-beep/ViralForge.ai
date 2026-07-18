import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  isSocialPlatform,
  isPlatformConfigured,
  canUseIntegrations,
  signConnectState,
  buildAuthUrl,
} from "@/lib/social-integrations";

export const runtime = "nodejs";

function integrationsUrl(param?: string): string {
  const base = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
  return `${base}/dashboard/integrations${param ? `?${param}` : ""}`;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ platform: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(integrationsUrl());
  }

  const { platform } = await params;
  if (!isSocialPlatform(platform) || !isPlatformConfigured(platform)) {
    return NextResponse.redirect(integrationsUrl("error=unavailable"));
  }

  if (!canUseIntegrations(user.plan)) {
    return NextResponse.redirect(integrationsUrl("error=plan"));
  }

  const state = await signConnectState(user.id, platform);
  return NextResponse.redirect(buildAuthUrl(platform, state));
}
