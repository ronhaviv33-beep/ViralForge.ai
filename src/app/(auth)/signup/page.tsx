import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth";
import { AuthForm } from "@/components/auth/auth-form";
import { getT } from "@/lib/i18n-server";

export const metadata: Metadata = {
  title: "Sign up — ViralForge",
};

export default async function SignupPage() {
  const userId = await getSessionUserId();
  if (userId) redirect("/dashboard");
  const t = await getT();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{t("auth.signupTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("auth.signupSubtitle")}
        </p>
      </div>
      <Suspense>
        <AuthForm mode="signup" />
      </Suspense>
    </div>
  );
}
