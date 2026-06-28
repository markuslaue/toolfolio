import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type Krume = { name: string; href?: string };

/** Breadcrumb fuer Verzeichnis-Seiten (mit BreadcrumbList-Schema). */
export function Breadcrumb({ items }: { items: Krume[] }) {
  return (
    <nav aria-label="Brotkrumen" className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
      {items.map((k, i) => (
        <span key={i} className="inline-flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="size-3.5" />}
          {k.href ? (
            <Link href={k.href} className="hover:text-primary">{k.name}</Link>
          ) : (
            <span className="text-foreground">{k.name}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
