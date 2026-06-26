import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { TeamClient, type Member, type Invite, type Owner } from "@/components/app/team-client";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Team & Rollen" };

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profil }, { data: members }, { data: invites }] = await Promise.all([
    supabase.from("profiles").select("first_name, last_name").eq("id", user.id).maybeSingle(),
    supabase.from("team_members").select("id, member_email, member_name, role, created_at").eq("account_owner", user.id).order("created_at"),
    supabase.from("team_invites").select("id, email, role, expires_at").eq("account_owner", user.id).is("accepted_at", null).order("created_at"),
  ]);

  const owner: Owner = {
    name: [profil?.first_name, profil?.last_name].filter(Boolean).join(" ") || (user.email ?? "Du"),
    email: user.email ?? "",
  };

  return <TeamClient owner={owner} members={(members as Member[]) ?? []} invites={(invites as Invite[]) ?? []} />;
}
