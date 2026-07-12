import { requireAdminUser } from "@/lib/auth";
import { getAdminUsersPage } from "@/lib/admin";
import { PLANS, type PlanId } from "@/lib/plans";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { CreateUserDialog } from "@/components/admin/create-user-dialog";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; plan?: string }>;
}) {
  try {
    await requireAdminUser();
  } catch {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const planFilter = params.plan ?? "";

  const users = await getAdminUsersPage({ query, plan: planFilter });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="mt-1 text-muted-foreground">
            {users.length} user{users.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <CreateUserDialog />
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-3">
        <input
          name="q"
          defaultValue={query}
          placeholder="Search email or name…"
          className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          name="plan"
          defaultValue={planFilter}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All plans</option>
          {(["free", "creator", "pro", "agency"] as PlanId[]).map((p) => (
            <option key={p} value={p}>
              {PLANS[p].name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Filter
        </button>
        {(query || planFilter) && (
          <Link
            href="/admin/users"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary"
          >
            Clear
          </Link>
        )}
      </form>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-card/60">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">User</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Plan</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Sub status</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Gens</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Joined</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-border last:border-0 hover:bg-card/60"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium">{u.name ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary capitalize">
                      {PLANS[u.plan as PlanId].name}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u.subscriptionStatus ? (
                      <span
                        className={
                          u.subscriptionStatus === "active"
                            ? "rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent"
                            : "rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground capitalize"
                        }
                      >
                        {u.subscriptionStatus}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {u.role === "ADMIN" ? (
                      <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                        Admin
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">User</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">{u.generationsCount}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {u.createdAt.toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/users/${u.id}`}
                      className="flex items-center justify-end text-muted-foreground hover:text-foreground"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
