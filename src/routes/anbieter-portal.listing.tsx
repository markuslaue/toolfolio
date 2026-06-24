import { createFileRoute } from "@tanstack/react-router";
import { AnbieterPortalShell, type AnbieterProfile } from "@/components/anbieter-portal/portal-shell";
import { MeinListingPage } from "@/components/anbieter-portal/mein-listing";

const profile: AnbieterProfile = {
  name: "fynk",
  initial: "f",
  category: "Vertragsmanagement",
  email: "team@fynk.com",
};

export const Route = createFileRoute("/anbieter-portal/listing")({
  head: () => ({
    meta: [
      { title: "Mein Listing · Anbieter-Portal – Toolfolio" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <AnbieterPortalShell profile={profile}>
      <MeinListingPage />
    </AnbieterPortalShell>
  );
}
