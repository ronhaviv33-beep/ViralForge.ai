import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUsageStatus } from "@/lib/usage";
import { isStripeConfigured } from "@/lib/stripe";
import { PLANS, type PlanId } from "@/lib/plans";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BillingButton } from "@/components/dashboard/billing-button";

export const metadata: Metadata = {
  title: "Settings — ViralForge",
};

export default async function SettingsPage() {
  const user = await requireUser();
  const plan = user.plan as PlanId;
  const usage = await getUsageStatus(user.id, user.plan);

  const subscription = await prisma.subscription.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const stripeReady = isStripeConfigured();

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your account and subscription.
        </p>
      </div>

      {/* Account */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-semibold">Account</h2>
        <dl className="mt-4 divide-y divide-border text-sm">
          <div className="flex items-center justify-between py-3">
            <dt className="text-muted-foreground">Name</dt>
            <dd className="font-medium">{user.name || "—"}</dd>
          </div>
          <div className="flex items-center justify-between py-3">
            <dt className="text-muted-foreground">Email</dt>
            <dd className="font-medium">{user.email}</dd>
          </div>
          <div className="flex items-center justify-between py-3">
            <dt className="text-muted-foreground">Member since</dt>
            <dd className="font-medium">
              {user.createdAt.toLocaleDateString(undefined, {
                dateStyle: "medium",
              })}
            </dd>
          </div>
        </dl>
      </section>

      {/* Subscription */}
      <section className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Subscription</h2>
          <Badge variant={plan === "free" ? "secondary" : "default"}>
            {PLANS[plan].name}
          </Badge>
        </div>

        <div className="mt-4 space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Plan</span>
            <span className="font-medium">
              {PLANS[plan].name} · ${PLANS[plan].price}/mo
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Usage this month</span>
            <span className="font-medium">
              {usage.unlimited
                ? `${usage.used} (unlimited)`
                : `${usage.used} / ${usage.limit}`}
            </span>
          </div>
          {subscription?.currentPeriodEnd && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Renews</span>
              <span className="font-medium">
                {subscription.currentPeriodEnd.toLocaleDateString(undefined, {
                  dateStyle: "medium",
                })}
              </span>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {plan === "free" ? (
            <Button asChild>
              <Link href="/pricing">Upgrade plan</Link>
            </Button>
          ) : stripeReady && user.stripeCustomerId ? (
            <BillingButton
              action="portal"
              label="Manage billing"
              variant="outline"
            />
          ) : (
            <Button asChild variant="outline">
              <Link href="/pricing">View plans</Link>
            </Button>
          )}
        </div>

        {!stripeReady && (
          <p className="mt-4 text-xs text-muted-foreground">
            Billing is not configured in this environment. Set your Stripe
            environment variables to enable subscriptions.
          </p>
        )}
      </section>
    </div>
  );
}
