import { requireAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLANS, type PlanId } from "@/lib/plans";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminPlanSelect } from "@/components/admin/plan-select";
import { AdminRoleToggle } from "@/components/admin/role-toggle";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    await requireAdminUser();
  } catch {
    redirect("/dashboard");
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      _count: { select: { generations: true } },
      subscriptions: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  if (!user) notFound();

  const recentGens = await prisma.generation.findMany({
    where: { userId: id },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { id: true, title: true, tone: true, platforms: true, createdAt: true },
  });

  const sub = user.subscriptions[0];

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/users"
          className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Users
        </Link>
        <h1 className="text-2xl font-bold">{user.name ?? user.email}</h1>
        <p className="mt-1 text-muted-foreground">{user.email}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Account info */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="font-semibold">Account</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">ID</dt>
              <dd className="font-mono text-xs">{user.id}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Joined</dt>
              <dd>{user.createdAt.toLocaleDateString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Total generations</dt>
              <dd>{user._count.generations}</dd>
            </div>
            {sub && (
              <>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Stripe sub</dt>
                  <dd className="font-mono text-xs">{sub.stripeSubscriptionId}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Sub status</dt>
                  <dd className="capitalize">{sub.status}</dd>
                </div>
                {sub.currentPeriodEnd && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Period ends</dt>
                    <dd>{sub.currentPeriodEnd.toLocaleDateString()}</dd>
                  </div>
                )}
              </>
            )}
          </dl>
        </div>

        {/* Admin actions */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-5">
          <h2 className="font-semibold">Admin Actions</h2>

          <div className="space-y-2">
            <label className="text-sm font-medium">Plan</label>
            <AdminPlanSelect userId={user.id} currentPlan={user.plan as PlanId} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Role</label>
            <AdminRoleToggle userId={user.id} currentRole={user.role} />
          </div>
        </div>
      </div>

      {/* Recent generations */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Recent generations</h2>
        {recentGens.length === 0 ? (
          <p className="text-sm text-muted-foreground">No generations yet.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-card/60">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tone</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Platforms</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentGens.map((g) => (
                  <tr key={g.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium">{g.title}</td>
                    <td className="px-4 py-3 text-muted-foreground capitalize">{g.tone}</td>
                    <td className="px-4 py-3 text-muted-foreground">{g.platforms.join(", ")}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {g.createdAt.toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
