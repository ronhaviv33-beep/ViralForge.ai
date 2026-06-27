"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, ArrowUpRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface GenerationCardProps {
  id: string;
  title: string;
  tone: string;
  platforms: string[];
  createdAt: string;
}

export function GenerationCard({
  id,
  title,
  tone,
  platforms,
  createdAt,
}: GenerationCardProps) {
  const router = useRouter();
  const [deleting, setDeleting] = React.useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this generation? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/generations/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Generation deleted");
      router.refresh();
    } catch {
      toast.error("Could not delete. Please try again.");
      setDeleting(false);
    }
  }

  return (
    <Link
      href={`/dashboard/history/${id}`}
      className="group flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
    >
      <div className="min-w-0">
        <p className="truncate font-medium">{title}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary">{tone}</Badge>
          {platforms.slice(0, 3).map((p) => (
            <Badge key={p} variant="outline" className="text-muted-foreground">
              {p}
            </Badge>
          ))}
          {platforms.length > 3 && (
            <span className="text-xs text-muted-foreground">
              +{platforms.length - 3}
            </span>
          )}
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">
          {new Date(createdAt).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          aria-label="Delete generation"
        >
          {deleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </button>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </Link>
  );
}
