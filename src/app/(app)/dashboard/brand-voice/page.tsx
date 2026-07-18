import { redirect } from "next/navigation";

// Brand Voice evolved into the Creator Agent. Keep old links working.
export default function BrandVoicePage() {
  redirect("/dashboard/creator-agent");
}
