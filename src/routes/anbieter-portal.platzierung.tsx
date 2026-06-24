import { createFileRoute } from "@tanstack/react-router";
import { AnbieterPortalShell, type AnbieterProfile } from "@/components/anbieter-portal/portal-shell";
import { PlatzierungPage } from "@/components/anbieter-portal/platzierung-page";

const profile: AnbieterProfile = {
  name: "fynk",
  initial: "f",
  category: "Vertragsmanagement",
  email: "team@fynk.com",
};

export const Route = createFileRoute("/anbieter-portal/platzierung")({
  head: () => ({
    meta: [
      { title: "Platzierung · Anbieter-Portal – Toolfolio" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <AnbieterPortalShell profile={profile}>
      <PlatzierungPage />
    </AnbieterPortalShell>
  );
}
