export const en = {
  common: {
    language: "Language",
    logout: "Log out",
    backHome: "Back home",
    planLabel: "{plan} plan",
    viewAll: "View all",
  },
  nav: {
    overview: "Overview",
    generate: "Generate",
    history: "History",
    analytics: "Analytics",
    creatorAgent: "Creator Agent",
    settings: "Settings",
    admin: "Admin",
  },
  marketing: {
    features: "Features",
    examples: "Examples",
    pricing: "Pricing",
    howItWorks: "How it works",
    dashboard: "Dashboard",
    login: "Log in",
    startFree: "Start Free",
  },
  usage: {
    unlimited: "Unlimited",
    unlimitedHint: "Generate as much as you want this month.",
    remainingOne: "1 generation left this month.",
    remainingMany: "{count} generations left this month.",
    upgradePlan: "Upgrade plan →",
  },
  dashboard: {
    welcome: "Welcome back 👋",
    welcomeName: "Welcome back, {name} 👋",
    subtitle: "Turn your next idea into a full content pack.",
    newGeneration: "New generation",
    recentGenerations: "Recent generations",
    emptyTitle: "No generations yet",
    emptyBody:
      "Paste an idea or transcript and ViralForge will create hooks, captions, threads, hashtags and more.",
    createFirstPack: "Create your first pack",
    stats: {
      generatedThisMonth: "Generated this month",
      unlimitedPlan: "Unlimited plan",
      ofLimitOnPlan: "of {limit} on {plan}",
      creditsRemaining: "Credits remaining",
      resetsMonthStart: "Resets at month start",
      hoursSaved: "Estimated hours saved",
      hoursSavedHint: "≈ 2 hours per content pack",
      mostUsedTone: "Most used tone",
      goToVoice: "Your go-to voice",
      noData: "No data yet",
      mostUsedPlatform: "Most used platform",
      whereYouCreate: "Where you create most",
      totalPacks: "Total content packs",
      allTime: "All time",
    },
  },
  generate: {
    title: "Generate content pack",
    subtitle: "One idea in, a full multi-platform content package out.",
  },
};

/**
 * The English dictionary is the source of truth for the message shape.
 * Every other locale must provide the exact same keys.
 */
export type Messages = typeof en;
