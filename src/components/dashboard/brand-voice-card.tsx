import Link from "next/link";
import { Bot, Lock } from "lucide-react";
import type { BrandProfile } from "@prisma/client";
import type { AgentUsageStatus } from "@/lib/agent-limits";
import { getT } from "@/lib/i18n-server";

export async function BrandVoiceCard({
  profile,
  agentStatus,
}: {
  profile: BrandProfile | null;
  /** When provided and blocked, the card explains why personalization is off. */
  agentStatus?: Pick<AgentUsageStatus, "blocked" | "blockedReason">;
}) {
  const t = await getT();

  // Determine whether the saved profile actually has any displayable content.
  const hasContent =
    profile &&
    (profile.brandName ||
      profile.niche ||
      profile.audience ||
      profile.goals ||
      profile.sentenceLength ||
      profile.emojiUsage ||
      profile.ctaStyle ||
      profile.postingStyle ||
      profile.contentPillars?.length ||
      profile.primaryPlatforms?.length ||
      profile.vocabulary?.length ||
      profile.preferredPhrases?.length ||
      profile.bannedPhrases?.length ||
      profile.examplePosts ||
      profile.notes);

  if (!hasContent) {
    return (
      <div className="flex items-center justify-between gap-4 rounded-xl border border-dashed border-border bg-transparent px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Bot className="h-3.5 w-3.5 shrink-0" />
          <span>
            <span className="font-medium">{t("brandVoiceCard.notSetTitle")}</span>{" "}
            {t("brandVoiceCard.notSetBody")}
          </span>
        </div>
        <Link
          href="/dashboard/creator-agent"
          className="shrink-0 text-xs font-medium text-primary hover:underline"
        >
          {t("brandVoiceCard.setUp")}
        </Link>
      </div>
    );
  }

  // Profile exists but the Creator Agent can't be applied right now.
  if (agentStatus?.blocked) {
    const isLimit = agentStatus.blockedReason === "limit";
    return (
      <div className="flex items-center justify-between gap-4 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lock className="h-3.5 w-3.5 shrink-0 text-amber-500" />
          <span>
            <span className="font-medium text-foreground">
              {isLimit
                ? t("brandVoiceCard.limitTitle")
                : t("brandVoiceCard.planTitle")}
            </span>{" "}
            {t("brandVoiceCard.stillGenerates")}
          </span>
        </div>
        <Link
          href="/pricing"
          className="shrink-0 text-xs font-medium text-primary hover:underline"
        >
          {t("creatorAgent.upgradeKeepStyle")}
        </Link>
      </div>
    );
  }

  // Build an inline summary string from the most readable fields.
  const summaryParts: string[] = [];
  if (profile.brandName) summaryParts.push(profile.brandName);
  if (profile.niche) summaryParts.push(profile.niche);
  if (profile.audience) summaryParts.push(profile.audience);
  if (profile.sentenceLength)
    summaryParts.push(
      t("brandVoiceCard.sentencesSummary", { value: profile.sentenceLength })
    );
  if (profile.emojiUsage && profile.emojiUsage !== "None")
    summaryParts.push(
      t("brandVoiceCard.emojiSummary", {
        value: profile.emojiUsage.toLowerCase(),
      })
    );
  if (profile.ctaStyle)
    summaryParts.push(t("brandVoiceCard.ctaSummary", { value: profile.ctaStyle }));

  const platforms = profile.primaryPlatforms ?? [];
  const pillars = profile.contentPillars ?? [];
  const hasTags = platforms.length > 0 || pillars.length > 0;
  const notePreview =
    profile.notes && profile.notes.length > 0
      ? profile.notes.slice(0, 120) + (profile.notes.length > 120 ? "…" : "")
      : null;

  return (
    <div className="rounded-xl border border-border bg-card/50 px-4 py-3 text-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Bot className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="font-medium text-foreground">
            {t("brandVoiceCard.applied")}
          </span>
          <span className="hidden text-muted-foreground sm:inline">·</span>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            {t("brandVoiceCard.personalizeHint")}
          </span>
        </div>
        <Link
          href="/dashboard/creator-agent"
          className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
        >
          {t("brandVoiceCard.edit")}
        </Link>
      </div>

      {/* Subtitle — visible on mobile where the inline one is hidden */}
      <p className="mt-0.5 pl-5 text-xs text-muted-foreground sm:hidden rtl:pl-0 rtl:pr-5">
        {t("brandVoiceCard.personalizeHint")}
      </p>

      {/* Inline summary */}
      {summaryParts.length > 0 && (
        <p className="mt-2 pl-5 text-xs text-muted-foreground rtl:pl-0 rtl:pr-5">
          {summaryParts.join(" · ")}
        </p>
      )}

      {/* Platform + pillar tags */}
      {hasTags && (
        <div className="mt-2 flex flex-wrap gap-1 pl-5 rtl:pl-0 rtl:pr-5">
          {platforms.map((p) => (
            <span
              key={p}
              className="rounded-full border border-border bg-secondary px-2 py-0.5 text-xs text-muted-foreground"
            >
              {p}
            </span>
          ))}
          {pillars.map((p) => (
            <span
              key={p}
              className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
            >
              {p}
            </span>
          ))}
        </div>
      )}

      {/* Notes preview — only when no other content is present */}
      {notePreview && summaryParts.length === 0 && !hasTags && (
        <p className="mt-2 pl-5 text-xs italic text-muted-foreground/80 rtl:pl-0 rtl:pr-5">
          &ldquo;{notePreview}&rdquo;
        </p>
      )}
    </div>
  );
}
