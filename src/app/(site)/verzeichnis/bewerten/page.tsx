import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/verzeichnis/breadcrumb";
import { BewertenForm } from "@/components/verzeichnis/bewerten-form";
import { getProdukt } from "@/lib/verzeichnis";

export const metadata: Metadata = {
  title: "Bewertung abgeben",
  robots: { index: false },
};

export default async function BewertenSeite({ searchParams }: { searchParams: Promise<{ tool?: string }> }) {
  const { tool } = await searchParams;
  if (!tool) notFound();
  const data = await getProdukt(tool);
  if (!data) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <Breadcrumb
        items={[
          { name: "Verzeichnis", href: "/verzeichnis" },
          { name: data.produkt.name, href: `/software/${data.produkt.slug}` },
          { name: "Bewerten" },
        ]}
      />
      <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight">{data.produkt.name} bewerten</h1>
      <p className="mt-2 text-muted-foreground">
        Teile deine ehrliche Erfahrung. Das hilft anderen Agenturen, Freelancern und Teams bei der Auswahl.
      </p>
      <div className="mt-6">
        <BewertenForm toolSlug={data.produkt.slug} toolName={data.produkt.name} />
      </div>
    </div>
  );
}
