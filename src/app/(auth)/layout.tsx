import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getT } from "@/lib/i18n-server";

// Note: the logged-in → /dashboard redirect lives in the login/signup pages,
// not here — /reset-password and /forgot-password must stay reachable while
// logged in (e.g. when following a reset link from an email).
export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getT();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4">
      <div className="absolute left-1/2 top-1/4 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
      <Link
        href="/"
        className="absolute left-6 top-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground rtl:left-auto rtl:right-6"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t("common.backHome")}
      </Link>
      <div className="absolute right-6 top-6 rtl:left-6 rtl:right-auto">
        <LanguageSwitcher />
      </div>
      <div className="mb-8">
        <Logo />
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
