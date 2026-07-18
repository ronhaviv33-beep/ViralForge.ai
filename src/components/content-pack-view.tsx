"use client";

import * as React from "react";
import { Download, FileText, FileType, RefreshCw, ChevronsUp, ChevronsDown } from "lucide-react";
import { toast } from "sonner";
import type { ContentPack } from "@/lib/content-types";
import { SECTIONS } from "@/lib/content-types";
import { TONES } from "@/lib/constants";
import type { RegeneratableSection } from "@/lib/validation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/copy-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  packToText,
  packToMarkdown,
  sectionToText,
  downloadFile,
  slugify,
} from "@/lib/export";
import { cn } from "@/lib/utils";
import type { MessageKey, Translator } from "@/lib/i18n";
import { useI18n } from "@/components/i18n-provider";

interface ContentPackViewProps {
  pack: ContentPack;
  title?: string;
  /** Selected platforms. Sections for unselected platforms are hidden. */
  platforms?: string[];
  /**
   * When provided, each section shows a regenerate button.
   * Must be the persisted generation ID so the server can verify ownership.
   */
  generationId?: string;
}

/** Translated label/description per pack section, keyed by ContentPack field. */
const SECTION_KEYS: Record<
  keyof ContentPack,
  { label: MessageKey; description: MessageKey }
> = {
  hooks: {
    label: "contentPack.sections.hooks.label",
    description: "contentPack.sections.hooks.description",
  },
  instagramCaption: {
    label: "contentPack.sections.instagramCaption.label",
    description: "contentPack.sections.instagramCaption.description",
  },
  tiktokCaption: {
    label: "contentPack.sections.tiktokCaption.label",
    description: "contentPack.sections.tiktokCaption.description",
  },
  linkedinPost: {
    label: "contentPack.sections.linkedinPost.label",
    description: "contentPack.sections.linkedinPost.description",
  },
  xThread: {
    label: "contentPack.sections.xThread.label",
    description: "contentPack.sections.xThread.description",
  },
  newsletterDraft: {
    label: "contentPack.sections.newsletterDraft.label",
    description: "contentPack.sections.newsletterDraft.description",
  },
  blogOutline: {
    label: "contentPack.sections.blogOutline.label",
    description: "contentPack.sections.blogOutline.description",
  },
  hashtags: {
    label: "contentPack.sections.hashtags.label",
    description: "contentPack.sections.hashtags.description",
  },
  ctaOptions: {
    label: "contentPack.sections.ctaOptions.label",
    description: "contentPack.sections.ctaOptions.description",
  },
  contentIdeas: {
    label: "contentPack.sections.contentIdeas.label",
    description: "contentPack.sections.contentIdeas.description",
  },
  carousel: {
    label: "contentPack.sections.carousel.label",
    description: "contentPack.sections.carousel.description",
  },
};

function sectionLabel(t: Translator, key: keyof ContentPack): string {
  return t(SECTION_KEYS[key].label);
}

export function ContentPackView({ pack, title, platforms, generationId }: ContentPackViewProps) {
  const { t } = useI18n();
  // Track the current pack internally so regenerated sections update in place.
  const [currentPack, setCurrentPack] = React.useState<ContentPack>(pack);
  // Per-section loading state — only one section regenerates at a time per key.
  const [regenerating, setRegenerating] = React.useState<
    Partial<Record<keyof ContentPack, boolean>>
  >({});

  const visibleSections = React.useMemo(
    () =>
      SECTIONS.filter((s) => {
        if (s.platform) {
          return (
            (!platforms || platforms.includes(s.platform)) &&
            currentPack[s.key] !== undefined
          );
        }
        return true;
      }),
    [currentPack, platforms]
  );

  const allText = React.useMemo(() => packToText(currentPack, title), [currentPack, title]);

  function handleExport(format: "txt" | "md") {
    const base = slugify(title ?? "content-pack");
    if (format === "txt") {
      downloadFile(`${base}.txt`, packToText(currentPack, title), "text/plain");
    } else {
      downloadFile(`${base}.md`, packToMarkdown(currentPack, title), "text/markdown");
    }
    toast.success(t("contentPack.exported", { format }));
  }

  async function handleRegenerate(
    section: keyof ContentPack,
    options?: { tone?: string; length?: "shorter" | "longer" }
  ) {
    if (!generationId || regenerating[section]) return;

    setRegenerating((prev) => ({ ...prev, [section]: true }));
    try {
      const res = await fetch(
        `/api/generations/${generationId}/regenerate-section`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ section, ...options }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || t("contentPack.regenerateFailed"));
        return;
      }
      setCurrentPack((prev) => ({ ...prev, [section]: data.value }));
      toast.success(
        t("contentPack.regenerated", { label: sectionLabel(t, section) })
      );
    } catch {
      toast.error(t("errors.networkError"));
    } finally {
      setRegenerating((prev) => ({ ...prev, [section]: false }));
    }
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/60 p-4">
        <div>
          <p className="text-sm font-medium">{t("contentPack.ready")}</p>
          <p className="text-xs text-muted-foreground">
            {t("contentPack.readyHint", { count: visibleSections.length })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CopyButton
            value={allText}
            label={t("contentPack.copyAll")}
            variant="secondary"
            size="default"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4" /> {t("contentPack.export")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("txt")}>
                <FileText className="h-4 w-4" /> {t("contentPack.exportTxt")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("md")}>
                <FileType className="h-4 w-4" /> {t("contentPack.exportMd")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Sections */}
      <div className="grid gap-5 lg:grid-cols-2">
        {visibleSections.map((section) => {
          const isRegenerating = !!regenerating[section.key];
          return (
            <Card key={section.key} className="flex flex-col">
              <CardHeader className="flex-row items-start justify-between gap-3 space-y-0 pb-3">
                <div>
                  <h3 className="font-semibold">{sectionLabel(t, section.key)}</h3>
                  <p className="text-xs text-muted-foreground">
                    {t(SECTION_KEYS[section.key].description)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {generationId && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          disabled={isRegenerating}
                          title={t("contentPack.regenerateTitle", {
                            label: sectionLabel(t, section.key),
                          })}
                          className={cn(
                            "flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors",
                            "hover:bg-secondary hover:text-foreground disabled:opacity-40"
                          )}
                        >
                          <RefreshCw
                            className={cn(
                              "h-3.5 w-3.5",
                              isRegenerating && "animate-spin"
                            )}
                          />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            handleRegenerate(section.key as RegeneratableSection)
                          }
                        >
                          <RefreshCw className="h-3.5 w-3.5" /> Regenerate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            handleRegenerate(section.key as RegeneratableSection, {
                              length: "shorter",
                            })
                          }
                        >
                          <ChevronsUp className="h-3.5 w-3.5" /> Make it shorter
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleRegenerate(section.key as RegeneratableSection, {
                              length: "longer",
                            })
                          }
                        >
                          <ChevronsDown className="h-3.5 w-3.5" /> Make it longer
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Change tone</DropdownMenuLabel>
                        {TONES.map((toneOption) => (
                          <DropdownMenuItem
                            key={toneOption}
                            onClick={() =>
                              handleRegenerate(
                                section.key as RegeneratableSection,
                                { tone: toneOption }
                              )
                            }
                          >
                            {toneOption}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  <CopyButton value={sectionToText(section.key, currentPack)} />
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <SectionBody section={section.key} pack={currentPack} t={t} />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function SectionBody({
  section,
  pack,
  t,
}: {
  section: keyof ContentPack;
  pack: ContentPack;
  t: Translator;
}) {
  const value = pack[section];

  if (section === "carousel") {
    return (
      <div className="space-y-3">
        {pack.carousel.map((slide) => (
          <div
            key={slide.slide}
            className="rounded-lg border border-border bg-background/40 p-3"
          >
            <div className="mb-1 flex items-center gap-2">
              <Badge variant="secondary">
                {t("contentPack.slide", { n: slide.slide })}
              </Badge>
              <span className="text-sm font-medium">{slide.title}</span>
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {slide.body}
            </p>
          </div>
        ))}
      </div>
    );
  }

  if (section === "hashtags") {
    return (
      <div className="flex flex-wrap gap-2">
        {(value as string[]).map((tag, i) => (
          <span
            key={`${tag}-${i}`}
            className="rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary"
          >
            {tag.startsWith("#") ? tag : `#${tag}`}
          </span>
        ))}
      </div>
    );
  }

  if (section === "xThread") {
    return (
      <ol className="space-y-3">
        {(value as string[]).map((tweet, i) => (
          <li key={i} className="flex gap-3 text-sm">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium">
              {i + 1}
            </span>
            <span className="whitespace-pre-wrap">{tweet}</span>
          </li>
        ))}
      </ol>
    );
  }

  if (Array.isArray(value)) {
    return (
      <ul className="space-y-2">
        {(value as string[]).map((item, i) => (
          <li key={i} className="flex gap-2 text-sm">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            <span className="whitespace-pre-wrap">{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
      {value as string}
    </p>
  );
}
