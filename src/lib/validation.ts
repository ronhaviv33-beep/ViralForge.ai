import { z } from "zod";
import { TONES, PLATFORMS, MIN_INPUT_CHARS, MAX_INPUT_CHARS } from "@/lib/constants";

export const signupSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80).optional(),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const generateSchema = z.object({
  text: z
    .string()
    .trim()
    .min(MIN_INPUT_CHARS, `Add at least ${MIN_INPUT_CHARS} characters of input`)
    .max(MAX_INPUT_CHARS, `Input must be under ${MAX_INPUT_CHARS} characters`),
  tone: z.enum(TONES, { errorMap: () => ({ message: "Select a valid tone" }) }),
  platforms: z
    .array(z.enum(PLATFORMS))
    .min(1, "Select at least one platform")
    .max(PLATFORMS.length),
  // Explicit content-language choice. Optional: when absent the server falls
  // back to the active UI locale (see resolveContentLocale).
  contentLanguage: z.enum(["en", "he"]).optional(),
});

export const brandProfileSchema = z.object({
  brandName: z.string().trim().max(100).optional(),
  niche: z.string().trim().max(150).optional(),
  audience: z.string().trim().max(400).optional(),
  goals: z.string().trim().max(400).optional(),
  defaultTone: z.string().trim().max(50).optional(),
  sentenceLength: z.string().trim().max(50).optional(),
  emojiUsage: z.string().trim().max(50).optional(),
  ctaStyle: z.string().trim().max(150).optional(),
  postingStyle: z.string().trim().max(200).optional(),
  contentPillars: z.array(z.string().trim().max(60)).max(10).default([]),
  vocabulary: z.array(z.string().trim().max(60)).max(30).default([]),
  preferredPhrases: z.array(z.string().trim().max(100)).max(20).default([]),
  bannedPhrases: z.array(z.string().trim().max(100)).max(20).default([]),
  primaryPlatforms: z.array(z.string().trim().max(60)).max(10).default([]),
  examplePosts: z.string().trim().max(4000).optional(),
  notes: z.string().trim().max(1000).optional(),
});

export const REGENERATABLE_SECTIONS = [
  "hooks",
  "instagramCaption",
  "tiktokCaption",
  "linkedinPost",
  "xThread",
  "newsletterDraft",
  "blogOutline",
  "hashtags",
  "ctaOptions",
  "contentIdeas",
  "carousel",
] as const;

export type RegeneratableSection = (typeof REGENERATABLE_SECTIONS)[number];

export const regenerateSectionSchema = z.object({
  section: z.enum(REGENERATABLE_SECTIONS, {
    errorMap: () => ({ message: "Invalid section name." }),
  }),
});

export const adminCreateUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80).optional(),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100),
  plan: z.enum(["free", "creator", "pro", "agency"]).default("free"),
  role: z.enum(["USER", "ADMIN"]).default("USER"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type GenerateInput = z.infer<typeof generateSchema>;
export type BrandProfileFormInput = z.infer<typeof brandProfileSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
