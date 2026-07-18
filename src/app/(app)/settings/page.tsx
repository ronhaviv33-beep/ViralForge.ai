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

/** Human-readable subscription status + display color. */
function statusInfo(
  status: string | undefined,
  cancelAtPeriodEnd: boolean
): { label: string; className: string } | null {
  if (!status) return null;
  if ((status === "active" || status === "trialing") && cancelAtPeriodEnd) {
    return {
      label: "Cancels at period end",
      className: "bg-amber-500/10 text-amber-500",
    };
  }
  switch (status) {
    case "active":
      return { label: "Active", className: "bg-accent/10 text-accent" };
    case "trialing":
      return { label: "Trial", className: "bg-primary/10 text-primary" };
    case "past_due":
      return { label: "Past due", className: "bg-destructive/10 text-destructive" };
    case "unpaid":
      return { label: "Unpaid", className: "bg-destructive/10 text-destructive" };
    case "canceled":
      return { label: "Canceled", className: "bg-secondary text-muted-foreground" };
    default:
      return { label: status, className: "bg-secondary text-muted-foreground" };
  }
}

export default async function SettingsPage() {
  const user = await requireUser();
  const plan = user.plan as PlanId;
  const usage = await getUsageStatus(user.id, user.plan);

  const subscription = await prisma.subscription.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const stripeReady = isStripeConfigured();
  const status =
    plan !== "free" || subscription
      ? statusInfo(subscription?.status, subscription?.cancelAtPeriodEnd ?? false)
      : null;

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
          {status && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}
              >
                {status.label}
              </span>
            </div>
          )}
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
              <span className="text-muted-foreground">
                {subscription.cancelAtPeriodEnd ? "Access until" : "Renews"}
              </span>
              <span className="font-medium">
                {subscription.currentPeriodEnd.toLocaleDateString(undefined, {
                  dateStyle: "medium",
                })}
              </span>
            </div>
          )}
          {subscription?.cancelAtPeriodEnd && (
            <p className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-500">
              Your subscription is set to cancel. You keep full access until the
              date above, then you&apos;ll move to the Free plan. You can resume it
              anytime from the billing portal.
            </p>
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
