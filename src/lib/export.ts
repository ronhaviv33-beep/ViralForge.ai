import type { ContentPack } from "@/lib/content-types";

/** Flatten a single section's value to a copy-paste-ready string. */
export function sectionToText(key: keyof ContentPack, pack: ContentPack): string {
  const value = pack[key];
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    if (key === "carousel") {
      return (value as ContentPack["carousel"])
        .map((s) => `Slide ${s.slide}: ${s.title}\n${s.body}`)
        .join("\n\n");
    }
    if (key === "hashtags") {
      return (value as string[]).join(" ");
    }
    if (key === "xThread") {
      return (value as string[]).map((t, i) => `${i + 1}/ ${t}`).join("\n\n");
    }
    return (value as string[]).map((v) => `• ${v}`).join("\n");
  }
  return "";
}

const SECTION_TITLES: Record<keyof ContentPack, string> = {
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

const ORDER: (keyof ContentPack)[] = [
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
];

/** Whole pack as plain text. */
export function packToText(pack: ContentPack, title?: string): string {
  const lines: string[] = [];
  if (title) {
    lines.push(`ViralForge content pack — ${title}`);
    lines.push("=".repeat(48));
    lines.push("");
  }
  for (const key of ORDER) {
    if (pack[key] === undefined) continue;
    lines.push(SECTION_TITLES[key].toUpperCase());
    lines.push("-".repeat(SECTION_TITLES[key].length));
    lines.push(sectionToText(key, pack));
    lines.push("");
    lines.push("");
  }
  return lines.join("\n").trimEnd() + "\n";
}

/** Whole pack as Markdown. */
export function packToMarkdown(pack: ContentPack, title?: string): string {
  const lines: string[] = [];
  lines.push(`# ViralForge Content Pack${title ? ` — ${title}` : ""}`);
  lines.push("");
  for (const key of ORDER) {
    const value = pack[key];
    if (value === undefined) continue;
    lines.push(`## ${SECTION_TITLES[key]}`);
    lines.push("");
    if (typeof value === "string") {
      lines.push(value);
    } else if (key === "carousel") {
      for (const slide of pack.carousel) {
        lines.push(`**Slide ${slide.slide}: ${slide.title}**`);
        lines.push("");
        lines.push(slide.body);
        lines.push("");
      }
    } else if (key === "xThread") {
      (value as string[]).forEach((t, i) => lines.push(`${i + 1}. ${t}`));
    } else if (key === "hashtags") {
      lines.push((value as string[]).join(" "));
    } else {
      (value as string[]).forEach((v) => lines.push(`- ${v}`));
    }
    lines.push("");
  }
  return lines.join("\n");
}

/** Trigger a client-side file download. */
export function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "content-pack"
  );
}
