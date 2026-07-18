import { Suspense } from "react";
import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { getT } from "@/lib/i18n-server";

export const metadata: Metadata = {
  title: "Reset password — ViralForge",
};

export default async function ResetPasswordPage() {
  const t = await getT();
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{t("auth.resetTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("auth.resetSubtitle")}
        </p>
      </div>
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
