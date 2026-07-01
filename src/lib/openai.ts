import OpenAI from "openai";
import { ContentPackSchema, type ContentPack } from "@/lib/content-types";
import type { RegeneratableSection } from "@/lib/validation";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }
  if (!client) {
    client = new OpenAI({ apiKey });
  }
  return client;
}

const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

/** Maps each platform name to its ContentPack field. */
const PLATFORM_FIELD_MAP: Record<string, string> = {
  Instagram: "instagramCaption",
  TikTok: "tiktokCaption",
  LinkedIn: "linkedinPost",
  "X / Twitter": "xThread",
  Newsletter: "newsletterDraft",
  Blog: "blogOutline",
};

/** JSON schema shapes for each platform-specific field. */
const PLATFORM_FIELD_SCHEMAS: Record<string, object> = {
  instagramCaption: { type: "string" },
  tiktokCaption: { type: "string" },
  linkedinPost: { type: "string" },
  xThread: {
    type: "array",
    items: { type: "string" },
    description: "Each item is one tweet in the thread (5-8 tweets).",
  },
  newsletterDraft: { type: "string" },
  blogOutline: { type: "string" },
};

/**
 * Builds an OpenAI response schema that only includes the selected platforms.
 * Universal sections (hooks, hashtags, CTAs, content ideas, carousel) are always included.
 */
function buildResponseSchema(platforms: string[]) {
  const platformFields = platforms
    .map((p) => PLATFORM_FIELD_MAP[p])
    .filter(Boolean);

  const platformProperties: Record<string, object> = {};
  for (const field of platformFields) {
    platformProperties[field] = PLATFORM_FIELD_SCHEMAS[field];
  }

  return {
    type: "object",
    additionalProperties: false,
    properties: {
      hooks: {
        type: "array",
        items: { type: "string" },
        description: "Exactly 10 scroll-stopping hooks.",
      },
      ...platformProperties,
      hashtags: {
        type: "array",
        items: { type: "string" },
        description: "Exactly 20 hashtags, each starting with #.",
      },
      ctaOptions: {
        type: "array",
        items: { type: "string" },
        description: "Exactly 5 calls to action.",
      },
      contentIdeas: {
        type: "array",
        items: { type: "string" },
        description: "Exactly 10 future content ideas.",
      },
      carousel: {
        type: "array",
        description: "Exactly 5 carousel slides.",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            slide: { type: "number" },
            title: { type: "string" },
            body: { type: "string" },
          },
          required: ["slide", "title", "body"],
        },
      },
    },
    required: ["hooks", ...platformFields, "hashtags", "ctaOptions", "contentIdeas", "carousel"],
  };
}

function buildSystemPrompt(): string {
  return [
    "You are ViralForge, an elite social media strategist and copywriter.",
    "You turn a single idea, transcript, or block of text into a complete, ready-to-publish content package.",
    "",
    "Rules:",
    "- Keep everything practical and immediately usable. No filler, no fluff, no generic platitudes.",
    "- Avoid generic content. Be specific, concrete, and grounded in the user's actual input.",
    "- Strictly match the requested TONE in voice, vocabulary, and energy.",
    "- Adapt content to each platform's native format, length, and culture.",
    "- Instagram: punchy, emoji-aware, line breaks, ends with a question or CTA.",
    "- TikTok: hook-first, conversational, short.",
    "- LinkedIn: professional, value-dense, scannable short paragraphs, no hashtag spam.",
    "- X/Twitter thread: each array item is ONE tweet, under 280 characters, the first tweet is the hook.",
    "- Newsletter: warm subject-line-style opener, skimmable, one clear takeaway.",
    "- Blog outline: clear H2/H3 structure with bullet points the writer can expand.",
    "- Hashtags: exactly 20, each starting with '#', a mix of broad and niche, no spaces.",
    "- Everything must be ready to copy and paste with clear formatting.",
    "- Return ONLY valid JSON matching the provided schema. Do not include commentary.",
  ].join("\n");
}

function buildUserPrompt(
  text: string,
  tone: string,
  platforms: string[],
  brandContext?: string | null
): string {
  const lines = [
    `TONE: ${tone}`,
    `GENERATE CONTENT FOR THESE PLATFORMS ONLY: ${platforms.join(", ")}`,
  ];

  if (brandContext) {
    lines.push("", "BRAND VOICE:", brandContext);
  }

  lines.push(
    "",
    "SOURCE MATERIAL:",
    '"""',
    text,
    '"""',
    "",
    "Produce the content package now. Remember:",
    "- exactly 10 hooks",
    "- exactly 20 hashtags",
    "- exactly 5 CTA options",
    "- exactly 10 content ideas",
    "- exactly 5 carousel slides"
  );

  if (platforms.includes("X / Twitter")) {
    lines.push("- the X thread should be 5-8 tweets, each its own array item.");
  }

  return lines.join("\n");
}

/** Generate a structured content pack from the given input. */
export async function generateContentPack(
  text: string,
  tone: string,
  platforms: string[],
  brandContext?: string | null
): Promise<ContentPack> {
  const openai = getClient();
  const schema = buildResponseSchema(platforms);

  const completion = await openai.chat.completions.create({
    model: MODEL,
    temperature: 0.8,
    messages: [
      { role: "system", content: buildSystemPrompt() },
      { role: "user", content: buildUserPrompt(text, tone, platforms, brandContext) },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "content_pack",
        strict: true,
        schema,
      },
    },
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    throw new Error("The AI returned an empty response. Please try again.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("The AI returned malformed output. Please try again.");
  }

  const result = ContentPackSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error("The AI output did not match the expected format.");
  }

  return result.data;
}

// ─── Single-section regeneration ────────────────────────────────────────────

/** OpenAI JSON-schema shape for each individual section. */
const SECTION_REGEN_SCHEMAS: Record<RegeneratableSection, object> = {
  hooks: { type: "array", items: { type: "string" }, description: "Exactly 10 scroll-stopping hooks." },
  instagramCaption: { type: "string" },
  tiktokCaption: { type: "string" },
  linkedinPost: { type: "string" },
  xThread: { type: "array", items: { type: "string" }, description: "5-8 tweets, each under 280 chars." },
  newsletterDraft: { type: "string" },
  blogOutline: { type: "string" },
  hashtags: { type: "array", items: { type: "string" }, description: "Exactly 20 hashtags, each starting with #." },
  ctaOptions: { type: "array", items: { type: "string" }, description: "Exactly 5 calls to action." },
  contentIdeas: { type: "array", items: { type: "string" }, description: "Exactly 10 future content ideas." },
  carousel: {
    type: "array",
    description: "Exactly 5 carousel slides.",
    items: {
      type: "object",
      additionalProperties: false,
      properties: {
        slide: { type: "number" },
        title: { type: "string" },
        body: { type: "string" },
      },
      required: ["slide", "title", "body"],
    },
  },
};

const SECTION_LABELS: Record<RegeneratableSection, string> = {
  hooks: "10 Hooks",
  instagramCaption: "Instagram Caption",
  tiktokCaption: "TikTok Caption",
  linkedinPost: "LinkedIn Post",
  xThread: "X / Twitter Thread",
  newsletterDraft: "Newsletter Draft",
  blogOutline: "Blog Outline",
  hashtags: "20 Hashtags",
  ctaOptions: "5 CTA Options",
  contentIdeas: "10 Content Ideas",
  carousel: "5-Slide Carousel",
};

const SECTION_TASK: Record<RegeneratableSection, string> = {
  hooks: "Generate exactly 10 new scroll-stopping opening lines (hooks).",
  instagramCaption: "Generate a punchy Instagram caption with emojis, line breaks, and a closing CTA or question.",
  tiktokCaption: "Generate a short, hook-first TikTok caption. Keep it conversational.",
  linkedinPost: "Generate a professional LinkedIn post: value-dense, scannable short paragraphs, no hashtag spam.",
  xThread: "Generate an X/Twitter thread of 5-8 tweets. Each array item is ONE tweet under 280 characters. The first tweet is the hook.",
  newsletterDraft: "Generate a newsletter draft with a warm opener, skimmable sections, and one clear takeaway.",
  blogOutline: "Generate a blog outline with clear H2/H3 headings and bullet points the writer can expand.",
  hashtags: "Generate exactly 20 hashtags, each starting with #. Mix broad and niche tags. No spaces within tags.",
  ctaOptions: "Generate exactly 5 distinct, compelling calls to action.",
  contentIdeas: "Generate exactly 10 future content ideas inspired by the source material.",
  carousel: "Generate exactly 5 carousel slides. Each needs a slide number, a punchy title, and body text.",
};

function buildRegenSystemPrompt(): string {
  return [
    "You are ViralForge, an elite social media strategist and copywriter.",
    "You are regenerating one section of an existing content pack.",
    "Rules:",
    "- Match the requested TONE exactly in voice, vocabulary, and energy.",
    "- Be specific, concrete, and grounded in the source material provided.",
    "- Return ONLY valid JSON matching the provided schema. No commentary.",
  ].join("\n");
}

function buildRegenUserPrompt(
  section: RegeneratableSection,
  context: {
    inputText: string;
    tone: string;
    platforms: string[];
    outputJson: ContentPack;
  },
  brandContext?: string | null
): string {
  const lines: string[] = [
    `SECTION TO REGENERATE: ${SECTION_LABELS[section]}`,
    `TASK: ${SECTION_TASK[section]}`,
    "",
    `TONE: ${context.tone}`,
    `PLATFORMS: ${context.platforms.join(", ")}`,
  ];

  if (brandContext) {
    lines.push("", "BRAND VOICE:", brandContext);
  }

  // Include a sample of existing hooks when regenerating other sections, for creative consistency.
  if (section !== "hooks" && context.outputJson.hooks?.length) {
    const sample = context.outputJson.hooks
      .slice(0, 3)
      .map((h, i) => `${i + 1}. ${h}`)
      .join("\n");
    lines.push("", "EXISTING HOOKS (for creative context — do not repeat):", sample);
  }

  lines.push(
    "",
    "SOURCE MATERIAL:",
    '"""',
    context.inputText,
    '"""',
    "",
    "Return ONLY the requested section. Do not include any other sections."
  );

  return lines.join("\n");
}

/**
 * Regenerates a single section of a content pack.
 * Returns the raw new value for that section (untyped — caller validates via ContentPackSchema).
 */
export async function regenerateSection(
  section: RegeneratableSection,
  context: {
    inputText: string;
    tone: string;
    platforms: string[];
    outputJson: ContentPack;
  },
  brandContext?: string | null
): Promise<unknown> {
  const openai = getClient();

  // Wrap the section's schema in a single-field object for strict JSON output.
  const schema = {
    type: "object",
    additionalProperties: false,
    properties: {
      result: SECTION_REGEN_SCHEMAS[section],
    },
    required: ["result"],
  };

  const completion = await openai.chat.completions.create({
    model: MODEL,
    temperature: 0.85,
    messages: [
      { role: "system", content: buildRegenSystemPrompt() },
      { role: "user", content: buildRegenUserPrompt(section, context, brandContext) },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "section_regen",
        strict: true,
        schema,
      },
    },
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("The AI returned an empty response.");

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("The AI returned malformed output.");
  }

  const wrapper = parsed as { result?: unknown };
  if (wrapper.result === undefined) throw new Error("The AI response was missing the result field.");

  return wrapper.result;
}

/** Short title for a generation, derived from the input text. */
export function deriveTitle(text: string): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= 60) return cleaned || "Untitled generation";
  return cleaned.slice(0, 57).trimEnd() + "…";
}
