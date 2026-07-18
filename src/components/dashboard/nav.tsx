"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Sparkles, History, Settings, ShieldCheck, BarChart2, Bot, Plug } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MessageKey } from "@/lib/i18n";
import { useI18n } from "@/components/i18n-provider";

const ITEMS: Array<{
  href: string;
  labelKey: MessageKey;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}> = [
  { href: "/dashboard", labelKey: "nav.overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/generate", labelKey: "nav.generate", icon: Sparkles },
  { href: "/dashboard/history", labelKey: "nav.history", icon: History },
  { href: "/dashboard/analytics", labelKey: "nav.analytics", icon: BarChart2 },
  { href: "/dashboard/creator-agent", labelKey: "nav.creatorAgent", icon: Bot },
  { href: "/dashboard/integrations", labelKey: "nav.integrations", icon: Plug },
  { href: "/settings", labelKey: "nav.settings", icon: Settings },
];

const ADMIN_ITEM: (typeof ITEMS)[number] = {
  href: "/admin",
  labelKey: "nav.admin",
  icon: ShieldCheck,
};

export function DashboardNav({
  onNavigate,
  isAdmin = false,
}: {
  onNavigate?: () => void;
  isAdmin?: boolean;
}) {
  const pathname = usePathname();
  const { t } = useI18n();
  const items = isAdmin ? [...ITEMS, ADMIN_ITEM] : ITEMS;

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {t(item.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
