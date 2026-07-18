"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/i18n-provider";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const { t } = useI18n();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
        className
      )}
    >
      <LogOut className="h-4 w-4" />
      {t("common.logout")}
    </button>
  );
}
