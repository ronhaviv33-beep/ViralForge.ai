"use client";

import * as React from "react";
import {
  createTranslator,
  dirFor,
  DEFAULT_LOCALE,
  type Locale,
  type Translator,
} from "@/lib/i18n";

interface I18nContextValue {
  locale: Locale;
  t: Translator;
}

const I18nContext = React.createContext<I18nContextValue>({
  locale: DEFAULT_LOCALE,
  t: createTranslator(DEFAULT_LOCALE),
});

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const value = React.useMemo<I18nContextValue>(
    () => ({ locale, t: createTranslator(locale) }),
    [locale]
  );

  // Keep <html> lang/dir in sync after client-side locale switches
  // (router.refresh re-renders the root layout, this is a safety net).
  React.useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dirFor(locale);
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  return React.useContext(I18nContext);
}
