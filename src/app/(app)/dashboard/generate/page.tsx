import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getUsageStatus } from "@/lib/usage";
import { getBrandProfile } from "@/lib/brand-profile";
import { GenerateForm } from "@/components/dashboard/generate-form";
import { BrandVoiceCard } from "@/components/dashboard/brand-voice-card";
import { getT } from "@/lib/i18n-server";

export const metadata: Metadata = {
  title: "Generate — ViralForge",
};

export default async function GeneratePage() {
  const user = await requireUser();
  const t = await getT();
  const [usage, brandProfile] = await Promise.all([
    getUsageStatus(user.id, user.plan),
    getBrandProfile(user.id),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("generate.title")}</h1>
        <p className="mt-1 text-muted-foreground">{t("generate.subtitle")}</p>
      </div>
      <BrandVoiceCard profile={brandProfile} />
      <GenerateForm canGenerate={usage.canGenerate} />
    </div>
  );
}
