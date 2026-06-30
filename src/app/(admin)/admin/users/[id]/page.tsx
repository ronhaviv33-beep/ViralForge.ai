import { requireAdminUser } from "@/lib/auth";
import { getAdminUserById } from "@/lib/admin";
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
  let adminUser;
  try {
    adminUser = await requireAdminUser();
  } catch {
    redirect("/dashboard");
  }

  const { id } = await params;
  const user = await getAdminUserById(id);
  if (!user) notFound();

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
        <div className="space-y-4 rounded-xl border border-border bg-card p-5">
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
              <dd>{user.generationsCount}</dd>
            </div>
            {user.currentMonthUsage !== null && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Used this month</dt>
                <dd>{user.currentMonthUsage}</dd>
              </div>
            )}
            {user.stripeCustomerId && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Stripe customer</dt>
                <dd className="font-mono text-xs">{user.stripeCustomerId}</dd>
              </div>
            )}
            {user.subscription && (
              <>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subscription</dt>
                  <dd className="font-mono text-xs">
                    {user.subscription.stripeSubscriptionId}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Sub status</dt>
                  <dd className="capitalize">{user.subscription.status}</dd>
                </div>
                {user.subscription.currentPeriodEnd && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Period ends</dt>
                    <dd>{user.subscription.currentPeriodEnd.toLocaleDateString()}</dd>
                  </div>
                )}
              </>
            )}
          </dl>
        </div>

        {/* Admin actions */}
        <div className="space-y-5 rounded-xl border border-border bg-card p-5">
          <h2 className="font-semibold">Admin Actions</h2>

          <div className="space-y-2">
            <label className="text-sm font-medium">Plan</label>
            <AdminPlanSelect userId={user.id} currentPlan={user.plan as PlanId} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Role</label>
            <AdminRoleToggle
              userId={user.id}
              currentRole={user.role}
              isSelf={adminUser.id === user.id}
            />
          </div>
        </div>
      </div>

      {/* Recent generations */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Recent generations</h2>
        {user.recentGenerations.length === 0 ? (
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
                {user.recentGenerations.map((g) => (
                  <tr key={g.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium">{g.title}</td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">{g.tone}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {g.platforms.join(", ")}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
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
