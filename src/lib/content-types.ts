import { z } from "zod";

/** Carousel slide shape used in the 5-slide carousel idea. */
export const CarouselSlideSchema = z.object({
  slide: z.number(),
  title: z.string(),
  body: z.string(),
});
export type CarouselSlide = z.infer<typeof CarouselSlideSchema>;

/** The full structured content package returned by the AI. */
export const ContentPackSchema = z.object({
  hooks: z.array(z.string()),
  // Platform-specific fields are optional — only present when that platform was selected.
  instagramCaption: z.string().optional(),
  tiktokCaption: z.string().optional(),
  linkedinPost: z.string().optional(),
  xThread: z.array(z.string()).optional(),
  newsletterDraft: z.string().optional(),
  blogOutline: z.string().optional(),
  hashtags: z.array(z.string()),
  ctaOptions: z.array(z.string()),
  contentIdeas: z.array(z.string()),
  carousel: z.array(CarouselSlideSchema),
});

export type ContentPack = z.infer<typeof ContentPackSchema>;

/** Human-readable metadata for rendering each section of the pack. */
export interface SectionMeta {
  key: keyof ContentPack;
  label: string;
  description: string;
  /** "text" = single string, "list" = string[], "thread" = numbered list, "carousel" = slides */
  type: "text" | "list" | "thread" | "carousel";
  /** Which platform this section belongs to. Undefined = universal (always shown). */
  platform?: string;
}

export const SECTIONS: SectionMeta[] = [
  { key: "hooks", label: "10 Hooks", description: "Scroll-stopping opening lines", type: "list" },
  { key: "instagramCaption", label: "Instagram Caption", description: "Ready to post on Instagram", type: "text", platform: "Instagram" },
  { key: "tiktokCaption", label: "TikTok Caption", description: "Short-form hook + caption", type: "text", platform: "TikTok" },
  { key: "linkedinPost", label: "LinkedIn Post", description: "Professional long-form post", type: "text", platform: "LinkedIn" },
  { key: "xThread", label: "X / Twitter Thread", description: "Multi-tweet thread", type: "thread", platform: "X / Twitter" },
  { key: "newsletterDraft", label: "Newsletter Draft", description: "Email-ready draft", type: "text", platform: "Newsletter" },
  { key: "blogOutline", label: "Blog Outline", description: "Structured article outline", type: "text", platform: "Blog" },
  { key: "hashtags", label: "20 Hashtags", description: "Mix of niche and broad tags", type: "list" },
  { key: "ctaOptions", label: "5 CTA Options", description: "Calls to action to drive results", type: "list" },
  { key: "contentIdeas", label: "10 Content Ideas", description: "Future posts to keep shipping", type: "list" },
  { key: "carousel", label: "5-Slide Carousel", description: "Slide-by-slide carousel concept", type: "carousel" },
];
