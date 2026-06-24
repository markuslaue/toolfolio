import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Hammer } from "lucide-react";
import { AnbieterPortalShell, type AnbieterProfile } from "@/components/anbieter-portal/portal-shell";
import { Button } from "@/components/ui/button";

const profile: AnbieterProfile = {
  name: "fynk",
  initial: "f",
  category: "Vertragsmanagement",
  email: "team@fynk.com",
};

export const Route = createFileRoute("/anbieter-portal/leads")({
  head: () => ({
    meta: [
      { title: "Leads · Anbieter-Portal – Toolfolio" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: PlaceholderPage,
});

function PlaceholderPage() {
  return (
    <AnbieterPortalShell profile={profile}>
      <div className="max-w-2xl mx-auto py-16 text-center">
        <div className="mx-auto size-14 rounded-2xl bg-primary/10 text-primary grid place-items-center">
          <Hammer className="size-6" />
        </div>
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight">Leads</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Dieser Bereich folgt in Kürze (A-03). Hier siehst du alle Anfragen, die über dein Listing
          eingehen.
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link to="/anbieter-portal">
            <ArrowLeft className="size-4" /> Zurück zum Dashboard
          </Link>
        </Button>
      </div>
    </AnbieterPortalShell>
  );
}
