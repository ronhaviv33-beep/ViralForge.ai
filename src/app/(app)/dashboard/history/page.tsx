import type { Metadata } from "next";
import Link from "next/link";
import { History, Sparkles } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { GenerationCard } from "@/components/dashboard/generation-card";

export const metadata: Metadata = {
  title: "History — ViralForge",
};

export default async function HistoryPage() {
  const user = await requireUser();
  const generations = await prisma.generation.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Generation history</h1>
          <p className="mt-1 text-muted-foreground">
            {generations.length} content pack
            {generations.length === 1 ? "" : "s"} created.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/generate">
            <Sparkles className="h-4 w-4" /> New generation
          </Link>
        </Button>
      </div>

      {generations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 px-6 py-16 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <History className="h-6 w-6" />
          </div>
          <h3 className="font-semibold">No history yet</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Your generated content packs will appear here so you can revisit and
            reuse them anytime.
          </p>
          <Button asChild className="mt-5">
            <Link href="/dashboard/generate">
              <Sparkles className="h-4 w-4" /> Generate your first pack
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {generations.map((gen) => (
            <GenerationCard
              key={gen.id}
              id={gen.id}
              title={gen.title}
              tone={gen.tone}
              platforms={gen.platforms}
              createdAt={gen.createdAt.toISOString()}
            />
          ))}
        </div>
      )}
    </div>
  );
}
