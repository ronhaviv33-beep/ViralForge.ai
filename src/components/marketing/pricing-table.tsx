"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PLAN_LIST, type PlanId } from "@/lib/plans";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PricingTableProps {
  /** When true, buttons trigger Stripe checkout. When false, they route to signup. */
  authed: boolean;
  currentPlan?: PlanId;
}

export function PricingTable({ authed, currentPlan }: PricingTableProps) {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = React.useState<PlanId | null>(null);

  async function handleSelect(plan: PlanId) {
    if (!authed) {
      router.push(`/signup?plan=${plan}`);
      return;
    }
    if (plan === "free") {
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
        throw new Error(data.error || "Could not start checkout.");
      }
      window.location.href = data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
      setLoadingPlan(null);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-4 md:grid-cols-2">
      {PLAN_LIST.map((plan) => {
        const isCurrent = currentPlan === plan.id;
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
              <Badge className="absolute -top-3 left-6">Most popular</Badge>
            )}
            <div className="mb-4">
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {plan.description}
              </p>
            </div>
            <div className="mb-6 flex items-baseline gap-1">
              <span className="text-4xl font-bold">${plan.price}</span>
              <span className="text-sm text-muted-foreground">/month</span>
            </div>
            <ul className="mb-6 flex-1 space-y-3 text-sm">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span className="text-muted-foreground">{feature}</span>
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
              {isCurrent ? "Current plan" : plan.cta}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
