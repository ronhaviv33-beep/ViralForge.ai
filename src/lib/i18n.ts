import { en, type Messages } from "@/messages/en";
import { he } from "@/messages/he";

export type { Messages };

export const LOCALES = ["en", "he"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Cookie that persists the user's language choice (same naming family as vf_session). */
export const LOCALE_COOKIE = "vf_locale";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "EN",
  he: "עברית",
};

const DICTIONARIES: Record<Locale, Messages> = { en, he };

/** Dot-separated paths of every string in the dictionary, e.g. "nav.overview". */
type DotPaths<T> = {
  [K in keyof T & string]: T[K] extends string ? K : `${K}.${DotPaths<T[K]>}`;
}[keyof T & string];

export type MessageKey = DotPaths<Messages>;

export type Translator = (
  key: MessageKey,
  params?: Record<string, string | number>
) => string;

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** Coerce any raw value (cookie, header, etc.) into a supported locale. */
export function normalizeLocale(value: string | undefined | null): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function dirFor(locale: Locale): "ltr" | "rtl" {
  return locale === "he" ? "rtl" : "ltr";
}

export function getDictionary(locale: Locale): Messages {
  return DICTIONARIES[locale];
}

function lookup(dict: Messages, key: string): string | undefined {
  let node: unknown = dict;
  for (const part of key.split(".")) {
    if (typeof node !== "object" || node === null) return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === "string" ? node : undefined;
}

/** BCP 47 locale string for date/number formatting. */
export function dateLocale(locale: Locale): string {
  return locale === "he" ? "he-IL" : "en-US";
}

/**
 * Resolve the language for AI-generated content.
 * Precedence: an explicit user choice (form selection or the value stored on
 * the generation) wins; anything missing/invalid falls back to the UI locale.
 * This is the single place that decides generation language — keep it that way.
 */
export function resolveContentLocale(
  explicit: string | null | undefined,
  uiLocale: Locale
): Locale {
  return isLocale(explicit) ? explicit : uiLocale;
}

/**
 * Stored tone values are English (they live in the database and prompts).
 * This maps a stored tone to its translated display label; unknown values
 * fall back to the raw string.
 */
const TONE_KEYS: Record<string, MessageKey> = {
  Professional: "tones.professional",
  Educational: "tones.educational",
  Funny: "tones.funny",
  Founder: "tones.founder",
  Storytelling: "tones.storytelling",
  Sales: "tones.sales",
  Casual: "tones.casual",
};

export function toneLabel(t: Translator, tone: string): string {
  const key = TONE_KEYS[tone];
  return key ? t(key) : tone;
}

/**
 * Build a translate function for a locale. Missing keys fall back to English,
 * then to the key itself, so a partial dictionary can never crash the UI.
 */
export function createTranslator(locale: Locale): Translator {
  const dict = DICTIONARIES[locale];
  return (key, params) => {
    let value = lookup(dict, key) ?? lookup(en, key) ?? key;
    if (params) {
      for (const [name, replacement] of Object.entries(params)) {
        value = value.split(`{${name}}`).join(String(replacement));
      }
    }
    return value;
  };
}
