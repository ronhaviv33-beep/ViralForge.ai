"use client";

import * as React from "react";
import { Download, FileText, FileType } from "lucide-react";
import { toast } from "sonner";
import type { ContentPack } from "@/lib/content-types";
import { SECTIONS } from "@/lib/content-types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/copy-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  packToText,
  packToMarkdown,
  sectionToText,
  downloadFile,
  slugify,
} from "@/lib/export";

interface ContentPackViewProps {
  pack: ContentPack;
  title?: string;
  /** Selected platforms. Sections for unselected platforms are hidden. */
  platforms?: string[];
}

export function ContentPackView({ pack, title, platforms }: ContentPackViewProps) {
  const visibleSections = React.useMemo(
    () =>
      SECTIONS.filter((s) => {
        if (s.platform) {
          // Platform-specific section: only show when that platform was selected
          // and the AI actually produced the field.
          return (
            (!platforms || platforms.includes(s.platform)) &&
            pack[s.key] !== undefined
          );
        }
        return true; // universal sections always shown
      }),
    [pack, platforms]
  );

  const allText = React.useMemo(() => packToText(pack, title), [pack, title]);

  function handleExport(format: "txt" | "md") {
    const base = slugify(title ?? "content-pack");
    if (format === "txt") {
      downloadFile(`${base}.txt`, packToText(pack, title), "text/plain");
    } else {
      downloadFile(`${base}.md`, packToMarkdown(pack, title), "text/markdown");
    }
    toast.success(`Exported as .${format}`);
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/60 p-4">
        <div>
          <p className="text-sm font-medium">Your content pack is ready</p>
          <p className="text-xs text-muted-foreground">
            {visibleSections.length} sections · copy any block or export the whole pack
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CopyButton
            value={allText}
            label="Copy all"
            variant="secondary"
            size="default"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("txt")}>
                <FileText className="h-4 w-4" /> Export as .txt
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("md")}>
                <FileType className="h-4 w-4" /> Export as .md
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Sections */}
      <div className="grid gap-5 lg:grid-cols-2">
        {visibleSections.map((section) => (
          <Card key={section.key} className="flex flex-col">
            <CardHeader className="flex-row items-start justify-between gap-3 space-y-0 pb-3">
              <div>
                <h3 className="font-semibold">{section.label}</h3>
                <p className="text-xs text-muted-foreground">
                  {section.description}
                </p>
              </div>
              <CopyButton value={sectionToText(section.key, pack)} />
            </CardHeader>
            <CardContent className="flex-1">
              <SectionBody section={section.key} pack={pack} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SectionBody({
  section,
  pack,
}: {
  section: keyof ContentPack;
  pack: ContentPack;
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
              <Badge variant="secondary">Slide {slide.slide}</Badge>
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
