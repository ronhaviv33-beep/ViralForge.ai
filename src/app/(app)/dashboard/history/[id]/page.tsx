import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ContentPackSchema } from "@/lib/content-types";
import { Badge } from "@/components/ui/badge";
import { ContentPackView } from "@/components/content-pack-view";
import { dateLocale, toneLabel } from "@/lib/i18n";
import { getLocale, getT } from "@/lib/i18n-server";

export default async function GenerationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const locale = await getLocale();
  const t = await getT();

  const generation = await prisma.generation.findFirst({
    where: { id, userId: user.id },
  });
  if (!generation) notFound();

  const parsed = ContentPackSchema.safeParse(generation.outputJson);

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/history"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t("history.backToHistory")}
      </Link>

      <div>
        <h1 className="text-2xl font-bold">{generation.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{toneLabel(t, generation.tone)}</Badge>
          {generation.platforms.map((p) => (
            <Badge key={p} variant="outline" className="text-muted-foreground">
              {p}
            </Badge>
          ))}
          <span className="text-xs text-muted-foreground">
            {generation.createdAt.toLocaleString(dateLocale(locale), {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </span>
        </div>
      </div>

      {/* Original input */}
      <details className="rounded-xl border border-border bg-card/50 p-4">
        <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
          {t("history.viewOriginalInput")}
        </summary>
        <p className="mt-3 whitespace-pre-wrap text-sm text-foreground/80">
          {generation.inputText}
        </p>
      </details>

      {parsed.success ? (
        <ContentPackView pack={parsed.data} title={generation.title} platforms={generation.platforms} generationId={generation.id} />
      ) : (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {t("history.displayError")}
        </div>
      )}
    </div>
  );
}
