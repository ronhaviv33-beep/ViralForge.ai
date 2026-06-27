import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Hash,
  Instagram,
  Music2,
  Linkedin,
  Twitter,
  Lightbulb,
  Megaphone,
  Mail,
  FileText,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PricingTable } from "@/components/marketing/pricing-table";
import { TONES, PLATFORMS } from "@/lib/constants";

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI Hooks",
    desc: "10 scroll-stopping hooks engineered to win the first three seconds.",
  },
  {
    icon: Instagram,
    title: "Instagram Captions",
    desc: "Native, emoji-aware captions that drive saves and comments.",
  },
  {
    icon: Music2,
    title: "TikTok Captions",
    desc: "Hook-first short-form captions built for the For You page.",
  },
  {
    icon: Linkedin,
    title: "LinkedIn Posts",
    desc: "Value-dense professional posts that build authority.",
  },
  {
    icon: Twitter,
    title: "X Threads",
    desc: "Tweet-by-tweet threads, each under 280 characters.",
  },
  {
    icon: Hash,
    title: "Hashtags",
    desc: "20 researched hashtags mixing broad reach and niche intent.",
  },
  {
    icon: Lightbulb,
    title: "Content Ideas",
    desc: "10 future content ideas so you never run out of posts.",
  },
  {
    icon: Megaphone,
    title: "5 CTA Options",
    desc: "Conversion-ready calls to action for every goal.",
  },
];

const STEPS = [
  {
    title: "Paste your idea",
    desc: "Drop in an idea, transcript, or any piece of text you want to repurpose.",
  },
  {
    title: "Pick tone & platforms",
    desc: "Choose from 7 tones and target the platforms that matter to you.",
  },
  {
    title: "Generate your pack",
    desc: "Get hooks, captions, threads, hashtags, ideas and more in seconds.",
  },
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
            Powered by AI · One idea → a full content pack
          </Badge>
          <h1 className="max-w-4xl text-balance text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            Turn One Idea Into{" "}
            <span className="gradient-text">30 Days Of Content</span>
          </h1>
          <p className="mt-6 max-w-2xl text-balance text-lg text-muted-foreground sm:text-xl">
            Generate captions, hooks, hashtags, posts and content ideas
            instantly. ViralForge turns a single idea or transcript into a
            complete, copy-paste-ready content package.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="glow-primary">
              <Link href="/signup">
                Start Free <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/pricing">See pricing</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            No credit card required · 3 free generations
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container py-20">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Everything you need to go viral
          </h2>
          <p className="mt-4 text-muted-foreground">
            One generation gives you a full multi-platform content package —
            ready to copy, paste, and post.
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
            <FileText className="h-3.5 w-3.5" /> Blog outline
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1">
            <Sparkles className="h-3.5 w-3.5" /> 5-slide carousel
          </span>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-y border-border/60 bg-card/30 py-20">
        <div className="container">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">
              From idea to content pack in 3 steps
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

      {/* CTA */}
      <section className="container pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 via-card to-accent/10 p-10 text-center md:p-16">
          <div className="absolute left-1/2 top-0 -z-10 h-64 w-96 -translate-x-1/2 rounded-full bg-primary/20 blur-[100px]" />
          <h2 className="text-balance text-3xl font-bold sm:text-4xl">
            Stop staring at a blank page
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Turn your next idea into a month of content. Try ViralForge free —
            no credit card required.
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
              <Check className="h-4 w-4 text-accent" /> All platforms
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
