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
