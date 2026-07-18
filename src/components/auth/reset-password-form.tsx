"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/components/i18n-provider";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { t } = useI18n();

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") || "");
    const confirm = String(form.get("confirm") || "");

    if (password !== confirm) {
      setError(t("auth.passwordsDontMatch"));
      return;
    }

    if (!token) {
      setError(t("auth.invalidResetLink"));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("errors.somethingWentWrong"));
        return;
      }
      toast.success(t("auth.passwordUpdated"));
      router.push("/login?reset=true");
    } catch {
      setError(t("errors.networkError"));
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-destructive">{t("auth.missingToken")}</p>
        <Link
          href="/forgot-password"
          className="block text-sm text-primary hover:underline"
        >
          {t("auth.requestNewLink")}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">{t("auth.newPassword")}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          placeholder={t("auth.passwordPlaceholderSignup")}
          autoComplete="new-password"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm">{t("auth.confirmPassword")}</Label>
        <Input
          id="confirm"
          name="confirm"
          type="password"
          required
          placeholder={t("auth.confirmPlaceholder")}
          autoComplete="new-password"
        />
      </div>

      {error && (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {t("auth.setNewPassword")}
      </Button>
    </form>
  );
}
