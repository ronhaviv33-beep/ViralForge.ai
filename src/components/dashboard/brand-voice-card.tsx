import Link from "next/link";
import { Bot } from "lucide-react";
import type { BrandProfile } from "@prisma/client";

export function BrandVoiceCard({ profile }: { profile: BrandProfile | null }) {
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
            <span className="font-medium">
              Your Creator Agent isn&apos;t set up yet.
            </span>{" "}
            Tell ViralForge about your style so your content feels more like you.
          </span>
        </div>
        <Link
          href="/dashboard/creator-agent"
          className="shrink-0 text-xs font-medium text-primary hover:underline"
        >
          Set up Creator Agent →
        </Link>
      </div>
    );
  }

  // Build an inline summary string from the most readable fields.
  const summaryParts: string[] = [];
  if (profile.brandName) summaryParts.push(profile.brandName);
  if (profile.niche) summaryParts.push(profile.niche);
  if (profile.audience) summaryParts.push(profile.audience);
  if (profile.sentenceLength) summaryParts.push(`${profile.sentenceLength} sentences`);
  if (profile.emojiUsage && profile.emojiUsage !== "None")
    summaryParts.push(`${profile.emojiUsage.toLowerCase()} emoji`);
  if (profile.ctaStyle) summaryParts.push(`CTA: ${profile.ctaStyle}`);

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
          <span className="font-medium text-foreground">Creator Agent applied</span>
          <span className="hidden text-muted-foreground sm:inline">·</span>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            Used to personalize this generation
          </span>
        </div>
        <Link
          href="/dashboard/creator-agent"
          className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
        >
          Edit
        </Link>
      </div>

      {/* Subtitle — visible on mobile where the inline one is hidden */}
      <p className="mt-0.5 pl-5 text-xs text-muted-foreground sm:hidden">
        Used to personalize this generation
      </p>

      {/* Inline summary */}
      {summaryParts.length > 0 && (
        <p className="mt-2 pl-5 text-xs text-muted-foreground">
          {summaryParts.join(" · ")}
        </p>
      )}

      {/* Platform + pillar tags */}
      {hasTags && (
        <div className="mt-2 flex flex-wrap gap-1 pl-5">
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
        <p className="mt-2 pl-5 text-xs italic text-muted-foreground/80">
          &ldquo;{notePreview}&rdquo;
        </p>
      )}
    </div>
  );
}
