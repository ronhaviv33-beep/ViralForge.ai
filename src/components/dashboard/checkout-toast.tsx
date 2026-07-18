"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

/**
 * Shows one-time feedback after returning from Stripe Checkout
 * (?checkout=success on the dashboard, ?checkout=cancelled on pricing),
 * then strips the param from the URL.
 */
export function CheckoutToast() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fired = React.useRef(false);

  React.useEffect(() => {
    if (fired.current) return;
    const checkout = searchParams.get("checkout");
    if (!checkout) return;
    fired.current = true;

    if (checkout === "success") {
      toast.success("You're subscribed! 🎉", {
        description:
          "Your plan is being activated — it may take a few seconds to appear.",
      });
    } else if (checkout === "cancelled") {
      toast.info("Checkout cancelled. No charge was made.");
    }

    // Remove the param so refreshing doesn't re-trigger the toast.
    const params = new URLSearchParams(searchParams.toString());
    params.delete("checkout");
    const query = params.toString();
    router.replace(query ? `?${query}` : window.location.pathname, {
      scroll: false,
    });
  }, [searchParams, router]);

  return null;
}
