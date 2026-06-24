import { createFileRoute } from "@tanstack/react-router";
import { AnbieterPortalShell, type AnbieterProfile } from "@/components/anbieter-portal/portal-shell";
import { IndieEinreichenFlow } from "@/components/anbieter-portal/indie-einreichen";

const profile: AnbieterProfile = {
  name: "Indie-Builder",
  initial: "i",
  category: "Einreichung",
  email: "builder@example.com",
};

export const Route = createFileRoute("/anbieter-portal/einreichen")({
  head: () => ({
    meta: [
      { title: "Tool einreichen · Anbieter-Portal – Toolfolio" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <AnbieterPortalShell profile={profile}>
      <IndieEinreichenFlow />
    </AnbieterPortalShell>
  );
}
