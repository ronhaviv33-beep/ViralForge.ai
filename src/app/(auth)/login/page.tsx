import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth";
import { AuthForm } from "@/components/auth/auth-form";
import { getT } from "@/lib/i18n-server";

export const metadata: Metadata = {
  title: "Log in — ViralForge",
};

export default async function LoginPage() {
  const userId = await getSessionUserId();
  if (userId) redirect("/dashboard");
  const t = await getT();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{t("auth.loginTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("auth.loginSubtitle")}
        </p>
      </div>
      <Suspense>
        <AuthForm mode="login" />
      </Suspense>
    </div>
  );
}
