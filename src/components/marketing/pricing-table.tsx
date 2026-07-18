"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PLAN_LIST, type PlanId } from "@/lib/plans";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MessageKey } from "@/lib/i18n";
import { useI18n } from "@/components/i18n-provider";

interface PricingTableProps {
  /** When true, buttons trigger Stripe checkout. When false, they route to signup. */
  authed: boolean;
  currentPlan?: PlanId;
}

/** Translated copy per plan. Plan names and prices come from lib/plans. */
const PLAN_COPY: Record<
  PlanId,
  { description: MessageKey; cta: MessageKey; features: MessageKey[] }
> = {
  free: {
    description: "plans.free.description",
    cta: "plans.free.cta",
    features: ["plans.free.f1", "plans.free.f2", "plans.free.f3", "plans.free.f4"],
  },
  creator: {
    description: "plans.creator.description",
    cta: "plans.creator.cta",
    features: [
      "plans.creator.f1",
      "plans.creator.f2",
      "plans.creator.f3",
      "plans.creator.f4",
      "plans.creator.f5",
    ],
  },
  pro: {
    description: "plans.pro.description",
    cta: "plans.pro.cta",
    features: [
      "plans.pro.f1",
      "plans.pro.f2",
      "plans.pro.f3",
      "plans.pro.f4",
      "plans.pro.f5",
    ],
  },
  agency: {
    description: "plans.agency.description",
    cta: "plans.agency.cta",
    features: [
      "plans.agency.f1",
      "plans.agency.f2",
      "plans.agency.f3",
      "plans.agency.f4",
    ],
  },
};

export function PricingTable({ authed, currentPlan }: PricingTableProps) {
  const router = useRouter();
  const { t } = useI18n();
  const [loadingPlan, setLoadingPlan] = React.useState<PlanId | null>(null);

  const onPaidPlan = Boolean(currentPlan && currentPlan !== "free");

  async function handleSelect(plan: PlanId) {
    if (!authed) {
      router.push(`/signup?plan=${plan}`);
      return;
    }
    if (plan === "free") {
      if (onPaidPlan) {
        // Downgrading to Free means canceling the paid subscription — that
        // happens in the billing portal, not through checkout.
        setLoadingPlan(plan);
        try {
          const res = await fetch("/api/stripe/portal", { method: "POST" });
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || t("plans.portalError"));
          }
          toast.info(t("plans.portalCancelInfo"));
          window.location.href = data.url;
        } catch (err) {
          toast.error(
            err instanceof Error ? err.message : t("errors.somethingWentWrong")
          );
          setLoadingPlan(null);
        }
        return;
      }
      router.push("/dashboard");
      return;
    }
    setLoadingPlan(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || t("plans.checkoutError"));
      }
      if (data.portal) {
        toast.info(data.message ?? t("plans.portalOpenInfo"));
      }
      window.location.href = data.url;
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("errors.somethingWentWrong")
      );
      setLoadingPlan(null);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-4 md:grid-cols-2">
      {PLAN_LIST.map((plan) => {
        const isCurrent = currentPlan === plan.id;
        const copy = PLAN_COPY[plan.id];
        return (
          <div
            key={plan.id}
            className={cn(
              "relative flex flex-col rounded-2xl border bg-card p-6",
              plan.highlighted
                ? "border-primary/60 shadow-lg shadow-primary/10"
                : "border-border"
            )}
          >
            {plan.highlighted && (
              <Badge className="absolute -top-3 left-6 rtl:left-auto rtl:right-6">
                {t("plans.mostPopular")}
              </Badge>
            )}
            <div className="mb-4">
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {t(copy.description)}
              </p>
            </div>
            <div className="mb-6 flex items-baseline gap-1">
              <span className="text-4xl font-bold">${plan.price}</span>
              <span className="text-sm text-muted-foreground">
                {t("plans.perMonth")}
              </span>
            </div>
            <ul className="mb-6 flex-1 space-y-3 text-sm">
              {copy.features.map((featureKey) => (
                <li key={featureKey} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span className="text-muted-foreground">{t(featureKey)}</span>
                </li>
              ))}
            </ul>
            <Button
              onClick={() => handleSelect(plan.id)}
              disabled={isCurrent || loadingPlan !== null}
              variant={plan.highlighted ? "default" : "outline"}
              className="w-full"
            >
              {loadingPlan === plan.id && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {isCurrent
                ? t("plans.currentPlan")
                : plan.id === "free" && authed && onPaidPlan
                  ? t("plans.downgrade")
                  : t(copy.cta)}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
