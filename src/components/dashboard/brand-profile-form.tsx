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
import { toneLabel, type MessageKey } from "@/lib/i18n";
import { useI18n } from "@/components/i18n-provider";

const SENTENCE_LENGTHS = ["Short", "Medium", "Long", "Mixed"] as const;
const EMOJI_USAGES = ["None", "Minimal", "Moderate", "Heavy"] as const;
const NONE = "__none__";

// Friendly display text for dropdown options. Saved values stay unchanged so
// existing profiles keep working.
const SENTENCE_LENGTH_KEYS: Record<(typeof SENTENCE_LENGTHS)[number], MessageKey> = {
  Short: "profileForm.sentenceShort",
  Medium: "profileForm.sentenceMedium",
  Long: "profileForm.sentenceLong",
  Mixed: "profileForm.sentenceMixed",
};
const EMOJI_USAGE_KEYS: Record<(typeof EMOJI_USAGES)[number], MessageKey> = {
  None: "profileForm.emojiNone",
  Minimal: "profileForm.emojiMinimal",
  Moderate: "profileForm.emojiModerate",
  Heavy: "profileForm.emojiHeavy",
};

interface Props {
  initialProfile: BrandProfile | null;
}

export function BrandProfileForm({ initialProfile }: Props) {
  const router = useRouter();
  const { t } = useI18n();
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
    const confirmed = window.confirm(t("profileForm.resetConfirm"));
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
    toast.info(t("profileForm.clearedToast"));
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
        toast.error(data.error || t("profileForm.saveFailed"));
        return;
      }
      toast.success(t("profileForm.saved"));
      router.refresh();
    } catch {
      toast.error(t("errors.networkError"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Identity */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold">{t("profileForm.identityTitle")}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("profileForm.identitySubtitle")}
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="brandName">{t("profileForm.brandNameLabel")}</Label>
          <Input
            id="brandName"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value.slice(0, 100))}
            placeholder={t("profileForm.brandNamePlaceholder")}
            disabled={saving}
          />
          <p className="text-xs text-muted-foreground">
            {t("profileForm.brandNameHint")}
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="niche">{t("profileForm.nicheLabel")}</Label>
          <Input
            id="niche"
            value={niche}
            onChange={(e) => setNiche(e.target.value.slice(0, 150))}
            placeholder={t("profileForm.nichePlaceholder")}
            disabled={saving}
          />
          <p className="text-xs text-muted-foreground">
            {t("profileForm.nicheHint")}
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="audience">{t("profileForm.audienceLabel")}</Label>
          <Textarea
            id="audience"
            value={audience}
            onChange={(e) => setAudience(e.target.value.slice(0, 400))}
            placeholder={t("profileForm.audiencePlaceholder")}
            className="min-h-[72px]"
            disabled={saving}
          />
          <p className="text-xs text-muted-foreground">
            {t("profileForm.audienceHint")}
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="goals">{t("profileForm.goalsLabel")}</Label>
          <Textarea
            id="goals"
            value={goals}
            onChange={(e) => setGoals(e.target.value.slice(0, 400))}
            placeholder={t("profileForm.goalsPlaceholder")}
            className="min-h-[72px]"
            disabled={saving}
          />
          <p className="text-xs text-muted-foreground">
            {t("profileForm.goalsHint")}
          </p>
        </div>
      </div>

      {/* Voice */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold">{t("profileForm.voiceTitle")}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("profileForm.voiceSubtitle")}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>{t("profileForm.vibeLabel")}</Label>
            <Select
              value={defaultTone || NONE}
              onValueChange={(v) => setDefaultTone(v === NONE ? "" : v)}
              disabled={saving}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("profileForm.noPreference")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>{t("profileForm.noPreference")}</SelectItem>
                {TONES.map((toneOption) => (
                  <SelectItem key={toneOption} value={toneOption}>
                    {toneLabel(t, toneOption)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("profileForm.sentenceStyleLabel")}</Label>
            <Select
              value={sentenceLength || NONE}
              onValueChange={(v) => setSentenceLength(v === NONE ? "" : v)}
              disabled={saving}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("profileForm.noPreference")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>{t("profileForm.noPreference")}</SelectItem>
                {SENTENCE_LENGTHS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {t(SENTENCE_LENGTH_KEYS[s])}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("profileForm.emojisLabel")}</Label>
            <Select
              value={emojiUsage || NONE}
              onValueChange={(v) => setEmojiUsage(v === NONE ? "" : v)}
              disabled={saving}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("profileForm.noPreference")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>{t("profileForm.noPreference")}</SelectItem>
                {EMOJI_USAGES.map((e) => (
                  <SelectItem key={e} value={e}>
                    {t(EMOJI_USAGE_KEYS[e])}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="ctaStyle">{t("profileForm.ctaLabel")}</Label>
          <Input
            id="ctaStyle"
            value={ctaStyle}
            onChange={(e) => setCtaStyle(e.target.value.slice(0, 150))}
            placeholder={t("profileForm.ctaPlaceholder")}
            disabled={saving}
          />
          <p className="text-xs text-muted-foreground">
            {t("profileForm.ctaHint")}
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="postingStyle">{t("profileForm.postingStyleLabel")}</Label>
          <Input
            id="postingStyle"
            value={postingStyle}
            onChange={(e) => setPostingStyle(e.target.value.slice(0, 200))}
            placeholder={t("profileForm.postingStylePlaceholder")}
            disabled={saving}
          />
        </div>
      </div>

      {/* Signature phrases */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold">{t("profileForm.phrasesTitle")}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("profileForm.phrasesSubtitle")}
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="preferredPhrases">{t("profileForm.preferredLabel")}</Label>
          <Input
            id="preferredPhrases"
            value={preferredPhrases}
            onChange={(e) => setPreferredPhrases(e.target.value)}
            placeholder={t("profileForm.preferredPlaceholder")}
            disabled={saving}
          />
          <p className="text-xs text-muted-foreground">
            {t("profileForm.preferredHint")}
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="bannedPhrases">{t("profileForm.bannedLabel")}</Label>
          <Input
            id="bannedPhrases"
            value={bannedPhrases}
            onChange={(e) => setBannedPhrases(e.target.value)}
            placeholder={t("profileForm.bannedPlaceholder")}
            disabled={saving}
          />
          <p className="text-xs text-muted-foreground">
            {t("profileForm.bannedHint")}
          </p>
        </div>
      </div>

      {/* Example content */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold">{t("profileForm.exampleTitle")}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("profileForm.exampleSubtitle")}
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="examplePosts">{t("profileForm.examplePostsLabel")}</Label>
          <Textarea
            id="examplePosts"
            value={examplePosts}
            onChange={(e) => setExamplePosts(e.target.value.slice(0, 4000))}
            placeholder={t("profileForm.examplePostsPlaceholder")}
            className="min-h-[140px]"
            disabled={saving}
          />
          <p className="text-xs text-muted-foreground">
            {t("profileForm.examplePostsHint")}
          </p>
        </div>
      </div>

      {/* Platforms */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold">
            {t("profileForm.platformsTitle")}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("profileForm.platformsSubtitle")}
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
          <h2 className="text-base font-semibold">{t("profileForm.contentTitle")}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("profileForm.contentSubtitle")}
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="contentPillars">{t("profileForm.pillarsLabel")}</Label>
          <Input
            id="contentPillars"
            value={contentPillars}
            onChange={(e) => setContentPillars(e.target.value)}
            placeholder={t("profileForm.pillarsPlaceholder")}
            disabled={saving}
          />
          <p className="text-xs text-muted-foreground">
            {t("profileForm.pillarsHint")}
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="vocabulary">{t("profileForm.vocabLabel")}</Label>
          <Input
            id="vocabulary"
            value={vocabulary}
            onChange={(e) => setVocabulary(e.target.value)}
            placeholder={t("profileForm.vocabPlaceholder")}
            disabled={saving}
          />
          <p className="text-xs text-muted-foreground">
            {t("profileForm.vocabHint")}
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">{t("profileForm.notesLabel")}</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, 1000))}
            placeholder={t("profileForm.notesPlaceholder")}
            className="min-h-[96px]"
            disabled={saving}
          />
          <p className="text-xs text-muted-foreground">
            {t("profileForm.notesHint")}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="submit" disabled={saving} className="w-full sm:w-auto">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> {t("profileForm.saving")}
            </>
          ) : (
            t("profileForm.save")
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleResetAll}
          disabled={saving}
          className="w-full sm:w-auto text-muted-foreground"
        >
          <Eraser className="h-4 w-4" /> {t("profileForm.resetAll")}
        </Button>
      </div>
    </form>
  );
}
