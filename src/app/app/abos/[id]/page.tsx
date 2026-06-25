import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AboDetail } from "@/components/app/abo-detail";
import { createClient } from "@/lib/supabase/server";
import { ladeAboOptionen } from "@/lib/abo-optionen";
import type { Abo } from "@/lib/abos";

export const metadata: Metadata = { title: "Abo" };

export default async function AboDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("abos")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!data) notFound();

  const { kanalOptionen, kundenOptionen } = await ladeAboOptionen();

  return (
    <AboDetail
      abo={data as Abo}
      kanalOptionen={kanalOptionen}
      kundenOptionen={kundenOptionen}
    />
  );
}
