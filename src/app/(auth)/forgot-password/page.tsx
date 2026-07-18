import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { getT } from "@/lib/i18n-server";

export const metadata: Metadata = {
  title: "Forgot password — ViralForge",
};

export default async function ForgotPasswordPage() {
  const t = await getT();
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{t("auth.forgotTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("auth.forgotSubtitle")}
        </p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
