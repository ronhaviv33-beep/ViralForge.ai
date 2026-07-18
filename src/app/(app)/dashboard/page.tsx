import Link from "next/link";
import { Suspense } from "react";
import {
  Sparkles,
  History,
  Calendar,
  Gauge,
  Clock,
  MessageSquare,
  Share2,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDashboardAnalytics } from "@/lib/analytics";
import { PLANS, type PlanId } from "@/lib/plans";
import { Button } from "@/components/ui/button";
import { GenerationCard } from "@/components/dashboard/generation-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { CheckoutToast } from "@/components/dashboard/checkout-toast";
import { getT } from "@/lib/i18n-server";

export default async function DashboardPage() {
  const user = await requireUser();
  const plan = user.plan as PlanId;
  const t = await getT();

  const [recent, analytics] = await Promise.all([
    prisma.generation.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    getDashboardAnalytics(user.id, user.plan),
  ]);

  const total = analytics.totalPacks;
  const firstName = user.name?.split(" ")[0];

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
      value: `${analytics.estimatedHoursSaved}h`,
      hint: t("dashboard.stats.hoursSavedHint"),
      icon: Clock,
      accent: "accent" as const,
    },
    {
      label: t("dashboard.stats.mostUsedTone"),
      value: analytics.mostUsedTone ?? "—",
      hint: analytics.mostUsedTone
        ? t("dashboard.stats.goToVoice")
        : t("dashboard.stats.noData"),
      icon: MessageSquare,
      accent: "primary" as const,
    },
    {
      label: t("dashboard.stats.mostUsedPlatform"),
      value: analytics.mostUsedPlatform ?? "—",
      hint: analytics.mostUsedPlatform
        ? t("dashboard.stats.whereYouCreate")
        : t("dashboard.stats.noData"),
      icon: Share2,
      accent: "primary" as const,
    },
    {
      label: t("dashboard.stats.totalPacks"),
      value: String(total),
      hint: t("dashboard.stats.allTime"),
      icon: History,
      accent: "primary" as const,
    },
  ];

  return (
    <div className="space-y-8">
      <Suspense>
        <CheckoutToast />
      </Suspense>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">
            {firstName
              ? t("dashboard.welcomeName", { name: firstName })
              : t("dashboard.welcome")}
          </h1>
          <p className="mt-1 text-muted-foreground">{t("dashboard.subtitle")}</p>
        </div>
        <Button asChild size="lg" className="glow-primary">
          <Link href="/dashboard/generate">
            <Sparkles className="h-4 w-4" /> {t("dashboard.newGeneration")}
          </Link>
        </Button>
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

      {/* Recent */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {t("dashboard.recentGenerations")}
          </h2>
          {total > 0 && (
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/history">{t("common.viewAll")}</Link>
            </Button>
          )}
        </div>

        {recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 px-6 py-16 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="font-semibold">{t("dashboard.emptyTitle")}</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {t("dashboard.emptyBody")}
            </p>
            <Button asChild className="mt-5">
              <Link href="/dashboard/generate">
                <Sparkles className="h-4 w-4" /> {t("dashboard.createFirstPack")}
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map((gen) => (
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
