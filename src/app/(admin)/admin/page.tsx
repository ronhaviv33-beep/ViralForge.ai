import { requireAdminUser } from "@/lib/auth";
import { getAdminOverview } from "@/lib/admin";
import { PLANS, type PlanId } from "@/lib/plans";
import { StatCard } from "@/components/dashboard/stat-card";
import { Users, Zap, CreditCard, TrendingUp, Calendar, Clock } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminOverviewPage() {
  try {
    await requireAdminUser();
  } catch {
    redirect("/dashboard");
  }

  const data = await getAdminOverview();

  const now = new Date();
  const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const stats = [
    {
      label: "Total users",
      value: String(data.totalUsers),
      hint: `${data.freeUsers} free · ${data.paidUsers} paid`,
      icon: Users,
      accent: "primary" as const,
    },
    {
      label: "New users this month",
      value: String(data.newUsersThisMonth),
      hint: "Calendar month",
      icon: Calendar,
      accent: "accent" as const,
    },
    {
      label: "Active subscriptions",
      value: String(data.activeSubscriptions),
      hint: `${Math.round((data.activeSubscriptions / Math.max(data.totalUsers, 1)) * 100)}% of users`,
      icon: CreditCard,
      accent: "primary" as const,
    },
    {
      label: "Estimated MRR",
      value: `$${data.estimatedMrr.toLocaleString()}`,
      hint: "Based on plan prices",
      icon: TrendingUp,
      accent: "accent" as const,
    },
    {
      label: "Total generations",
      value: String(data.totalGenerations),
      hint: "All time",
      icon: Zap,
      accent: "primary" as const,
    },
    {
      label: "Generations this month",
      value: String(data.generationsThisMonth),
      hint: monthStr,
      icon: Clock,
      accent: "accent" as const,
    },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold">Platform Overview</h1>
        <p className="mt-1 text-muted-foreground">
          Real-time metrics across all accounts.
        </p>
      </div>

      {/* Stats grid */}
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

      {/* Users by plan */}
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
              {data.planBreakdown.map((row) => (
                <tr key={row.plan} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium capitalize">{row.plan}</td>
                  <td className="px-4 py-3 text-right">{row.count}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {data.totalUsers > 0
                      ? Math.round((row.count / data.totalUsers) * 100)
                      : 0}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent users */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent signups</h2>
          <Link
            href="/admin/users"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            View all →
          </Link>
        </div>
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-card/60">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">User</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Plan</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Joined</th>
              </tr>
            </thead>
            <tbody>
              {data.recentUsers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-muted-foreground">
                    No users yet.
                  </td>
                </tr>
              ) : (
                data.recentUsers.map((u) => (
                  <tr key={u.id} className="border-b border-border last:border-0 hover:bg-card/60">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/users/${u.id}`}
                        className="font-medium hover:underline"
                      >
                        {u.name ?? u.email}
                      </Link>
                      {u.name && (
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary capitalize">
                        {PLANS[u.plan as PlanId].name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {u.createdAt.toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent generations */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Recent generations</h2>
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-card/60">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tone</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">User</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.recentGenerations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                    No generations yet.
                  </td>
                </tr>
              ) : (
                data.recentGenerations.map((g) => (
                  <tr key={g.id} className="border-b border-border last:border-0 hover:bg-card/60">
                    <td className="px-4 py-3 font-medium">{g.title}</td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">{g.tone}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{g.user.email}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {g.createdAt.toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
