import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getUsageStatus } from "@/lib/usage";
import { Logo } from "@/components/logo";
import { DashboardNav } from "@/components/dashboard/nav";
import { LogoutButton } from "@/components/dashboard/logout-button";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { UsageMeter } from "@/components/dashboard/usage-meter";
import { LanguageSwitcher } from "@/components/language-switcher";
import { PLANS, type PlanId } from "@/lib/plans";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const plan = user.plan as PlanId;
  const usage = await getUsageStatus(user.id, user.plan);

  const isAdmin = user.role === "ADMIN";

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <MobileNav planLabel={PLANS[plan].name} isAdmin={isAdmin} />

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card/40 p-4 md:flex rtl:border-l rtl:border-r-0">
        <div className="px-2 py-2">
          <Logo href="/dashboard" />
        </div>
        <div className="mt-6 flex-1">
          <DashboardNav isAdmin={isAdmin} />
        </div>
        <div className="space-y-3">
          <LanguageSwitcher className="w-fit" />
          <UsageMeter plan={plan} usage={usage} />
          <div className="border-t border-border pt-2">
            <div className="truncate px-3 pb-1 text-xs text-muted-foreground">
              {user.email}
            </div>
            <LogoutButton />
          </div>
        </div>
      </aside>

      <main className="flex-1">
        <div className="container max-w-6xl py-8">{children}</div>
      </main>
    </div>
  );
}
