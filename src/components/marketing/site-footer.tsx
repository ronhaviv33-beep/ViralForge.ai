import Link from "next/link";
import { Logo } from "@/components/logo";
import { getT } from "@/lib/i18n-server";

export async function SiteFooter() {
  const t = await getT();
  return (
    <footer className="border-t border-border/60">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:flex-row">
        <div className="flex flex-col items-center gap-2 md:items-start">
          <Logo />
          <p className="text-sm text-muted-foreground">{t("footer.tagline")}</p>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link href="/pricing" className="hover:text-foreground">
            {t("marketing.pricing")}
          </Link>
          <Link href="/login" className="hover:text-foreground">
            {t("marketing.login")}
          </Link>
          <Link href="/signup" className="hover:text-foreground">
            {t("footer.signup")}
          </Link>
        </nav>
        <p className="text-xs text-muted-foreground">
          {t("footer.rights", { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  );
}
