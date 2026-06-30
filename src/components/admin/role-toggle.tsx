"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminRoleToggle({
  userId,
  currentRole,
  isSelf = false,
}: {
  userId: string;
  currentRole: string;
  isSelf?: boolean;
}) {
  const router = useRouter();
  const [role, setRole] = useState<"USER" | "ADMIN">(
    currentRole === "ADMIN" ? "ADMIN" : "USER"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleChange(newRole: "USER" | "ADMIN") {
    if (newRole === role) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to update role");
      }
      setRole(newRole);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-1">
      <div className="flex gap-2">
        {(["USER", "ADMIN"] as const).map((r) => {
          const isActive = role === r;
          const isDisabled = loading || isActive || (isSelf && r === "USER");
          return (
            <button
              key={r}
              onClick={() => handleChange(r)}
              disabled={isDisabled}
              title={
                isSelf && r === "USER"
                  ? "You cannot remove your own admin role"
                  : undefined
              }
              className={
                isActive
                  ? "rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                  : "rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
              }
            >
              {r === "ADMIN" ? "Admin" : "User"}
            </button>
          );
        })}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
