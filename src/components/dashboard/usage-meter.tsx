import Link from "next/link";
import { Infinity as InfinityIcon } from "lucide-react";
import { PLANS, type PlanId } from "@/lib/plans";
import type { UsageStatus } from "@/lib/usage";

export function UsageMeter({
  plan,
  usage,
}: {
  plan: PlanId;
  usage: UsageStatus;
}) {
  const planName = PLANS[plan].name;
  const pct = usage.unlimited
    ? 0
    : Math.min(100, Math.round((usage.used / Math.max(1, usage.limit)) * 100));

  return (
    <div className="rounded-xl border border-border bg-background/40 p-4">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium">{planName} plan</span>
        {usage.unlimited ? (
          <span className="flex items-center gap-1 text-accent">
            <InfinityIcon className="h-4 w-4" /> Unlimited
          </span>
        ) : (
          <span className="text-muted-foreground">
            {usage.used}/{usage.limit}
          </span>
        )}
      </div>
      {!usage.unlimited && (
        <div className="h-2 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
      <p className="mt-2 text-xs text-muted-foreground">
        {usage.unlimited
          ? "Generate as much as you want this month."
          : `${usage.remaining} generation${
              usage.remaining === 1 ? "" : "s"
            } left this month.`}
      </p>
      {!usage.unlimited && plan !== "agency" && (
        <Link
          href="/pricing"
          className="mt-3 inline-block text-xs font-medium text-primary hover:underline"
        >
          Upgrade plan →
        </Link>
      )}
    </div>
  );
}
