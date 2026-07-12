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
          Teach ViralForge how you sound — so every post it writes feels like{" "}
          <span className="text-foreground">you</span> wrote it.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card/50 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">💡 How it works</p>
        <p className="mt-1">
          Fill this in once, like you&apos;re introducing yourself to a new social media
          assistant. From then on, every content pack you generate will automatically
          match your style — no need to repeat yourself.
        </p>
        <p className="mt-2 text-xs">
          Every field is optional. Skip anything you&apos;re unsure about — you can
          always come back and change it.
        </p>
      </div>

      <BrandProfileForm initialProfile={profile} />
    </div>
  );
}
