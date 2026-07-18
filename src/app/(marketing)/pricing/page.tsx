import type { Metadata } from "next";
import { Suspense } from "react";
import { PricingTable } from "@/components/marketing/pricing-table";
import { CheckoutToast } from "@/components/dashboard/checkout-toast";
import { getCurrentUser } from "@/lib/auth";
import type { PlanId } from "@/lib/plans";
import type { MessageKey } from "@/lib/i18n";
import { getT } from "@/lib/i18n-server";

export const metadata: Metadata = {
  title: "Pricing — ViralForge",
  description: "Simple, transparent pricing. Start free, upgrade when ready.",
};

const FAQS: Array<{ q: MessageKey; a: MessageKey }> = [
  { q: "pricingPage.faq1Q", a: "pricingPage.faq1A" },
  { q: "pricingPage.faq2Q", a: "pricingPage.faq2A" },
  { q: "pricingPage.faq3Q", a: "pricingPage.faq3A" },
  { q: "pricingPage.faq4Q", a: "pricingPage.faq4A" },
];

export default async function PricingPage() {
  const user = await getCurrentUser();
  const t = await getT();
  return (
    <div className="container py-20">
      <Suspense>
        <CheckoutToast />
      </Suspense>
      <div className="mx-auto mb-14 max-w-2xl text-center">
        <h1 className="text-4xl font-bold sm:text-5xl">{t("pricingPage.title")}</h1>
        <p className="mt-4 text-muted-foreground">{t("pricingPage.subtitle")}</p>
      </div>

      <PricingTable
        authed={Boolean(user)}
        currentPlan={user?.plan as PlanId | undefined}
      />

      <div className="mx-auto mt-24 max-w-3xl">
        <h2 className="mb-8 text-center text-2xl font-bold">
          {t("pricingPage.faqTitle")}
        </h2>
        <div className="space-y-4">
          {FAQS.map((faq) => (
            <div
              key={faq.q}
              className="rounded-xl border border-border bg-card p-6"
            >
              <h3 className="font-semibold">{t(faq.q)}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t(faq.a)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
