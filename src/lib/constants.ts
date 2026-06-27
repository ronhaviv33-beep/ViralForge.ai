export const TONES = [
  "Professional",
  "Educational",
  "Funny",
  "Founder",
  "Storytelling",
  "Sales",
  "Casual",
] as const;

export type Tone = (typeof TONES)[number];

export const PLATFORMS = [
  "Instagram",
  "TikTok",
  "LinkedIn",
  "X / Twitter",
  "Newsletter",
  "Blog",
] as const;

export type Platform = (typeof PLATFORMS)[number];

export const MAX_INPUT_CHARS = 12000;
export const MIN_INPUT_CHARS = 10;
