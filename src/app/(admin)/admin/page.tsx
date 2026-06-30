import { requireAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLANS, type PlanId } from "@/lib/plans";
import { StatCard } from "@/components/dashboard/stat-card";
import { Users, Zap, CreditCard, TrendingUp, Calendar, Clock } from "lucide-react";
import { redirect } from "next/navigation";

export default async function AdminOverviewPage() {
  try {
    await requireAdminUser();
  } catch {
    redirect("/dashboard");
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [
    totalUsers,
    newUsersThisMonth,
    usersByPlan,
    totalGenerations,
    generationsThisMonth,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.user.groupBy({ by: ["plan"], _count: { plan: true } }),
    prisma.generation.count(),
    prisma.usage.aggregate({
      _sum: { generationCount: true },
      where: { month: monthStr },
    }),
  ]);

  const planCounts = Object.fromEntries(
    usersByPlan.map((g) => [g.plan, g._count.plan])
  ) as Record<string, number>;

  const paidUsers = (planCounts["creator"] ?? 0) + (planCounts["pro"] ?? 0) + (planCounts["agency"] ?? 0);
  const freeUsers = planCounts["free"] ?? 0;

  // Rough MRR estimate from paid plan counts
  const mrrEstimate =
    (planCounts["creator"] ?? 0) * 19 +
    (planCounts["pro"] ?? 0) * 39 +
    (planCounts["agency"] ?? 0) * 99;

  const stats = [
    {
      label: "Total users",
      value: String(totalUsers),
      hint: `${freeUsers} free · ${paidUsers} paid`,
      icon: Users,
      accent: "primary" as const,
    },
    {
      label: "New users this month",
      value: String(newUsersThisMonth),
      hint: "Calendar month",
      icon: Calendar,
      accent: "accent" as const,
    },
    {
      label: "Paid users",
      value: String(paidUsers),
      hint: `${Math.round((paidUsers / Math.max(totalUsers, 1)) * 100)}% conversion`,
      icon: CreditCard,
      accent: "primary" as const,
    },
    {
      label: "MRR estimate",
      value: `$${mrrEstimate.toLocaleString()}`,
      hint: "Based on plan prices",
      icon: TrendingUp,
      accent: "accent" as const,
    },
    {
      label: "Total generations",
      value: String(totalGenerations),
      hint: "All time",
      icon: Zap,
      accent: "primary" as const,
    },
    {
      label: "Generations this month",
      value: String(generationsThisMonth._sum.generationCount ?? 0),
      hint: monthStr,
      icon: Clock,
      accent: "accent" as const,
    },
  ];

  const planBreakdown = (["free", "creator", "pro", "agency"] as PlanId[]).map(
    (p) => ({ plan: PLANS[p].name, count: planCounts[p] ?? 0 })
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Platform Overview</h1>
        <p className="mt-1 text-muted-foreground">
          Real-time metrics across all accounts.
        </p>
      </div>

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

      <div>
        <h2 className="mb-4 text-lg font-semibold">Users by plan</h2>
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-card/60">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Plan</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Users</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Share</th>
              </tr>
            </thead>
            <tbody>
              {planBreakdown.map((row) => (
                <tr key={row.plan} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium capitalize">{row.plan}</td>
                  <td className="px-4 py-3 text-right">{row.count}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {totalUsers > 0 ? Math.round((row.count / totalUsers) * 100) : 0}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
