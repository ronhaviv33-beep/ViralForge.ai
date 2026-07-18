"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Eraser } from "lucide-react";
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

// Friendly display text for dropdown options. Saved values stay unchanged so
// existing profiles keep working.
const SENTENCE_LENGTH_LABELS: Record<(typeof SENTENCE_LENGTHS)[number], string> = {
  Short: "Short & punchy",
  Medium: "Medium — a bit of both",
  Long: "Long — storytelling style",
  Mixed: "Mixed — varies by post",
};
const EMOJI_USAGE_LABELS: Record<(typeof EMOJI_USAGES)[number], string> = {
  None: "No emojis",
  Minimal: "A few here and there",
  Moderate: "A moderate amount",
  Heavy: "Lots of emojis 🎉",
};

interface Props {
  initialProfile: BrandProfile | null;
}

export function BrandProfileForm({ initialProfile }: Props) {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);

  const [brandName, setBrandName] = React.useState(initialProfile?.brandName ?? "");
  const [niche, setNiche] = React.useState(initialProfile?.niche ?? "");
  const [audience, setAudience] = React.useState(initialProfile?.audience ?? "");
  const [goals, setGoals] = React.useState(initialProfile?.goals ?? "");
  const [defaultTone, setDefaultTone] = React.useState(initialProfile?.defaultTone ?? "");
  const [sentenceLength, setSentenceLength] = React.useState(
    initialProfile?.sentenceLength ?? ""
  );
  const [emojiUsage, setEmojiUsage] = React.useState(initialProfile?.emojiUsage ?? "");
  const [ctaStyle, setCtaStyle] = React.useState(initialProfile?.ctaStyle ?? "");
  const [postingStyle, setPostingStyle] = React.useState(
    initialProfile?.postingStyle ?? ""
  );
  const [primaryPlatforms, setPrimaryPlatforms] = React.useState<string[]>(
    initialProfile?.primaryPlatforms ?? []
  );
  const [contentPillars, setContentPillars] = React.useState(
    initialProfile?.contentPillars?.join(", ") ?? ""
  );
  const [vocabulary, setVocabulary] = React.useState(
    initialProfile?.vocabulary?.join(", ") ?? ""
  );
  const [preferredPhrases, setPreferredPhrases] = React.useState(
    initialProfile?.preferredPhrases?.join(", ") ?? ""
  );
  const [bannedPhrases, setBannedPhrases] = React.useState(
    initialProfile?.bannedPhrases?.join(", ") ?? ""
  );
  const [examplePosts, setExamplePosts] = React.useState(
    initialProfile?.examplePosts ?? ""
  );
  const [notes, setNotes] = React.useState(initialProfile?.notes ?? "");

  function togglePlatform(p: string) {
    setPrimaryPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  }

  function handleResetAll() {
    const confirmed = window.confirm(
      "Clear all Creator Agent fields? This empties the form — nothing is deleted until you click Save."
    );
    if (!confirmed) return;
    setBrandName("");
    setNiche("");
    setAudience("");
    setGoals("");
    setDefaultTone("");
    setSentenceLength("");
    setEmojiUsage("");
    setCtaStyle("");
    setPostingStyle("");
    setPrimaryPlatforms([]);
    setContentPillars("");
    setVocabulary("");
    setPreferredPhrases("");
    setBannedPhrases("");
    setExamplePosts("");
    setNotes("");
    toast.info("All fields cleared. Click “Save Creator Agent” to make it permanent.");
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
          niche: niche || undefined,
          audience: audience || undefined,
          goals: goals || undefined,
          defaultTone: defaultTone || undefined,
          sentenceLength: sentenceLength || undefined,
          emojiUsage: emojiUsage || undefined,
          ctaStyle: ctaStyle || undefined,
          postingStyle: postingStyle || undefined,
          primaryPlatforms,
          contentPillars: splitCsv(contentPillars),
          vocabulary: splitCsv(vocabulary),
          preferredPhrases: splitCsv(preferredPhrases),
          bannedPhrases: splitCsv(bannedPhrases),
          examplePosts: examplePosts || undefined,
          notes: notes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to save your Creator Agent.");
        return;
      }
      toast.success("Your Creator Agent has been updated.");
      router.refresh();
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
        <div>
          <h2 className="text-base font-semibold">Who are you?</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            The basics — who&apos;s talking, and who&apos;s listening.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="brandName">Your name or brand name</Label>
          <Input
            id="brandName"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value.slice(0, 100))}
            placeholder="e.g. ViralForge, Jane Smith"
            disabled={saving}
          />
          <p className="text-xs text-muted-foreground">
            The name you go by online.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="niche">What&apos;s your niche?</Label>
          <Input
            id="niche"
            value={niche}
            onChange={(e) => setNiche(e.target.value.slice(0, 150))}
            placeholder="e.g. Fitness for busy parents, No-code app building"
            disabled={saving}
          />
          <p className="text-xs text-muted-foreground">
            The corner of the internet you want to own.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="audience">Who is your content for?</Label>
          <Textarea
            id="audience"
            value={audience}
            onChange={(e) => setAudience(e.target.value.slice(0, 400))}
            placeholder="e.g. New freelancers who want to get more clients from Instagram"
            className="min-h-[72px]"
            disabled={saving}
          />
          <p className="text-xs text-muted-foreground">
            Describe your followers like you&apos;d describe them to a friend. Who are
            they and what do they want?
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="goals">What do you want to be known for?</Label>
          <Textarea
            id="goals"
            value={goals}
            onChange={(e) => setGoals(e.target.value.slice(0, 400))}
            placeholder="e.g. The person who makes personal finance actually simple"
            className="min-h-[72px]"
            disabled={saving}
          />
          <p className="text-xs text-muted-foreground">
            Your agent keeps your content pointed at this goal.
          </p>
        </div>
      </div>

      {/* Voice */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold">How do you sound?</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Your writing style — the AI will copy it.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Your usual vibe</Label>
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
            <Label>Sentence style</Label>
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
                    {SENTENCE_LENGTH_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Emojis</Label>
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
                    {EMOJI_USAGE_LABELS[e]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="ctaStyle">How do you end your posts?</Label>
          <Input
            id="ctaStyle"
            value={ctaStyle}
            onChange={(e) => setCtaStyle(e.target.value.slice(0, 150))}
            placeholder="e.g. 'Follow for more', 'Link in bio', 'Drop a comment below'"
            disabled={saving}
          />
          <p className="text-xs text-muted-foreground">
            The line you usually use to ask people to follow, comment, or click.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="postingStyle">
            How would you describe your posting style?
          </Label>
          <Input
            id="postingStyle"
            value={postingStyle}
            onChange={(e) => setPostingStyle(e.target.value.slice(0, 200))}
            placeholder="e.g. Short daily tips with one personal story per week"
            disabled={saving}
          />
        </div>
      </div>

      {/* Signature phrases */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold">Your signature phrases</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Words to lean into — and words that should never appear.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="preferredPhrases">Phrases that sound like you</Label>
          <Input
            id="preferredPhrases"
            value={preferredPhrases}
            onChange={(e) => setPreferredPhrases(e.target.value)}
            placeholder="e.g. let's be real, small steps big wins"
            disabled={saving}
          />
          <p className="text-xs text-muted-foreground">
            Your agent will work these in naturally. Separate with commas.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="bannedPhrases">Phrases to never use</Label>
          <Input
            id="bannedPhrases"
            value={bannedPhrases}
            onChange={(e) => setBannedPhrases(e.target.value)}
            placeholder="e.g. game changer, crushing it, hustle"
            disabled={saving}
          />
          <p className="text-xs text-muted-foreground">
            Words that make you cringe — your agent will avoid them. Separate with
            commas.
          </p>
        </div>
      </div>

      {/* Example content */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold">Show it your work</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            The fastest way to teach your agent — let it study your best posts.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="examplePosts">Paste 1–3 posts you&apos;re proud of</Label>
          <Textarea
            id="examplePosts"
            value={examplePosts}
            onChange={(e) => setExamplePosts(e.target.value.slice(0, 4000))}
            placeholder={"Paste a caption, post, or script that really sounds like you.\n\nSeparate multiple examples with a blank line."}
            className="min-h-[140px]"
            disabled={saving}
          />
          <p className="text-xs text-muted-foreground">
            Your agent studies these to match your rhythm, humor, and word choice.
          </p>
        </div>
      </div>

      {/* Platforms */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold">Where do you post the most?</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Tap the ones you actually use — the AI will focus on them.
          </p>
        </div>
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
        <div>
          <h2 className="text-base font-semibold">What do you talk about?</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Your topics and the words that sound like you.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="contentPillars">Your main topics</Label>
          <Input
            id="contentPillars"
            value={contentPillars}
            onChange={(e) => setContentPillars(e.target.value)}
            placeholder="e.g. Fitness tips, My daily routine, Client stories"
            disabled={saving}
          />
          <p className="text-xs text-muted-foreground">
            The 3–5 subjects you keep coming back to. Separate them with commas.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="vocabulary">Words & phrases you love using</Label>
          <Input
            id="vocabulary"
            value={vocabulary}
            onChange={(e) => setVocabulary(e.target.value)}
            placeholder="e.g. let's go, game changer, no fluff"
            disabled={saving}
          />
          <p className="text-xs text-muted-foreground">
            Your signature expressions — the AI will sprinkle them in naturally.
            Separate them with commas.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Anything else?</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, 1000))}
            placeholder="e.g. Never use hard-sell language. I always write in first person. Keep it positive."
            className="min-h-[96px]"
            disabled={saving}
          />
          <p className="text-xs text-muted-foreground">
            Imagine you hired someone to write your posts — what would you tell them
            on day one?
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="submit" disabled={saving} className="w-full sm:w-auto">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving…
            </>
          ) : (
            "Save Creator Agent"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleResetAll}
          disabled={saving}
          className="w-full sm:w-auto text-muted-foreground"
        >
          <Eraser className="h-4 w-4" /> Reset all fields
        </Button>
      </div>
    </form>
  );
}
