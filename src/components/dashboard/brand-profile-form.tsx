"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { TONES, PLATFORMS } from "@/lib/constants";
import type { BrandProfile } from "@/lib/brand-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const SENTENCE_LENGTHS = ["Short", "Medium", "Long", "Mixed"] as const;
const EMOJI_USAGES = ["None", "Minimal", "Moderate", "Heavy"] as const;
const NONE = "__none__";

interface Props {
  initialProfile: BrandProfile | null;
}

export function BrandProfileForm({ initialProfile }: Props) {
  const [saving, setSaving] = React.useState(false);

  const [brandName, setBrandName] = React.useState(initialProfile?.brandName ?? "");
  const [audience, setAudience] = React.useState(initialProfile?.audience ?? "");
  const [defaultTone, setDefaultTone] = React.useState(initialProfile?.defaultTone ?? "");
  const [sentenceLength, setSentenceLength] = React.useState(
    initialProfile?.sentenceLength ?? ""
  );
  const [emojiUsage, setEmojiUsage] = React.useState(initialProfile?.emojiUsage ?? "");
  const [ctaStyle, setCtaStyle] = React.useState(initialProfile?.ctaStyle ?? "");
  const [primaryPlatforms, setPrimaryPlatforms] = React.useState<string[]>(
    initialProfile?.primaryPlatforms ?? []
  );
  const [contentPillars, setContentPillars] = React.useState(
    initialProfile?.contentPillars?.join(", ") ?? ""
  );
  const [vocabulary, setVocabulary] = React.useState(
    initialProfile?.vocabulary?.join(", ") ?? ""
  );
  const [notes, setNotes] = React.useState(initialProfile?.notes ?? "");

  function togglePlatform(p: string) {
    setPrimaryPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  }

  function splitCsv(val: string): string[] {
    return val
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/brand-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: brandName || undefined,
          audience: audience || undefined,
          defaultTone: defaultTone || undefined,
          sentenceLength: sentenceLength || undefined,
          emojiUsage: emojiUsage || undefined,
          ctaStyle: ctaStyle || undefined,
          primaryPlatforms,
          contentPillars: splitCsv(contentPillars),
          vocabulary: splitCsv(vocabulary),
          notes: notes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to save brand profile.");
        return;
      }
      toast.success("Brand voice profile saved.");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Identity */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-base font-semibold">Brand Identity</h2>
        <div className="space-y-2">
          <Label htmlFor="brandName">Brand / Creator Name</Label>
          <Input
            id="brandName"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value.slice(0, 100))}
            placeholder="ViralForge, Jane Smith, etc."
            disabled={saving}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="audience">Target Audience</Label>
          <Textarea
            id="audience"
            value={audience}
            onChange={(e) => setAudience(e.target.value.slice(0, 400))}
            placeholder="Tech founders aged 25-45 who want to grow on social media…"
            className="min-h-[72px]"
            disabled={saving}
          />
        </div>
      </div>

      {/* Voice */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-base font-semibold">Voice & Style</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Default Tone</Label>
            <Select
              value={defaultTone || NONE}
              onValueChange={(v) => setDefaultTone(v === NONE ? "" : v)}
              disabled={saving}
            >
              <SelectTrigger>
                <SelectValue placeholder="No preference" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>No preference</SelectItem>
                {TONES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Sentence Length</Label>
            <Select
              value={sentenceLength || NONE}
              onValueChange={(v) => setSentenceLength(v === NONE ? "" : v)}
              disabled={saving}
            >
              <SelectTrigger>
                <SelectValue placeholder="No preference" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>No preference</SelectItem>
                {SENTENCE_LENGTHS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Emoji Usage</Label>
            <Select
              value={emojiUsage || NONE}
              onValueChange={(v) => setEmojiUsage(v === NONE ? "" : v)}
              disabled={saving}
            >
              <SelectTrigger>
                <SelectValue placeholder="No preference" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>No preference</SelectItem>
                {EMOJI_USAGES.map((e) => (
                  <SelectItem key={e} value={e}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="ctaStyle">CTA Style</Label>
          <Input
            id="ctaStyle"
            value={ctaStyle}
            onChange={(e) => setCtaStyle(e.target.value.slice(0, 150))}
            placeholder="e.g. 'Link in bio', 'DM me', 'Drop a comment below'"
            disabled={saving}
          />
        </div>
      </div>

      {/* Platforms */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-base font-semibold">Primary Platforms</h2>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => {
            const active = primaryPlatforms.includes(p);
            return (
              <button
                key={p}
                type="button"
                onClick={() => togglePlatform(p)}
                disabled={saving}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50",
                  active
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                )}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-base font-semibold">Content Strategy</h2>
        <div className="space-y-2">
          <Label htmlFor="contentPillars">Content Pillars</Label>
          <Input
            id="contentPillars"
            value={contentPillars}
            onChange={(e) => setContentPillars(e.target.value)}
            placeholder="Education, Behind the scenes, Product updates (comma-separated)"
            disabled={saving}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vocabulary">Preferred Vocabulary</Label>
          <Input
            id="vocabulary"
            value={vocabulary}
            onChange={(e) => setVocabulary(e.target.value)}
            placeholder="founder, ship it, build in public (comma-separated)"
            disabled={saving}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, 1000))}
            placeholder="Anything else the AI should know about your brand voice…"
            className="min-h-[96px]"
            disabled={saving}
          />
        </div>
      </div>

      <Button type="submit" disabled={saving} className="w-full sm:w-auto">
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Saving…
          </>
        ) : (
          "Save brand voice"
        )}
      </Button>
    </form>
  );
}
