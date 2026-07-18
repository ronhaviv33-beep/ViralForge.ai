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

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const isSignup = mode === "signup";

  // Show one-time feedback toasts from redirect params (verified email, password reset).
  React.useEffect(() => {
    if (!isSignup) {
      const verified = searchParams.get("verified");
      const reset = searchParams.get("reset");
      if (verified === "true") {
        toast.success(t("auth.verifiedSuccess"));
      } else if (verified === "error") {
        toast.error(t("auth.verifiedError"));
      }
      if (reset === "true") {
        toast.success(t("auth.resetSuccessLogin"));
      }
    }
    // Run once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const payload: Record<string, string> = {
      email: String(form.get("email") || ""),
      password: String(form.get("password") || ""),
    };
    if (isSignup) payload.name = String(form.get("name") || "");

    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("errors.somethingWentWrong"));
        setLoading(false);
        return;
      }
      toast.success(isSignup ? t("auth.accountCreated") : t("auth.welcomeBack"));

      // If a plan was pre-selected from pricing, send to pricing to check out.
      const plan = searchParams.get("plan");
      if (plan && plan !== "free") {
        router.push(`/pricing`);
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch {
      setError(t("errors.networkError"));
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {isSignup && (
        <div className="space-y-2">
          <Label htmlFor="name">{t("auth.name")}</Label>
          <Input
            id="name"
            name="name"
            placeholder={t("auth.namePlaceholder")}
            autoComplete="name"
          />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">{t("auth.email")}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder={t("auth.emailPlaceholder")}
          autoComplete="email"
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">{t("auth.password")}</Label>
          {!isSignup && (
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {t("auth.forgotPassword")}
            </Link>
          )}
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          required
          placeholder={
            isSignup
              ? t("auth.passwordPlaceholderSignup")
              : t("auth.passwordPlaceholderLogin")
          }
          autoComplete={isSignup ? "new-password" : "current-password"}
        />
      </div>

      {error && (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {isSignup ? t("auth.createAccount") : t("marketing.login")}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {isSignup ? (
          <>
            {t("auth.haveAccount")}{" "}
            <Link href="/login" className="text-primary hover:underline">
              {t("marketing.login")}
            </Link>
          </>
        ) : (
          <>
            {t("auth.noAccount")}{" "}
            <Link href="/signup" className="text-primary hover:underline">
              {t("auth.signupFree")}
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
