import { Bot, Sparkles } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getBrandProfile, type BrandProfile } from "@/lib/brand-profile";
import { BrandProfileForm } from "@/components/dashboard/brand-profile-form";

export const metadata = { title: "Creator Agent – ViralForge" };

/** Human-readable facts the agent currently knows. Product language only. */
function agentKnowledge(profile: BrandProfile | null): string[] {
  if (!profile) return [];
  const facts: string[] = [];
  if (profile.brandName) facts.push(`You go by ${profile.brandName}`);
  if (profile.niche) facts.push(`Your niche is ${profile.niche}`);
  if (profile.audience) facts.push(`You create for ${profile.audience}`);
  if (profile.goals) facts.push(`You want to be known for: ${profile.goals}`);
  if (profile.sentenceLength)
    facts.push(`You like ${profile.sentenceLength.toLowerCase()} sentences`);
  if (profile.emojiUsage)
    facts.push(`Emoji style: ${profile.emojiUsage.toLowerCase()}`);
  if (profile.ctaStyle) facts.push(`You end posts with “${profile.ctaStyle}”`);
  if (profile.postingStyle) facts.push(`Posting style: ${profile.postingStyle}`);
  if (profile.contentPillars.length)
    facts.push(`Your main topics: ${profile.contentPillars.join(", ")}`);
  if (profile.preferredPhrases.length)
    facts.push(`Phrases you love: ${profile.preferredPhrases.join(", ")}`);
  if (profile.bannedPhrases.length)
    facts.push(`Phrases it will avoid: ${profile.bannedPhrases.join(", ")}`);
  if (profile.primaryPlatforms.length)
    facts.push(`You post mostly on ${profile.primaryPlatforms.join(", ")}`);
  if (profile.examplePosts)
    facts.push("It has example posts of yours to study your voice");
  if (profile.notes) facts.push("It follows your extra instructions");
  return facts;
}

export default async function CreatorAgentPage() {
  const user = await requireUser();
  const profile = await getBrandProfile(user.id);
  const knowledge = agentKnowledge(profile);

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Creator Agent</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Teach ViralForge your style.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card/50 p-4 text-sm text-muted-foreground">
        <p>
          Tell us who you create for, what you talk about, and how your content
          should sound. ViralForge will use that to generate ideas, hooks,
          captions, and scripts that feel more like{" "}
          <span className="text-foreground">your voice</span>.
        </p>
        <p className="mt-2 text-xs">
          The more you teach your Creator Agent, the more personalized your
          content becomes. Every field is optional — skip anything and come back
          later.
        </p>
      </div>

      {/* What the agent knows */}
      {knowledge.length > 0 && (
        <div className="rounded-xl border border-primary/25 bg-primary/5 p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">
              What your Creator Agent knows about you
            </h2>
          </div>
          <ul className="mt-3 space-y-1.5">
            {knowledge.map((fact) => (
              <li
                key={fact}
                className="flex gap-2 text-xs text-muted-foreground"
              >
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary" />
                <span>{fact}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground/80">
            This is used automatically every time you generate content.
          </p>
        </div>
      )}

      <BrandProfileForm initialProfile={profile} />
    </div>
  );
}
