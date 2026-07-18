import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getT } from "@/lib/i18n-server";

export async function SiteHeader({ isAuthed }: { isAuthed: boolean }) {
  const t = await getT();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <Link href="/#features" className="transition-colors hover:text-foreground">
            {t("marketing.features")}
          </Link>
          <Link href="/#examples" className="transition-colors hover:text-foreground">
            {t("marketing.examples")}
          </Link>
          <Link href="/pricing" className="transition-colors hover:text-foreground">
            {t("marketing.pricing")}
          </Link>
          <Link href="/#how" className="transition-colors hover:text-foreground">
            {t("marketing.howItWorks")}
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          {isAuthed ? (
            <Button asChild>
              <Link href="/dashboard">{t("marketing.dashboard")}</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link href="/login">{t("marketing.login")}</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">{t("marketing.startFree")}</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
