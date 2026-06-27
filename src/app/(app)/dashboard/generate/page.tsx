import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getUsageStatus } from "@/lib/usage";
import { GenerateForm } from "@/components/dashboard/generate-form";

export const metadata: Metadata = {
  title: "Generate — ViralForge",
};

export default async function GeneratePage() {
  const user = await requireUser();
  const usage = await getUsageStatus(user.id, user.plan);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Generate content pack</h1>
        <p className="mt-1 text-muted-foreground">
          One idea in, a full multi-platform content package out.
        </p>
      </div>
      <GenerateForm canGenerate={usage.canGenerate} />
    </div>
  );
}
