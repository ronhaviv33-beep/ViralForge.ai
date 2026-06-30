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
  const analytics = await getUserAnalytics(user.id, user.plan);

  const stats = [
    {
      label: "Generated this month",
      value: String(analytics.generatedThisMonth),
      hint: analytics.unlimited
        ? "Unlimited plan"
        : `of ${PLANS[plan].limit} on ${PLANS[plan].name}`,
      icon: Calendar,
      accent: "primary" as const,
    },
    {
      label: "Credits remaining",
      value: analytics.unlimited ? "Unlimited" : String(analytics.creditsRemaining),
      hint: analytics.unlimited ? `${PLANS[plan].name} plan` : "Resets at month start",
      icon: Gauge,
      accent: "accent" as const,
    },
    {
      label: "Estimated hours saved",
      value: `${analytics.estimatedHoursSaved}h`,
      hint: "≈ 2 hours per content pack",
      icon: Clock,
      accent: "accent" as const,
    },
    {
      label: "Favorite tone",
      value: analytics.mostUsedTone ?? "No data yet",
      hint: analytics.mostUsedTone ? "Your go-to voice" : "Generate to see insights",
      icon: MessageSquare,
      accent: "primary" as const,
    },
    {
      label: "Favorite platform",
      value: analytics.mostUsedPlatform ?? "No data yet",
      hint: analytics.mostUsedPlatform ? "Where you create most" : "Generate to see insights",
      icon: Share2,
      accent: "primary" as const,
    },
    {
      label: "Total content packs",
      value: String(analytics.totalPacks),
      hint: "All time",
      icon: History,
      accent: "primary" as const,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="mt-1 text-muted-foreground">
          Your content creation stats at a glance.
        </p>
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
              <h2 className="text-lg font-semibold">Last 30 days</h2>
              <span className="text-sm text-muted-foreground">
                {total30d} generation{total30d !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="rounded-2xl border border-border bg-card/40 p-4">
              <div className="flex gap-1">
                {grid.map(({ date, count }) => (
                  <div
                    key={date}
                    title={`${date}: ${count} generation${count !== 1 ? "s" : ""}`}
                    className={cn(
                      "h-6 flex-1 rounded-sm transition-colors",
                      activityColor(count)
                    )}
                  />
                ))}
              </div>
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>30 days ago</span>
                <span>Today</span>
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
            <h2 className="mb-4 text-lg font-semibold">Platforms</h2>
            <div className="rounded-2xl border border-border bg-card/40 p-4 space-y-3">
              {analytics.platformBreakdown.length === 0 ? (
                <p className="text-sm text-muted-foreground">No data yet.</p>
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
            <h2 className="mb-4 text-lg font-semibold">Tones</h2>
            <div className="rounded-2xl border border-border bg-card/40 p-4 space-y-3">
              {analytics.toneBreakdown.length === 0 ? (
                <p className="text-sm text-muted-foreground">No data yet.</p>
              ) : (
                analytics.toneBreakdown.map(({ tone, count }) => {
                  const pct = Math.round(
                    (count / analytics.toneBreakdown[0].count) * 100
                  );
                  return (
                    <div key={tone}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="font-medium">{tone}</span>
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
          <h2 className="text-lg font-semibold">Recent generations</h2>
          {analytics.totalPacks > 0 && (
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/history">View all</Link>
            </Button>
          )}
        </div>

        {analytics.recentGenerations.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 px-6 py-16 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="font-semibold">No generations yet</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Your analytics will fill in as you create content packs. Start
              generating to see your stats.
            </p>
            <Button asChild className="mt-5">
              <Link href="/dashboard/generate">
                <Sparkles className="h-4 w-4" /> Create your first pack
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
