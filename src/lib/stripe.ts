import Stripe from "stripe";
import { PLANS, type PlanId } from "@/lib/plans";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }
  if (!stripeClient) {
    stripeClient = new Stripe(key, { apiVersion: "2025-02-24.acacia" });
  }
  return stripeClient;
}

/** Returns the configured Stripe price id for a plan, or null if unset. */
export function getPriceId(plan: PlanId): string | null {
  const env = PLANS[plan].priceEnv;
  if (!env) return null;
  return process.env[env] ?? null;
}

/** Reverse-lookup: which plan does this Stripe price id belong to? */
export function planFromPriceId(priceId: string): PlanId | null {
  for (const plan of Object.values(PLANS)) {
    if (plan.priceEnv && process.env[plan.priceEnv] === priceId) {
      return plan.id;
    }
  }
  return null;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
