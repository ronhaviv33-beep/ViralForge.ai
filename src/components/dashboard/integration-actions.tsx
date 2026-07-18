"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw, Unplug } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/i18n-provider";

export function SyncAccountButton({ accountId }: { accountId: string }) {
  const router = useRouter();
  const { t } = useI18n();
  const [loading, setLoading] = React.useState(false);

  async function handleSync() {
    setLoading(true);
    try {
      const res = await fetch(`/api/integrations/accounts/${accountId}/sync`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || t("integrations.syncFailed"));
        return;
      }
      toast.success(t("integrations.syncedOk"));
      router.refresh();
    } catch {
      toast.error(t("errors.networkError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size="sm" variant="secondary" onClick={handleSync} disabled={loading}>
      {loading ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> {t("integrations.syncing")}
        </>
      ) : (
        <>
          <RefreshCw className="h-3.5 w-3.5" /> {t("integrations.syncNow")}
        </>
      )}
    </Button>
  );
}

export function DisconnectAccountButton({ accountId }: { accountId: string }) {
  const router = useRouter();
  const { t } = useI18n();
  const [loading, setLoading] = React.useState(false);

  async function handleDisconnect() {
    if (!window.confirm(t("integrations.disconnectConfirm"))) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/integrations/accounts/${accountId}/disconnect`,
        { method: "POST" }
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || t("errors.somethingWentWrong"));
        return;
      }
      toast.success(t("integrations.disconnected"));
      router.refresh();
    } catch {
      toast.error(t("errors.networkError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={handleDisconnect}
      disabled={loading}
      className="text-muted-foreground hover:text-destructive"
    >
      <Unplug className="h-3.5 w-3.5" /> {t("integrations.disconnect")}
    </Button>
  );
}
