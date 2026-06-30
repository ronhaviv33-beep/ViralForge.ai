"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PLANS, type PlanId } from "@/lib/plans";

const PLAN_IDS: PlanId[] = ["free", "creator", "pro", "agency"];

export function AdminPlanSelect({
  userId,
  currentPlan,
}: {
  userId: string;
  currentPlan: PlanId;
}) {
  const router = useRouter();
  const [plan, setPlan] = useState<PlanId>(currentPlan);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleChange(newPlan: PlanId) {
    if (newPlan === plan) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${userId}/plan`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: newPlan }),
      });
      if (!res.ok) throw new Error("Failed to update plan");
      setPlan(newPlan);
      router.refresh();
    } catch {
      setError("Failed to update plan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-1">
      <select
        value={plan}
        onChange={(e) => handleChange(e.target.value as PlanId)}
        disabled={loading}
        className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
      >
        {PLAN_IDS.map((p) => (
          <option key={p} value={p}>
            {PLANS[p].name}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
