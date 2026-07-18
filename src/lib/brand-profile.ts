import "server-only";
import { prisma } from "@/lib/prisma";
import type { BrandProfile } from "@prisma/client";

export type { BrandProfile };

export interface BrandProfileInput {
  brandName?: string;
  niche?: string;
  audience?: string;
  goals?: string;
  defaultTone?: string;
  sentenceLength?: string;
  emojiUsage?: string;
  ctaStyle?: string;
  postingStyle?: string;
  contentPillars?: string[];
  vocabulary?: string[];
  preferredPhrases?: string[];
  bannedPhrases?: string[];
  primaryPlatforms?: string[];
  examplePosts?: string;
  notes?: string;
}

export async function getBrandProfile(userId: string): Promise<BrandProfile | null> {
  return prisma.brandProfile.findUnique({ where: { userId } });
}

export async function upsertBrandProfile(
  userId: string,
  input: BrandProfileInput
): Promise<BrandProfile> {
  // The form always submits its full state, so an absent field means the user
  // cleared it. Map undefined → null explicitly: in a Prisma update, undefined
  // would silently keep the old value, which broke "reset all fields".
  const data = {
    brandName: input.brandName ?? null,
    niche: input.niche ?? null,
    audience: input.audience ?? null,
    goals: input.goals ?? null,
    defaultTone: input.defaultTone ?? null,
    sentenceLength: input.sentenceLength ?? null,
    emojiUsage: input.emojiUsage ?? null,
    ctaStyle: input.ctaStyle ?? null,
    postingStyle: input.postingStyle ?? null,
    contentPillars: input.contentPillars ?? [],
    vocabulary: input.vocabulary ?? [],
    preferredPhrases: input.preferredPhrases ?? [],
    bannedPhrases: input.bannedPhrases ?? [],
    primaryPlatforms: input.primaryPlatforms ?? [],
    examplePosts: input.examplePosts ?? null,
    notes: input.notes ?? null,
  };
  return prisma.brandProfile.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  });
}

/**
 * Formats the brand profile as a concise prompt block for injection into
 * the generation prompt. Returns null when the profile has no meaningful content.
 */
export function formatBrandProfileForPrompt(profile: BrandProfile | null): string | null {
  if (!profile) return null;

  const lines: string[] = [];

  if (profile.brandName) lines.push(`Brand Name: ${profile.brandName}`);
  if (profile.niche) lines.push(`Niche: ${profile.niche}`);
  if (profile.audience) lines.push(`Target Audience: ${profile.audience}`);
  if (profile.goals) lines.push(`Creator Goals: ${profile.goals}`);
  // defaultTone is intentionally omitted — the generate-time TONE: line takes precedence
  if (profile.sentenceLength) lines.push(`Sentence Length: ${profile.sentenceLength}`);
  if (profile.emojiUsage) lines.push(`Emoji Usage: ${profile.emojiUsage}`);
  if (profile.ctaStyle) lines.push(`CTA Style: ${profile.ctaStyle}`);
  if (profile.postingStyle) lines.push(`Posting Style: ${profile.postingStyle}`);
  if (profile.contentPillars?.length)
    lines.push(`Content Pillars: ${profile.contentPillars.join(", ")}`);
  if (profile.primaryPlatforms?.length)
    lines.push(`Primary Platforms: ${profile.primaryPlatforms.join(", ")}`);
  if (profile.vocabulary?.length)
    lines.push(`Preferred Vocabulary: ${profile.vocabulary.join(", ")}`);
  if (profile.preferredPhrases?.length)
    lines.push(`Signature Phrases (use naturally where fitting): ${profile.preferredPhrases.join(", ")}`);
  if (profile.bannedPhrases?.length)
    lines.push(`Never Use These Phrases: ${profile.bannedPhrases.join(", ")}`);
  if (profile.notes) lines.push(`Additional Notes: ${profile.notes}`);
  if (profile.examplePosts) {
    // Cap example content so the prompt stays lean.
    const examples = profile.examplePosts.slice(0, 1500);
    lines.push(`Example of this creator's past content (match its voice):\n${examples}`);
  }

  if (lines.length === 0) return null;

  return lines.join("\n");
}
