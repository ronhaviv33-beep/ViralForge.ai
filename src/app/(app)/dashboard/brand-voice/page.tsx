import { requireUser } from "@/lib/auth";
import { getBrandProfile } from "@/lib/brand-profile";
import { BrandProfileForm } from "@/components/dashboard/brand-profile-form";

export const metadata = { title: "Brand Voice – ViralForge" };

export default async function BrandVoicePage() {
  const user = await requireUser();
  const profile = await getBrandProfile(user.id);

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Brand Voice</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell ViralForge about your brand so every content pack sounds like you.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card/50 p-4 text-sm text-muted-foreground">
        <p>
          <span className="font-medium text-foreground">How this is used:</span> When
          you generate content, ViralForge automatically injects your brand voice profile
          into the prompt. The AI will apply your preferred tone, vocabulary, and style
          without you needing to repeat it each time.
        </p>
      </div>

      <BrandProfileForm initialProfile={profile} />
    </div>
  );
}
