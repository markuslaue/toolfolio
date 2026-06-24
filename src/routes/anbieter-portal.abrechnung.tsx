import { createFileRoute } from "@tanstack/react-router";
import { AnbieterPortalShell, type AnbieterProfile } from "@/components/anbieter-portal/portal-shell";
import { AbrechnungPage } from "@/components/anbieter-portal/abrechnung-page";

const profile: AnbieterProfile = {
  name: "fynk",
  initial: "f",
  category: "Vertragsmanagement",
  email: "team@fynk.com",
};

export const Route = createFileRoute("/anbieter-portal/abrechnung")({
  head: () => ({
    meta: [
      { title: "Abrechnung · Anbieter-Portal – Toolfolio" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <AnbieterPortalShell profile={profile}>
      <AbrechnungPage />
    </AnbieterPortalShell>
  );
}
