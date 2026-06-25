"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const KONTAKT_MAIL = "hallo@toolfolio.de";

export function KontaktForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [nachricht, setNachricht] = useState("");

  function senden(e: React.FormEvent) {
    e.preventDefault();
    const betreff = encodeURIComponent(`Kontakt über toolfolio.de von ${name || "Website"}`);
    const body = encodeURIComponent(`${nachricht}\n\nName: ${name}\nE-Mail: ${email}`);
    window.location.href = `mailto:${KONTAKT_MAIL}?subject=${betreff}&body=${body}`;
  }

  return (
    <form onSubmit={senden} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">E-Mail</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="nachricht">Nachricht</Label>
        <Textarea
          id="nachricht"
          rows={5}
          value={nachricht}
          onChange={(e) => setNachricht(e.target.value)}
          required
          placeholder="Wie können wir helfen?"
        />
      </div>
      <Button type="submit" className="gap-2">
        <Send className="size-4" /> Nachricht senden
      </Button>
      <p className="text-xs text-muted-foreground">
        Der Button öffnet dein E-Mail-Programm. Du erreichst uns direkt unter {KONTAKT_MAIL}.
      </p>
    </form>
  );
}
