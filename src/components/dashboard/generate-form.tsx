"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Sparkles, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { TONES, PLATFORMS, MAX_INPUT_CHARS, MIN_INPUT_CHARS } from "@/lib/constants";
import type { ContentPack } from "@/lib/content-types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ContentPackView } from "@/components/content-pack-view";
import { cn } from "@/lib/utils";
import { toneLabel } from "@/lib/i18n";
import { useI18n } from "@/components/i18n-provider";

export function GenerateForm({ canGenerate }: { canGenerate: boolean }) {
  const router = useRouter();
  const { t } = useI18n();
  const [text, setText] = React.useState("");
  const [tone, setTone] = React.useState<(typeof TONES)[number]>("Founder");
  const [platforms, setPlatforms] = React.useState<string[]>([
    "Instagram",
    "LinkedIn",
    "X / Twitter",
  ]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<{
    id: string;
    pack: ContentPack;
    title: string;
    platforms: string[];
  } | null>(null);

  function togglePlatform(p: string) {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  }

  async function handleGenerate() {
    setError(null);

    if (text.trim().length < MIN_INPUT_CHARS) {
      setError(t("generateForm.minInput", { min: MIN_INPUT_CHARS }));
      return;
    }
    if (platforms.length === 0) {
      setError(t("generateForm.selectPlatform"));
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), tone, platforms }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("errors.somethingWentWrong"));
        if (data.code === "LIMIT_REACHED") {
          toast.error(t("generateForm.limitToast"));
        }
        return;
      }
      setResult({ id: data.id, pack: data.output, title: text.trim().slice(0, 60), platforms });
      toast.success(t("generateForm.generated"));
      router.refresh(); // refresh usage meter
    } catch {
      setError(t("errors.networkError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border bg-card p-6">
        {!canGenerate && (
          <div className="mb-5 flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <div>
              <p className="font-medium text-destructive">
                {t("generateForm.limitTitle")}
              </p>
              <p className="mt-1 text-muted-foreground">
                <Link href="/pricing" className="text-primary hover:underline">
                  {t("generateForm.upgradeYourPlan")}
                </Link>{" "}
                {t("generateForm.limitBody")}
              </p>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="input">{t("generateForm.inputLabel")}</Label>
            <button
              type="button"
              onClick={() => setText(t("generateForm.exampleText"))}
              className="text-xs text-primary hover:underline"
            >
              {t("generateForm.useExample")}
            </button>
          </div>
          <Textarea
            id="input"
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_INPUT_CHARS))}
            placeholder={t("generateForm.inputPlaceholder")}
            className="min-h-[160px]"
            disabled={loading}
          />
          <div className="flex justify-end text-xs text-muted-foreground">
            {text.length}/{MAX_INPUT_CHARS}
          </div>
        </div>

        {/* Tone */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t("generateForm.toneLabel")}</Label>
            <Select
              value={tone}
              onValueChange={(v) => setTone(v as (typeof TONES)[number])}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("generateForm.selectTone")} />
              </SelectTrigger>
              <SelectContent>
                {TONES.map((toneOption) => (
                  <SelectItem key={toneOption} value={toneOption}>
                    {toneLabel(t, toneOption)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Platforms */}
        <div className="mt-4 space-y-2">
          <Label>{t("generateForm.platformsLabel")}</Label>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => {
              const active = platforms.includes(p);
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePlatform(p)}
                  disabled={loading}
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

        {error && (
          <p className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" /> {error}
          </p>
        )}

        <Button
          onClick={handleGenerate}
          disabled={loading || !canGenerate}
          size="lg"
          className="mt-6 w-full glow-primary"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> {t("generateForm.generating")}
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" /> {t("generateForm.generateCta")}
            </>
          )}
        </Button>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid gap-5 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-xl border border-border bg-card/50"
            />
          ))}
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="animate-fade-up">
          <ContentPackView pack={result.pack} title={result.title} platforms={result.platforms} generationId={result.id} />
        </div>
      )}
    </div>
  );
}
