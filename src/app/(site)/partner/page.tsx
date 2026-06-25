import type { Metadata } from "next";
import Link from "next/link";
import { Handshake, Megaphone, Wallet, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Partner & Affiliate: Toolfolio empfehlen",
  description:
    "Empfiehl Toolfolio an Agenturen, Freelancer und Solopreneure und werde fair beteiligt. Transparent, DSGVO-konform, mit klarer Attribution.",
};

const STUFEN = [
  { icon: Megaphone, title: "Empfehlen", desc: "Teile deinen persönlichen Link in Newsletter, Community oder Content." },
  { icon: Handshake, title: "Attribution", desc: "Wir speichern dazu nur ein anonymes Attributions-Ereignis, kein Tracking-Profil." },
  { icon: Wallet, title: "Beteiligung", desc: "Für jeden geworbenen zahlenden Kunden wirst du fair beteiligt. Konditionen auf Anfrage." },
];

export default function PartnerPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="text-center">
        <div className="text-xs font-semibold uppercase tracking-widest text-primary">Partner</div>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Empfehlen, was du selbst nutzt.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Wenn dir Toolfolio hilft, hilf anderen, es zu finden. Unser Partnerprogramm ist fair,
          transparent und datensparsam.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {STUFEN.map((s, i) => (
          <div key={s.title} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
              <s.icon className="size-5" />
            </span>
            <div className="mt-4 text-xs font-semibold text-muted-foreground">Schritt {i + 1}</div>
            <h2 className="mt-1 font-display text-lg font-semibold">{s.title}</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/kontakt"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-soft transition hover:bg-primary/90"
        >
          Partner werden <ArrowRight className="size-4" />
        </Link>
        <p className="mt-3 text-xs text-muted-foreground">
          Konditionen sind in Vorbereitung und werden vor dem Start final festgelegt.
        </p>
      </div>
    </div>
  );
}
