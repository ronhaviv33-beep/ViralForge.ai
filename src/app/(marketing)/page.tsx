import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Hash,
  Lightbulb,
  FileText,
  Check,
  PenLine,
  CalendarDays,
  TrendingUp,
  LayoutGrid,
  XCircle,
  Mail,
  Users,
  Zap,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PricingTable } from "@/components/marketing/pricing-table";
import { TONES, PLATFORMS } from "@/lib/constants";
import { toneLabel, type MessageKey } from "@/lib/i18n";
import { getT } from "@/lib/i18n-server";

const FEATURES: Array<{
  icon: React.ComponentType<{ className?: string }>;
  titleKey: MessageKey;
  descKey: MessageKey;
}> = [
  { icon: Lightbulb, titleKey: "landing.feature1Title", descKey: "landing.feature1Desc" },
  { icon: FileText, titleKey: "landing.feature2Title", descKey: "landing.feature2Desc" },
  { icon: Sparkles, titleKey: "landing.feature3Title", descKey: "landing.feature3Desc" },
  { icon: PenLine, titleKey: "landing.feature4Title", descKey: "landing.feature4Desc" },
  { icon: CalendarDays, titleKey: "landing.feature5Title", descKey: "landing.feature5Desc" },
  { icon: TrendingUp, titleKey: "landing.feature6Title", descKey: "landing.feature6Desc" },
  { icon: LayoutGrid, titleKey: "landing.feature7Title", descKey: "landing.feature7Desc" },
];

const STEPS: Array<{ titleKey: MessageKey; descKey: MessageKey }> = [
  { titleKey: "landing.step1Title", descKey: "landing.step1Desc" },
  { titleKey: "landing.step2Title", descKey: "landing.step2Desc" },
  { titleKey: "landing.step3Title", descKey: "landing.step3Desc" },
];

const PAIN_POINTS: MessageKey[] = [
  "landing.pain1",
  "landing.pain2",
  "landing.pain3",
  "landing.pain4",
];

export default async function LandingPage() {
  const t = await getT();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute left-1/2 top-0 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
        <div className="container relative flex flex-col items-center py-24 text-center md:py-32">
          <Badge variant="outline" className="mb-6 gap-1.5 py-1.5">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            {t("landing.badge")}
          </Badge>
          <h1 className="max-w-4xl text-balance text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            {t("landing.heroTitle1")}{" "}
            <span className="gradient-text">{t("landing.heroTitle2")}</span>
          </h1>
          <p className="mt-6 max-w-2xl text-balance text-lg text-muted-foreground sm:text-xl">
            {t("landing.heroSubtitle")}
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="glow-primary">
              <Link href="/signup">
                {t("marketing.startFree")} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/#examples">{t("landing.seeExamples")}</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {t("landing.heroNote")}
          </p>
        </div>
      </section>

      {/* Problem */}
      <section className="border-y border-border/60 bg-card/30 py-20">
        <div className="container">
          <div className="mx-auto grid max-w-4xl items-center gap-12 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold sm:text-4xl">
                {t("landing.problemTitle1")}{" "}
                <span className="gradient-text">{t("landing.problemTitle2")}</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                {t("landing.problemSubtitle")}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {PAIN_POINTS.map((pointKey) => (
                <div
                  key={pointKey}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
                >
                  <XCircle className="h-4 w-4 shrink-0 text-destructive/70" />
                  <span className="text-sm font-medium">{t(pointKey)}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-10 text-center text-sm font-medium text-muted-foreground">
            {t("landing.problemFooter1")}{" "}
            <span className="text-accent">{t("landing.problemFooter2")}</span>
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container py-20">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            {t("landing.featuresTitle")}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {t("landing.featuresSubtitle")}
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.titleKey}
              className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">{t(feature.titleKey)}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t(feature.descKey)}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            {t("landing.alsoIncludes")}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1">
            <Mail className="h-3.5 w-3.5" /> {t("landing.newsletterDraft")}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1">
            <Hash className="h-3.5 w-3.5" /> {t("landing.hashtagSet")}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1">
            <Sparkles className="h-3.5 w-3.5" /> {t("landing.blogOutline")}
          </span>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-y border-border/60 bg-card/30 py-20">
        <div className="container">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">
              {t("landing.howTitle")}
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <div
                key={step.titleKey}
                className="relative rounded-xl border border-border bg-card p-6"
              >
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {i + 1}
                </div>
                <h3 className="font-semibold">{t(step.titleKey)}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t(step.descKey)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
            {TONES.map((tone) => (
              <span
                key={tone}
                className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground"
              >
                {toneLabel(t, tone)}
              </span>
            ))}
            <span className="mx-2 text-border">|</span>
            {PLATFORMS.map((platform) => (
              <span
                key={platform}
                className="rounded-full border border-accent/30 bg-accent/5 px-3 py-1 text-xs text-accent"
              >
                {platform}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Examples */}
      <section id="examples" className="container py-20">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            {t("landing.examplesTitle")}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {t("landing.examplesSubtitle")}
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
          {/* Input */}
          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t("landing.yourIdea")}
              </p>
              <p className="rounded-lg border border-border/60 bg-background/60 p-4 text-sm italic leading-relaxed text-muted-foreground">
                {t("landing.exampleIdea")}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
                  {t("landing.exampleTone")}
                </span>
                <span className="rounded-full border border-accent/30 bg-accent/5 px-2.5 py-1 text-xs text-accent">
                  Instagram
                </span>
                <span className="rounded-full border border-accent/30 bg-accent/5 px-2.5 py-1 text-xs text-accent">
                  TikTok
                </span>
                <span className="rounded-full border border-accent/30 bg-accent/5 px-2.5 py-1 text-xs text-accent">
                  X
                </span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <ArrowRight className="h-4 w-4 text-primary rtl:rotate-180" />
              <span>{t("landing.generatedInSeconds")}</span>
            </div>
          </div>

          {/* Outputs */}
          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">
                {t("landing.exampleHookLabel")}
              </p>
              <p className="text-sm leading-relaxed">{t("landing.exampleHook")}</p>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-accent">
                {t("landing.exampleIgLabel")}
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t("landing.exampleIg")}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("landing.exampleXLabel")}
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t("landing.exampleX")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="border-y border-border/60 bg-card/30 py-16">
        <div className="container">
          <p className="mb-10 text-center text-lg font-semibold">
            {t("landing.socialProofTitle")}
          </p>
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-10 sm:flex-row sm:justify-around">
            {(
              [
                { icon: Users, stat: "500+", labelKey: "landing.stat1Label" },
                { icon: Zap, stat: "10,000+", labelKey: "landing.stat2Label" },
                {
                  icon: Clock,
                  stat: t("landing.stat3Value"),
                  labelKey: "landing.stat3Label",
                },
              ] as Array<{
                icon: React.ComponentType<{ className?: string }>;
                stat: string;
                labelKey: MessageKey;
              }>
            ).map(({ icon: Icon, stat, labelKey }) => (
              <div
                key={labelKey}
                className="flex flex-col items-center gap-1 text-center"
              >
                <Icon className="mb-1 h-5 w-5 text-primary" />
                <span className="text-3xl font-bold">{stat}</span>
                <span className="text-sm text-muted-foreground">
                  {t(labelKey)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container py-20">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            {t("landing.pricingTitle")}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {t("landing.pricingSubtitle")}
          </p>
        </div>
        <PricingTable authed={false} />
      </section>

      {/* Final CTA */}
      <section className="container pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 via-card to-accent/10 p-10 text-center md:p-16">
          <div className="absolute left-1/2 top-0 -z-10 h-64 w-96 -translate-x-1/2 rounded-full bg-primary/20 blur-[100px]" />
          <h2 className="text-balance text-3xl font-bold sm:text-4xl">
            {t("landing.ctaTitle")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            {t("landing.ctaSubtitle")}
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button asChild size="lg" className="glow-primary">
              <Link href="/signup">
                {t("marketing.startFree")} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </Button>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4 text-accent" /> {t("landing.ctaCheck1")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4 text-accent" /> {t("landing.ctaCheck2")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4 text-accent" /> {t("landing.ctaCheck3")}
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
