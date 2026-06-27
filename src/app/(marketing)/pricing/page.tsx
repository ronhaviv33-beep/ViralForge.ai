import type { Metadata } from "next";
import { PricingTable } from "@/components/marketing/pricing-table";
import { getCurrentUser } from "@/lib/auth";
import type { PlanId } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Pricing — ViralForge",
  description: "Simple, transparent pricing. Start free, upgrade when ready.",
};

const FAQS = [
  {
    q: "What counts as a generation?",
    a: "Every time you turn an idea into a full content pack, that's one generation. Your full content package — hooks, captions, threads, hashtags and more — counts as a single generation.",
  },
  {
    q: "Can I change plans later?",
    a: "Yes. You can upgrade or downgrade at any time from your settings. Changes take effect immediately and billing is prorated by Stripe.",
  },
  {
    q: "Do unused generations roll over?",
    a: "No. Generation limits reset at the start of each calendar month.",
  },
  {
    q: "What happens on the Agency plan?",
    a: "Agency includes everything in Pro with unlimited generations. Multi-brand workspace support is coming soon.",
  },
];

export default async function PricingPage() {
  const user = await getCurrentUser();
  return (
    <div className="container py-20">
      <div className="mx-auto mb-14 max-w-2xl text-center">
        <h1 className="text-4xl font-bold sm:text-5xl">Pricing</h1>
        <p className="mt-4 text-muted-foreground">
          Start free with 3 generations. Upgrade any time to create more.
        </p>
      </div>

      <PricingTable
        authed={Boolean(user)}
        currentPlan={user?.plan as PlanId | undefined}
      />

      <div className="mx-auto mt-24 max-w-3xl">
        <h2 className="mb-8 text-center text-2xl font-bold">
          Frequently asked questions
        </h2>
        <div className="space-y-4">
          {FAQS.map((faq) => (
            <div
              key={faq.q}
              className="rounded-xl border border-border bg-card p-6"
            >
              <h3 className="font-semibold">{faq.q}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
