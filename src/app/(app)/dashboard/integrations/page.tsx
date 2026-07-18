import Link from "next/link";
import { Instagram, Youtube, Music2, Plug, ExternalLink } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  SOCIAL_PLATFORMS,
  isPlatformConfigured,
  canUseIntegrations,
} from "@/lib/social-integrations";
import { getLocale, getT } from "@/lib/i18n-server";
import { dateLocale } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  SyncAccountButton,
  DisconnectAccountButton,
} from "@/components/dashboard/integration-actions";
import type { SocialPlatform } from "@prisma/client";

export const metadata = { title: "Integrations – ViralForge" };

const PLATFORM_META: Record<
  SocialPlatform,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  instagram: { label: "Instagram", icon: Instagram },
  youtube: { label: "YouTube", icon: Youtube },
  tiktok: { label: "TikTok", icon: Music2 },
};

function formatCount(value: number | null): string {
  if (value == null) return "—";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  const user = await requireUser();
  const t = await getT();
  const locale = await getLocale();
  const params = await searchParams;

  const allowed = canUseIntegrations(user.plan);

  const accounts = await prisma.connectedAccount.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    include: {
      externalPosts: {
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        take: 5,
        include: {
          snapshots: { orderBy: { capturedAt: "desc" }, take: 1 },
        },
      },
    },
  });

  const errorKey =
    params.error === "plan"
      ? ("integrations.errorPlan" as const)
      : params.error === "unavailable"
        ? ("integrations.errorUnavailable" as const)
        : params.error
          ? ("integrations.errorConnectFailed" as const)
          : null;

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <div className="flex items-center gap-2">
          <Plug className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">{t("integrations.title")}</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("integrations.subtitle")}
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card/50 p-4 text-sm text-muted-foreground">
        {t("integrations.description")}
      </div>

      {params.connected && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/5 px-4 py-3 text-sm text-muted-foreground">
          {t("integrations.connectedBanner")}
        </div>
      )}
      {errorKey && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {t(errorKey)}
        </div>
      )}

      {!allowed && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm">
          <span className="text-muted-foreground">{t("integrations.planNeeded")}</span>
          <Button asChild size="sm">
            <Link href="/pricing">{t("integrations.upgradeCta")}</Link>
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {SOCIAL_PLATFORMS.map((platform) => {
          const meta = PLATFORM_META[platform];
          const Icon = meta.icon;
          const configured = isPlatformConfigured(platform);
          const platformAccounts = accounts.filter((a) => a.platform === platform);

          return (
            <div key={platform} className="rounded-xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">{meta.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {platform === "tiktok"
                        ? t("integrations.tiktokNote")
                        : platform === "instagram"
                          ? t("integrations.instagramNote")
                          : t("integrations.description")}
                    </p>
                  </div>
                </div>

                {!configured ? (
                  <Badge variant="secondary">{t("integrations.notConfigured")}</Badge>
                ) : platformAccounts.length === 0 ? (
                  allowed ? (
                    <Button asChild size="sm">
                      <a href={`/api/integrations/${platform}/connect`}>
                        {t("integrations.connect")}
                      </a>
                    </Button>
                  ) : (
                    <Badge variant="secondary">{t("integrations.planNeeded")}</Badge>
                  )
                ) : null}
              </div>

              {/* Connected accounts */}
              {platformAccounts.map((account) => (
                <div key={account.id} className="mt-4 rounded-lg border border-border bg-background/40 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">
                        {t("integrations.connectedAs", {
                          name: account.accountName ?? account.externalAccountId,
                        })}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {account.status === "error"
                          ? t("integrations.needsAttention")
                          : account.lastSyncedAt
                            ? t("integrations.lastSynced", {
                                time: account.lastSyncedAt.toLocaleString(
                                  dateLocale(locale),
                                  { dateStyle: "medium", timeStyle: "short" }
                                ),
                              })
                            : t("integrations.neverSynced")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <SyncAccountButton accountId={account.id} />
                      <DisconnectAccountButton accountId={account.id} />
                    </div>
                  </div>

                  {/* Recent post performance */}
                  {account.externalPosts.length > 0 && (
                    <div className="mt-4 overflow-x-auto">
                      <p className="mb-2 text-xs font-medium text-muted-foreground">
                        {t("integrations.recentPosts")}
                      </p>
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border text-muted-foreground">
                            <th className="py-1.5 pe-3 text-start font-medium">&nbsp;</th>
                            <th className="py-1.5 px-2 text-end font-medium">
                              {t("integrations.views")}
                            </th>
                            <th className="py-1.5 px-2 text-end font-medium">
                              {t("integrations.likes")}
                            </th>
                            <th className="py-1.5 px-2 text-end font-medium">
                              {t("integrations.comments")}
                            </th>
                            <th className="py-1.5 ps-2 text-end font-medium">
                              {t("integrations.shares")}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {account.externalPosts.map((post) => {
                            const snap = post.snapshots[0];
                            return (
                              <tr key={post.id} className="border-b border-border/50 last:border-0">
                                <td className="max-w-[220px] truncate py-2 pe-3">
                                  {post.externalUrl ? (
                                    <a
                                      href={post.externalUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 hover:text-foreground hover:underline"
                                    >
                                      <span className="truncate">
                                        {post.title || post.externalPostId}
                                      </span>
                                      <ExternalLink className="h-3 w-3 shrink-0" />
                                    </a>
                                  ) : (
                                    <span className="truncate">
                                      {post.title || post.externalPostId}
                                    </span>
                                  )}
                                </td>
                                <td className="py-2 px-2 text-end tabular-nums">
                                  {formatCount(snap?.views ?? null)}
                                </td>
                                <td className="py-2 px-2 text-end tabular-nums">
                                  {formatCount(snap?.likes ?? null)}
                                </td>
                                <td className="py-2 px-2 text-end tabular-nums">
                                  {formatCount(snap?.comments ?? null)}
                                </td>
                                <td className="py-2 ps-2 text-end tabular-nums">
                                  {formatCount(snap?.shares ?? null)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {account.externalPosts.length === 0 && account.lastSyncedAt && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      {t("integrations.noPosts")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
