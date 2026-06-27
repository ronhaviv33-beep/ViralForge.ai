import type { Plan } from "@prisma/client";

export type PlanId = "free" | "creator" | "pro" | "agency";

export interface PlanConfig {
  id: PlanId;
  name: string;
  price: number; // monthly USD
  /** Monthly generation limit. -1 means unlimited. */
  limit: number;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  /** Stripe price id env var name */
  priceEnv?: string;
}

export const PLANS: Record<PlanId, PlanConfig> = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    limit: 3,
    description: "Try ViralForge with no commitment.",
    cta: "Start Free",
    features: [
      "3 generations / month",
      "All platforms & tones",
      "Copy & export",
      "Generation history",
    ],
  },
  creator: {
    id: "creator",
    name: "Creator",
    price: 19,
    limit: 100,
    description: "For solo creators shipping content daily.",
    cta: "Upgrade to Creator",
    highlighted: true,
    priceEnv: "STRIPE_PRICE_CREATOR",
    features: [
      "100 generations / month",
      "All platforms & tones",
      "Copy & export (.txt / .md)",
      "Full generation history",
      "Priority generation",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 39,
    limit: -1,
    description: "For power users who never want to think about limits.",
    cta: "Upgrade to Pro",
    priceEnv: "STRIPE_PRICE_PRO",
    features: [
      "Unlimited generations",
      "All platforms & tones",
      "Copy & export (.txt / .md)",
      "Full generation history",
      "Priority generation",
    ],
  },
  agency: {
    id: "agency",
    name: "Agency",
    price: 99,
    limit: -1,
    description: "For teams & agencies running multiple brands.",
    cta: "Upgrade to Agency",
    priceEnv: "STRIPE_PRICE_AGENCY",
    features: [
      "Unlimited generations",
      "Everything in Pro",
      "Multi-brand support (coming soon)",
      "Priority support",
    ],
  },
};

export const PLAN_LIST = Object.values(PLANS);

export function getPlanLimit(plan: Plan | PlanId): number {
  return PLANS[plan as PlanId]?.limit ?? 3;
}

export function isUnlimited(plan: Plan | PlanId): boolean {
  return getPlanLimit(plan) === -1;
}
