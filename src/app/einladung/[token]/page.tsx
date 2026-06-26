import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { EinladungClient } from "@/components/app/einladung-client";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Einladung", robots: { index: false } };

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=${encodeURIComponent(`/einladung/${token}`)}`);

  return <EinladungClient token={token} />;
}
