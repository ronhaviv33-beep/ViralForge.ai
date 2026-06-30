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
import { requireUser } from "@/lib/auth";
import { getUserAnalytics } from "@/lib/analytics";
import { PLANS, type PlanId } from "@/lib/plans";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { GenerationCard } from "@/components/dashboard/generation-card";

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
