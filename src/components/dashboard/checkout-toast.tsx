"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useI18n } from "@/components/i18n-provider";

/**
 * Shows one-time feedback after returning from Stripe Checkout
 * (?checkout=success on the dashboard, ?checkout=cancelled on pricing),
 * then strips the param from the URL.
 */
export function CheckoutToast() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const fired = React.useRef(false);

  React.useEffect(() => {
    if (fired.current) return;
    const checkout = searchParams.get("checkout");
    if (!checkout) return;
    fired.current = true;

    if (checkout === "success") {
      toast.success(t("checkout.successTitle"), {
        description: t("checkout.successBody"),
      });
    } else if (checkout === "cancelled") {
      toast.info(t("checkout.cancelled"));
    }

    // Remove the param so refreshing doesn't re-trigger the toast.
    const params = new URLSearchParams(searchParams.toString());
    params.delete("checkout");
    const query = params.toString();
    router.replace(query ? `?${query}` : window.location.pathname, {
      scroll: false,
    });
  }, [searchParams, router, t]);

  return null;
}
