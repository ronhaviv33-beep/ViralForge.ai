import type { Metadata } from "next";
import Link from "next/link";
import {
  Calendar,
  Gauge,
  Clock,
  MessageSquare,
  Share2,
  History,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { requireUser } from "@/lib/auth";
import { getUserAnalytics } from "@/lib/analytics";
import { PLANS, type PlanId } from "@/lib/plans";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { GenerationCard } from "@/components/dashboard/generation-card";
import { toneLabel } from "@/lib/i18n";
import { getT } from "@/lib/i18n-server";

function buildActivityGrid(
  data: { date: string; count: number }[]
): { date: string; count: number }[] {
  const map = new Map(data.map((d) => [d.date, d.count]));
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const key = d.toISOString().slice(0, 10);
    return { date: key, count: map.get(key) ?? 0 };
  });
}

function activityColor(count: number) {
  if (count === 0) return "bg-secondary";
  if (count <= 2) return "bg-primary/30";
  if (count <= 5) return "bg-primary/60";
  return "bg-primary";
}

export const metadata: Metadata = {
  title: "Analytics — ViralForge",
};

export default async function AnalyticsPage() {
  const user = await requireUser();
  const plan = user.plan as PlanId;
  const t = await getT();
  const analytics = await getUserAnalytics(user.id, user.plan);

  const stats = [
    {
      label: t("dashboard.stats.generatedThisMonth"),
      value: String(analytics.generatedThisMonth),
      hint: analytics.unlimited
        ? t("dashboard.stats.unlimitedPlan")
        : t("dashboard.stats.ofLimitOnPlan", {
            limit: PLANS[plan].limit,
            plan: PLANS[plan].name,
          }),
      icon: Calendar,
      accent: "primary" as const,
    },
    {
      label: t("dashboard.stats.creditsRemaining"),
      value: analytics.unlimited
        ? t("usage.unlimited")
        : String(analytics.creditsRemaining),
      hint: analytics.unlimited
        ? t("common.planLabel", { plan: PLANS[plan].name })
        : t("dashboard.stats.resetsMonthStart"),
      icon: Gauge,
      accent: "accent" as const,
    },
    {
      label: t("dashboard.stats.hoursSaved"),
      value: t("dashboard.stats.hoursValue", {
        h: analytics.estimatedHoursSaved,
      }),
      hint: t("dashboard.stats.hoursSavedHint"),
      icon: Clock,
      accent: "accent" as const,
    },
    {
      label: t("analyticsPage.favoriteTone"),
      value: analytics.mostUsedTone
        ? toneLabel(t, analytics.mostUsedTone)
        : t("analyticsPage.noDataYet"),
      hint: analytics.mostUsedTone
        ? t("dashboard.stats.goToVoice")
        : t("analyticsPage.generateToSee"),
      icon: MessageSquare,
      accent: "primary" as const,
    },
    {
      label: t("analyticsPage.favoritePlatform"),
      value: analytics.mostUsedPlatform ?? t("analyticsPage.noDataYet"),
      hint: analytics.mostUsedPlatform
        ? t("dashboard.stats.whereYouCreate")
        : t("analyticsPage.generateToSee"),
      icon: Share2,
      accent: "primary" as const,
    },
    {
      label: t("dashboard.stats.totalPacks"),
      value: String(analytics.totalPacks),
      hint: t("dashboard.stats.allTime"),
      icon: History,
      accent: "primary" as const,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{t("analyticsPage.title")}</h1>
        <p className="mt-1 text-muted-foreground">{t("analyticsPage.subtitle")}</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            hint={stat.hint}
            icon={stat.icon}
            accent={stat.accent}
          />
        ))}
      </div>

      {/* Last 30 days activity */}
      {analytics.totalPacks > 0 && (() => {
        const grid = buildActivityGrid(analytics.last30Days);
        const total30d = grid.reduce((s, d) => s + d.count, 0);
        return (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {t("analyticsPage.last30Days")}
              </h2>
              <span className="text-sm text-muted-foreground">
                {total30d === 1
                  ? t("analyticsPage.generationsOne")
                  : t("analyticsPage.generationsMany", { count: total30d })}
              </span>
            </div>
            <div className="rounded-2xl border border-border bg-card/40 p-4">
              <div className="flex gap-1">
                {grid.map(({ date, count }) => (
                  <div
                    key={date}
                    title={`${date}: ${
                      count === 1
                        ? t("analyticsPage.generationsOne")
                        : t("analyticsPage.generationsMany", { count })
                    }`}
                    className={cn(
                      "h-6 flex-1 rounded-sm transition-colors",
                      activityColor(count)
                    )}
                  />
                ))}
              </div>
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>{t("analyticsPage.daysAgo30")}</span>
                <span>{t("analyticsPage.today")}</span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Platform & Tone breakdowns */}
      {analytics.totalPacks > 0 && (
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Platforms */}
          <div>
            <h2 className="mb-4 text-lg font-semibold">
              {t("analyticsPage.platforms")}
            </h2>
            <div className="rounded-2xl border border-border bg-card/40 p-4 space-y-3">
              {analytics.platformBreakdown.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("analyticsPage.noDataDot")}
                </p>
              ) : (
                analytics.platformBreakdown.map(({ platform, count }) => {
                  const pct = Math.round(
                    (count / analytics.platformBreakdown[0].count) * 100
                  );
                  return (
                    <div key={platform}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="font-medium">{platform}</span>
                        <span className="text-muted-foreground">{count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-secondary">
                        <div
                          className="h-2 rounded-full bg-primary transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Tones */}
          <div>
            <h2 className="mb-4 text-lg font-semibold">
              {t("analyticsPage.tones")}
            </h2>
            <div className="rounded-2xl border border-border bg-card/40 p-4 space-y-3">
              {analytics.toneBreakdown.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("analyticsPage.noDataDot")}
                </p>
              ) : (
                analytics.toneBreakdown.map(({ tone, count }) => {
                  const pct = Math.round(
                    (count / analytics.toneBreakdown[0].count) * 100
                  );
                  return (
                    <div key={tone}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="font-medium">{toneLabel(t, tone)}</span>
                        <span className="text-muted-foreground">{count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-secondary">
                        <div
                          className="h-2 rounded-full bg-accent transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent generations */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {t("dashboard.recentGenerations")}
          </h2>
          {analytics.totalPacks > 0 && (
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/history">{t("common.viewAll")}</Link>
            </Button>
          )}
        </div>

        {analytics.recentGenerations.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 px-6 py-16 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="font-semibold">{t("dashboard.emptyTitle")}</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {t("analyticsPage.emptyBody")}
            </p>
            <Button asChild className="mt-5">
              <Link href="/dashboard/generate">
                <Sparkles className="h-4 w-4" /> {t("dashboard.createFirstPack")}
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {analytics.recentGenerations.map((gen) => (
              <GenerationCard
                key={gen.id}
                id={gen.id}
                title={gen.title}
                tone={gen.tone}
                platforms={gen.platforms}
                createdAt={gen.createdAt.toISOString()}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
