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

const FEATURES = [
  {
    icon: Lightbulb,
    title: "Viral Idea Generator",
    desc: "10 fresh content angles from a single topic so you never run out of ideas.",
  },
  {
    icon: FileText,
    title: "Script Generator",
    desc: "Full short-form scripts structured to hook, hold and convert.",
  },
  {
    icon: Sparkles,
    title: "Hook Generator",
    desc: "10 scroll-stopping opening lines engineered to win the first 3 seconds.",
  },
  {
    icon: PenLine,
    title: "Caption Writer",
    desc: "Platform-native captions for Instagram and TikTok, emoji-aware.",
  },
  {
    icon: CalendarDays,
    title: "Content Calendar",
    desc: "A 30-day posting plan built around your generated content.",
  },
  {
    icon: TrendingUp,
    title: "Viral Frameworks",
    desc: "Proven formats (storytelling, listicle, controversy, how-to) applied to your idea.",
  },
  {
    icon: LayoutGrid,
    title: "Carousel Creator",
    desc: "5-slide carousel scripts ready to turn into visuals.",
  },
];

const STEPS = [
  {
    title: "Drop in your idea",
    desc: "Paste any idea, topic, or transcript — even a rough thought works.",
  },
  {
    title: "Choose your style",
    desc: "Pick your tone (casual, bold, educational…) and the platforms you post on.",
  },
  {
    title: "Get your content kit",
    desc: "Hooks, scripts, captions, threads, hashtags and more — all in one click.",
  },
];

const PAIN_POINTS = [
  "Thinking of ideas",
  "Writing captions",
  "Planning content",
  "Staying consistent",
];

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute left-1/2 top-0 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
        <div className="container relative flex flex-col items-center py-24 text-center md:py-32">
          <Badge variant="outline" className="mb-6 gap-1.5 py-1.5">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            AI content engine built for creators who want to grow faster
          </Badge>
          <h1 className="max-w-4xl text-balance text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            Create content faster.{" "}
            <span className="gradient-text">Grow your audience smarter.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-balance text-lg text-muted-foreground sm:text-xl">
            ViralForge helps creators generate ideas, scripts, hooks and viral
            content workflows in seconds.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="glow-primary">
              <Link href="/signup">
                Start Free <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/#examples">See Examples</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            No credit card required · 3 free generations
          </p>
        </div>
      </section>

      {/* Problem */}
      <section className="border-y border-border/60 bg-card/30 py-20">
        <div className="container">
          <div className="mx-auto grid max-w-4xl items-center gap-12 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold sm:text-4xl">
                Creators spend hours on things that should take{" "}
                <span className="gradient-text">seconds.</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                Every week, creators lose hours to the content grind. ViralForge
                handles it all — so you can focus on growing.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {PAIN_POINTS.map((point) => (
                <div
                  key={point}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
                >
                  <XCircle className="h-4 w-4 shrink-0 text-destructive/70" />
                  <span className="text-sm font-medium">{point}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-10 text-center text-sm font-medium text-muted-foreground">
            ViralForge does all of it —{" "}
            <span className="text-accent">in one click.</span>
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container py-20">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Everything a creator needs to grow
          </h2>
          <p className="mt-4 text-muted-foreground">
            One generation gives you a complete content kit — ready to post
            across every platform.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Also includes:</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1">
            <Mail className="h-3.5 w-3.5" /> Newsletter draft
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1">
            <Hash className="h-3.5 w-3.5" /> Hashtag set
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1">
            <Sparkles className="h-3.5 w-3.5" /> Blog outline
          </span>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-y border-border/60 bg-card/30 py-20">
        <div className="container">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">
              From idea to content kit in under 60 seconds
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                className="relative rounded-xl border border-border bg-card p-6"
              >
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {i + 1}
                </div>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {step.desc}
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
                {tone}
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
            See what ViralForge generates
          </h2>
          <p className="mt-4 text-muted-foreground">
            One idea. Seconds. A full content kit.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
          {/* Input */}
          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Your idea
              </p>
              <p className="rounded-lg border border-border/60 bg-background/60 p-4 text-sm italic leading-relaxed text-muted-foreground">
                &ldquo;How I went from 0 to 10k followers in 90 days by staying
                consistent and posting every single day&rdquo;
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
                  Tone: Motivational
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
              <ArrowRight className="h-4 w-4 text-primary" />
              <span>Generated in seconds</span>
            </div>
          </div>

          {/* Outputs */}
          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">
                Hook
              </p>
              <p className="text-sm leading-relaxed">
                &ldquo;I had zero followers 90 days ago. Here&apos;s exactly
                what I did to hit 10k — and why most people quit before they
                see results.&rdquo;
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-accent">
                Instagram Caption
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                90 days. 0 to 10k. No viral moment — just consistency. 🔥
                Here&apos;s what nobody tells you about growing on
                Instagram... [save this]
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                X Thread Opener
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                I grew from 0 to 10k followers in 90 days. No paid ads. No
                viral moment. Just this system: 🧵
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="border-y border-border/60 bg-card/30 py-16">
        <div className="container">
          <p className="mb-10 text-center text-lg font-semibold">
            Join creators building content faster with AI
          </p>
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-10 sm:flex-row sm:justify-around">
            {(
              [
                { icon: Users, stat: "500+", label: "Creators using ViralForge" },
                { icon: Zap, stat: "10,000+", label: "Content pieces generated" },
                { icon: Clock, stat: "2 hrs", label: "Saved per content pack" },
              ] as const
            ).map(({ icon: Icon, stat, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1 text-center"
              >
                <Icon className="mb-1 h-5 w-5 text-primary" />
                <span className="text-3xl font-bold">{stat}</span>
                <span className="text-sm text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container py-20">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-muted-foreground">
            Start free. Upgrade when you&apos;re ready to scale your content.
          </p>
        </div>
        <PricingTable authed={false} />
      </section>

      {/* Final CTA */}
      <section className="container pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 via-card to-accent/10 p-10 text-center md:p-16">
          <div className="absolute left-1/2 top-0 -z-10 h-64 w-96 -translate-x-1/2 rounded-full bg-primary/20 blur-[100px]" />
          <h2 className="text-balance text-3xl font-bold sm:text-4xl">
            Your next 30 days of content starts here
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Stop overthinking. Drop your idea and let ViralForge build your
            content kit in seconds.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button asChild size="lg" className="glow-primary">
              <Link href="/signup">
                Start Free <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4 text-accent" /> 3 free generations
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4 text-accent" /> No credit card required
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4 text-accent" /> Cancel anytime
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
