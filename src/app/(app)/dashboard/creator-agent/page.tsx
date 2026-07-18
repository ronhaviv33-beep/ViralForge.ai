import Link from "next/link";
import { Bot, Sparkles } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getBrandProfile, type BrandProfile } from "@/lib/brand-profile";
import { getAgentUsageStatus } from "@/lib/agent-limits";
import { BrandProfileForm } from "@/components/dashboard/brand-profile-form";
import type { Translator } from "@/lib/i18n";
import { getT } from "@/lib/i18n-server";

export const metadata = { title: "Creator Agent – ViralForge" };

/** Human-readable facts the agent currently knows. Product language only. */
function agentKnowledge(t: Translator, profile: BrandProfile | null): string[] {
  if (!profile) return [];
  const facts: string[] = [];
  if (profile.brandName)
    facts.push(t("creatorAgent.factName", { value: profile.brandName }));
  if (profile.niche)
    facts.push(t("creatorAgent.factNiche", { value: profile.niche }));
  if (profile.audience)
    facts.push(t("creatorAgent.factAudience", { value: profile.audience }));
  if (profile.goals)
    facts.push(t("creatorAgent.factGoals", { value: profile.goals }));
  if (profile.sentenceLength)
    facts.push(
      t("creatorAgent.factSentences", {
        value: profile.sentenceLength.toLowerCase(),
      })
    );
  if (profile.emojiUsage)
    facts.push(
      t("creatorAgent.factEmoji", { value: profile.emojiUsage.toLowerCase() })
    );
  if (profile.ctaStyle)
    facts.push(t("creatorAgent.factCta", { value: profile.ctaStyle }));
  if (profile.postingStyle)
    facts.push(t("creatorAgent.factPosting", { value: profile.postingStyle }));
  if (profile.contentPillars.length)
    facts.push(
      t("creatorAgent.factTopics", { value: profile.contentPillars.join(", ") })
    );
  if (profile.preferredPhrases.length)
    facts.push(
      t("creatorAgent.factPhrases", {
        value: profile.preferredPhrases.join(", "),
      })
    );
  if (profile.bannedPhrases.length)
    facts.push(
      t("creatorAgent.factBanned", { value: profile.bannedPhrases.join(", ") })
    );
  if (profile.primaryPlatforms.length)
    facts.push(
      t("creatorAgent.factPlatforms", {
        value: profile.primaryPlatforms.join(", "),
      })
    );
  if (profile.examplePosts) facts.push(t("creatorAgent.factExamples"));
  if (profile.notes) facts.push(t("creatorAgent.factNotes"));
  return facts;
}

export default async function CreatorAgentPage() {
  const user = await requireUser();
  const t = await getT();
  const [profile, agentStatus] = await Promise.all([
    getBrandProfile(user.id),
    getAgentUsageStatus(user.id, user.plan),
  ]);
  const knowledge = agentKnowledge(t, profile);

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">{t("nav.creatorAgent")}</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("creatorAgent.tagline")}
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card/50 p-4 text-sm text-muted-foreground">
        <p>
          {t("creatorAgent.intro1")}{" "}
          <span className="text-foreground">{t("creatorAgent.introHighlight")}</span>.
        </p>
        <p className="mt-2 text-xs">{t("creatorAgent.intro2")}</p>
      </div>

      {/* Monthly usage */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/50 px-4 py-3 text-sm">
        <span className="text-muted-foreground">
          {t("creatorAgent.usagePrefix")}{" "}
          <span className="font-medium text-foreground">
            {t("creatorAgent.usageUsedOf", {
              used: agentStatus.used,
              limit: agentStatus.limit,
            })}
          </span>{" "}
          {t("creatorAgent.usageSuffix")}
        </span>
        {agentStatus.blocked ? (
          <Link
            href="/pricing"
            className="text-xs font-medium text-primary hover:underline"
          >
            {t("creatorAgent.upgradeKeepStyle")}
          </Link>
        ) : (
          <span className="text-xs text-muted-foreground">
            {t("creatorAgent.remaining", { count: agentStatus.remaining })}
          </span>
        )}
      </div>

      {agentStatus.blocked && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
          {agentStatus.blockedReason === "limit"
            ? t("creatorAgent.blockedLimit")
            : t("creatorAgent.blockedPlan")}
        </div>
      )}

      {/* What the agent knows */}
      {knowledge.length > 0 && (
        <div className="rounded-xl border border-primary/25 bg-primary/5 p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">{t("creatorAgent.knowsTitle")}</h2>
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
            {t("creatorAgent.knowsFooter")}
          </p>
        </div>
      )}

      <BrandProfileForm initialProfile={profile} />
    </div>
  );
}
