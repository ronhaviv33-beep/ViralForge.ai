import Link from "next/link";
import { Sparkles, History, Zap, Calendar } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUsageStatus } from "@/lib/usage";
import { PLANS, type PlanId } from "@/lib/plans";
import { Button } from "@/components/ui/button";
import { GenerationCard } from "@/components/dashboard/generation-card";

export default async function DashboardPage() {
  const user = await requireUser();
  const plan = user.plan as PlanId;
  const usage = await getUsageStatus(user.id, user.plan);

  const [recent, total] = await Promise.all([
    prisma.generation.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.generation.count({ where: { userId: user.id } }),
  ]);

  const firstName = user.name?.split(" ")[0];

  const stats = [
    {
      label: "This month",
      value: usage.unlimited ? `${usage.used}` : `${usage.used}/${usage.limit}`,
      icon: Calendar,
    },
    {
      label: "Total packs",
      value: String(total),
      icon: History,
    },
    {
      label: "Current plan",
      value: PLANS[plan].name,
      icon: Zap,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back{firstName ? `, ${firstName}` : ""} 👋
          </h1>
          <p className="mt-1 text-muted-foreground">
            Turn your next idea into a full content pack.
          </p>
        </div>
        <Button asChild size="lg" className="glow-primary">
          <Link href="/dashboard/generate">
            <Sparkles className="h-4 w-4" /> New generation
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <stat.icon className="h-4 w-4" />
              {stat.label}
            </div>
            <p className="mt-2 text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent generations</h2>
          {total > 0 && (
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/history">View all</Link>
            </Button>
          )}
        </div>

        {recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 px-6 py-16 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="font-semibold">No generations yet</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Paste an idea or transcript and ViralForge will create hooks,
              captions, threads, hashtags and more.
            </p>
            <Button asChild className="mt-5">
              <Link href="/dashboard/generate">
                <Sparkles className="h-4 w-4" /> Create your first pack
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
