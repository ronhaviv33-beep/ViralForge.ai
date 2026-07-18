"use client";

import * as React from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { DashboardNav } from "@/components/dashboard/nav";
import { LogoutButton } from "@/components/dashboard/logout-button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18n } from "@/components/i18n-provider";

export function MobileNav({
  planLabel,
  isAdmin = false,
}: {
  planLabel: string;
  isAdmin?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const { t } = useI18n();

  return (
    <div className="md:hidden">
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        <Logo href="/dashboard" />
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-b border-border bg-card p-4">
          <div className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">
            {t("common.planLabel", { plan: planLabel })}
          </div>
          <DashboardNav onNavigate={() => setOpen(false)} isAdmin={isAdmin} />
          <div className="mt-3 border-t border-border pt-3">
            <LogoutButton />
          </div>
        </div>
      )}
    </div>
  );
}
