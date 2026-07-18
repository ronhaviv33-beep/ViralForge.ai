"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/i18n-provider";

interface CopyButtonProps extends Omit<ButtonProps, "onClick"> {
  value: string;
  label?: string;
}

export function CopyButton({
  value,
  label,
  className,
  variant = "ghost",
  size = "sm",
  ...props
}: CopyButtonProps) {
  const { t } = useI18n();
  const [copied, setCopied] = React.useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(t("copy.copied"));
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error(t("copy.copyFailed"));
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={cn(className)}
      {...props}
    >
      {copied ? (
        <Check className="text-accent" />
      ) : (
        <Copy />
      )}
      {label ? <span>{copied ? t("copy.copiedLabel") : label}</span> : null}
    </Button>
  );
}
