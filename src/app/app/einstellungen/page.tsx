import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProfilForm } from "@/components/app/profil-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Profil" };

const ROLLEN: Record<string, string> = {
  owner: "Inhaber / Admin",
  admin: "Admin",
  member: "Mitglied",
};

export default async function ProfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "first_name, last_name, role, locale, timezone, theme, number_format, currency, avatar_url",
    )
    .eq("id", user.id)
    .single();

  // Hat der Nutzer bereits einen aktiven 2FA-Faktor?
  const { data: factors } = await supabase.auth.mfa.listFactors();
  const twoFactorActive = (factors?.totp ?? []).some(
    (f) => f.status === "verified",
  );

  return (
    <ProfilForm
      initial={{
        firstName: profile?.first_name ?? "",
        lastName: profile?.last_name ?? "",
        email: user.email ?? "",
        rolle: ROLLEN[profile?.role ?? "owner"] ?? "Mitglied",
        locale: profile?.locale ?? "de",
        timezone: profile?.timezone ?? "Europe/Berlin",
        theme: profile?.theme ?? "hell",
        numberFormat: profile?.number_format ?? "de",
        currency: profile?.currency ?? "EUR",
        avatarUrl: profile?.avatar_url ?? null,
      }}
      twoFactorActive={twoFactorActive}
    />
  );
}
