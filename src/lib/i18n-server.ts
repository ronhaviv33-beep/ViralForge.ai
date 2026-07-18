import { cookies } from "next/headers";
import {
  LOCALE_COOKIE,
  normalizeLocale,
  createTranslator,
  type Locale,
  type Translator,
} from "@/lib/i18n";

/** Read the active locale from the request cookie. Server components only. */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return normalizeLocale(cookieStore.get(LOCALE_COOKIE)?.value);
}

/** Convenience: translator bound to the request's locale. Server components only. */
export async function getT(): Promise<Translator> {
  return createTranslator(await getLocale());
}
