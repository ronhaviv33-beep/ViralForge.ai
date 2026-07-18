"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useI18n } from "@/components/i18n-provider";

type Action = "portal" | "upgrade";

interface BillingButtonProps extends Omit<ButtonProps, "onClick"> {
  action: Action;
  plan?: "creator" | "pro" | "agency";
  label: string;
}

export function BillingButton({
  action,
  plan,
  label,
  ...props
}: BillingButtonProps) {
  const router = useRouter();
  const { t } = useI18n();
  const [loading, setLoading] = React.useState(false);

  async function handleClick() {
    if (action === "upgrade" && !plan) {
      router.push("/pricing");
      return;
    }
    setLoading(true);
    try {
      const endpoint =
        action === "portal" ? "/api/stripe/portal" : "/api/stripe/checkout";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: action === "upgrade" ? JSON.stringify({ plan }) : undefined,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("errors.somethingWentWrong"));
      window.location.href = data.url;
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("errors.somethingWentWrong")
      );
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleClick} disabled={loading} {...props}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {label}
    </Button>
  );
}
