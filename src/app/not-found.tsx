import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { getT } from "@/lib/i18n-server";

export default async function NotFound() {
  const t = await getT();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <Logo />
      <div>
        <h1 className="text-6xl font-bold gradient-text">404</h1>
        <p className="mt-2 text-muted-foreground">{t("notFound.message")}</p>
      </div>
      <Button asChild>
        <Link href="/">{t("common.backHome")}</Link>
      </Button>
    </div>
  );
}
