import "server-only";
import { prisma } from "@/lib/prisma";
import type { BrandProfile } from "@prisma/client";

export type { BrandProfile };

export interface BrandProfileInput {
  brandName?: string;
  audience?: string;
  defaultTone?: string;
  sentenceLength?: string;
  emojiUsage?: string;
  ctaStyle?: string;
  contentPillars?: string[];
  vocabulary?: string[];
  primaryPlatforms?: string[];
  notes?: string;
}

export async function getBrandProfile(userId: string): Promise<BrandProfile | null> {
  return prisma.brandProfile.findUnique({ where: { userId } });
}

export async function upsertBrandProfile(
  userId: string,
  input: BrandProfileInput
): Promise<BrandProfile> {
  return prisma.brandProfile.upsert({
    where: { userId },
    update: { ...input },
    create: { userId, ...input },
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
  if (profile.audience) lines.push(`Target Audience: ${profile.audience}`);
  if (profile.defaultTone) lines.push(`Preferred Tone: ${profile.defaultTone}`);
  if (profile.sentenceLength) lines.push(`Sentence Length: ${profile.sentenceLength}`);
  if (profile.emojiUsage) lines.push(`Emoji Usage: ${profile.emojiUsage}`);
  if (profile.ctaStyle) lines.push(`CTA Style: ${profile.ctaStyle}`);
  if (profile.contentPillars?.length)
    lines.push(`Content Pillars: ${profile.contentPillars.join(", ")}`);
  if (profile.primaryPlatforms?.length)
    lines.push(`Primary Platforms: ${profile.primaryPlatforms.join(", ")}`);
  if (profile.vocabulary?.length)
    lines.push(`Preferred Vocabulary: ${profile.vocabulary.join(", ")}`);
  if (profile.notes) lines.push(`Additional Notes: ${profile.notes}`);

  if (lines.length === 0) return null;

  return lines.join("\n");
}
