import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUsageStatus } from "@/lib/usage";
import { getAgentUsageStatus } from "@/lib/agent-limits";
import { isStripeConfigured } from "@/lib/stripe";
import { PLANS, type PlanId } from "@/lib/plans";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BillingButton } from "@/components/dashboard/billing-button";
import { dateLocale, type Translator } from "@/lib/i18n";
import { getLocale, getT } from "@/lib/i18n-server";

export const metadata: Metadata = {
  title: "Settings — ViralForge",
};

/** Human-readable subscription status + display color. */
function statusInfo(
  t: Translator,
  status: string | undefined,
  cancelAtPeriodEnd: boolean
): { label: string; className: string } | null {
  if (!status) return null;
  if ((status === "active" || status === "trialing") && cancelAtPeriodEnd) {
    return {
      label: t("settingsPage.statusCancelsAtPeriodEnd"),
      className: "bg-amber-500/10 text-amber-500",
    };
  }
  switch (status) {
    case "active":
      return { label: t("settingsPage.statusActive"), className: "bg-accent/10 text-accent" };
    case "trialing":
      return { label: t("settingsPage.statusTrial"), className: "bg-primary/10 text-primary" };
    case "past_due":
      return { label: t("settingsPage.statusPastDue"), className: "bg-destructive/10 text-destructive" };
    case "unpaid":
      return { label: t("settingsPage.statusUnpaid"), className: "bg-destructive/10 text-destructive" };
    case "canceled":
      return { label: t("settingsPage.statusCanceled"), className: "bg-secondary text-muted-foreground" };
    default:
      return { label: status, className: "bg-secondary text-muted-foreground" };
  }
}

export default async function SettingsPage() {
  const user = await requireUser();
  const plan = user.plan as PlanId;
  const locale = await getLocale();
  const t = await getT();
  const [usage, agentUsage] = await Promise.all([
    getUsageStatus(user.id, user.plan),
    getAgentUsageStatus(user.id, user.plan),
  ]);

  const subscription = await prisma.subscription.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const stripeReady = isStripeConfigured();
  const status =
    plan !== "free" || subscription
      ? statusInfo(t, subscription?.status, subscription?.cancelAtPeriodEnd ?? false)
      : null;

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{t("settingsPage.title")}</h1>
        <p className="mt-1 text-muted-foreground">{t("settingsPage.subtitle")}</p>
      </div>

      {/* Account */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-semibold">{t("settingsPage.account")}</h2>
        <dl className="mt-4 divide-y divide-border text-sm">
          <div className="flex items-center justify-between py-3">
            <dt className="text-muted-foreground">{t("settingsPage.name")}</dt>
            <dd className="font-medium">{user.name || "—"}</dd>
          </div>
          <div className="flex items-center justify-between py-3">
            <dt className="text-muted-foreground">{t("settingsPage.email")}</dt>
            <dd className="font-medium">{user.email}</dd>
          </div>
          <div className="flex items-center justify-between py-3">
            <dt className="text-muted-foreground">
              {t("settingsPage.memberSince")}
            </dt>
            <dd className="font-medium">
              {user.createdAt.toLocaleDateString(dateLocale(locale), {
                dateStyle: "medium",
              })}
            </dd>
          </div>
        </dl>
      </section>

      {/* Subscription */}
      <section className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">{t("settingsPage.subscription")}</h2>
          <Badge variant={plan === "free" ? "secondary" : "default"}>
            {PLANS[plan].name}
          </Badge>
        </div>

        <div className="mt-4 space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t("settingsPage.plan")}</span>
            <span className="font-medium">
              {t("settingsPage.planPriceLine", {
                plan: PLANS[plan].name,
                price: PLANS[plan].price,
              })}
            </span>
          </div>
          {status && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {t("settingsPage.status")}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}
              >
                {status.label}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              {t("settingsPage.usageThisMonth")}
            </span>
            <span className="font-medium">
              {usage.unlimited
                ? t("settingsPage.usageUnlimited", { used: usage.used })
                : `${usage.used} / ${usage.limit}`}
            </span>
          </div>
          {agentUsage.enabled && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {t("settingsPage.agentThisMonth")}
              </span>
              <span className="font-medium">
                {agentUsage.used} / {agentUsage.limit}
              </span>
            </div>
          )}
          {subscription?.currentPeriodEnd && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {subscription.cancelAtPeriodEnd
                  ? t("settingsPage.accessUntil")
                  : t("settingsPage.renews")}
              </span>
              <span className="font-medium">
                {subscription.currentPeriodEnd.toLocaleDateString(
                  dateLocale(locale),
                  { dateStyle: "medium" }
                )}
              </span>
            </div>
          )}
          {subscription?.cancelAtPeriodEnd && (
            <p className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-500">
              {t("settingsPage.cancelNotice")}
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {plan === "free" ? (
            <Button asChild>
              <Link href="/pricing">{t("settingsPage.upgradePlan")}</Link>
            </Button>
          ) : stripeReady && user.stripeCustomerId ? (
            <BillingButton
              action="portal"
              label={t("settingsPage.manageBilling")}
              variant="outline"
            />
          ) : (
            <Button asChild variant="outline">
              <Link href="/pricing">{t("settingsPage.viewPlans")}</Link>
            </Button>
          )}
        </div>

        {!stripeReady && (
          <p className="mt-4 text-xs text-muted-foreground">
            {t("settingsPage.billingNotConfigured")}
          </p>
        )}
      </section>
    </div>
  );
}
