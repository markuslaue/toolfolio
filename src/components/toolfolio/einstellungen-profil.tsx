import { useState } from "react";
import { toast } from "sonner";
import {
  Camera,
  Info,
  KeyRound,
  ShieldCheck,
  LogOut,
  Monitor,
  Smartphone,
  Globe,
  Sun,
  Moon,
  Laptop,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

function Card({
  titel,
  beschreibung,
  children,
  footer,
}: {
  titel: string;
  beschreibung?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <section className="rounded-[20px] border bg-card shadow-soft overflow-hidden">
      <header className="px-6 pt-6 pb-4 border-b border-border/60">
        <h2 className="font-display text-lg font-semibold">{titel}</h2>
        {beschreibung && (
          <p className="mt-1 text-sm text-muted-foreground">{beschreibung}</p>
        )}
      </header>
      <div className="p-6 space-y-5">{children}</div>
      {footer && (
        <div className="px-6 py-4 bg-muted/30 border-t border-border/60 flex items-center justify-end gap-2">
          {footer}
        </div>
      )}
    </section>
  );
}

export function EinstellungenProfil() {
  // Persönliche Daten
  const [vorname, setVorname] = useState("Markus");
  const [nachname, setNachname] = useState("Berger");
  const [email, setEmail] = useState("markus@beispiel.de");

  // Sicherheit
  const [pwOpen, setPwOpen] = useState(false);
  const [twoFA, setTwoFA] = useState(false);
  const [twoFASetup, setTwoFASetup] = useState(false);
  const [sitzungen, setSitzungen] = useState([
    {
      id: "s1",
      geraet: "MacBook Pro",
      ort: "Hamburg, DE",
      letzte: "Aktiv jetzt",
      icon: Laptop,
      aktuell: true,
    },
    {
      id: "s2",
      geraet: "iPhone 15",
      ort: "Hamburg, DE",
      letzte: "vor 2 Stunden",
      icon: Smartphone,
      aktuell: false,
    },
  ]);

  // Sprache & Darstellung
  const [sprache, setSprache] = useState("de");
  const [theme, setTheme] = useState("hell");
  const [format, setFormat] = useState("de");
  const [waehrung, setWaehrung] = useState("EUR");
  const [zeitzone, setZeitzone] = useState("Europe/Berlin");

  const initialen = `${vorname[0] ?? ""}${nachname[0] ?? ""}`.toUpperCase();

  const speichern = (bereich: string) => toast.success("Gespeichert", { description: bereich });

  return (
    <div className="space-y-6">
      {/* Persönliche Daten */}
      <Card
        titel="Persönliche Daten"
        beschreibung="So wirst du in Toolfolio angezeigt."
        footer={
          <Button onClick={() => speichern("Persönliche Daten aktualisiert.")}>
            Speichern
          </Button>
        }
      >
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="size-20 rounded-full bg-primary/15 text-primary grid place-items-center font-display text-2xl font-semibold">
              {initialen || "M"}
            </div>
            <button
              type="button"
              className="absolute -bottom-1 -right-1 size-8 rounded-full bg-card border border-border shadow-soft grid place-items-center text-muted-foreground hover:text-foreground"
              aria-label="Bild ändern"
            >
              <Camera className="size-4" />
            </button>
          </div>
          <div>
            <div className="font-medium">
              {vorname} {nachname}
            </div>
            <div className="text-sm text-muted-foreground">Inhaber / Admin</div>
            <button className="mt-1 text-xs font-medium text-primary hover:underline">
              Bild ändern
            </button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="vorname">Vorname</Label>
            <Input id="vorname" value={vorname} onChange={(e) => setVorname(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nachname">Nachname</Label>
            <Input id="nachname" value={nachname} onChange={(e) => setNachname(e.target.value)} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Konto-E-Mail</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <p className="text-xs text-muted-foreground flex items-start gap-1.5">
            <Info className="size-3.5 mt-0.5 shrink-0" />
            Eine Änderung erfordert eine Bestätigung per Link an die neue Adresse.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label>Rolle</Label>
          <div className="flex h-9 items-center rounded-md border border-input bg-muted/40 px-3 text-sm text-muted-foreground">
            Inhaber / Admin
          </div>
        </div>
      </Card>

      {/* Sicherheit */}
      <Card titel="Sicherheit" beschreibung="Schütze dein Konto.">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="size-9 rounded-lg bg-primary/10 text-primary grid place-items-center">
              <KeyRound className="size-4" />
            </div>
            <div>
              <div className="font-medium text-sm">Passwort</div>
              <div className="text-xs text-muted-foreground">
                Zuletzt geändert vor 3 Monaten.
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={() => setPwOpen(true)}>
            Passwort ändern
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-5">
          <div className="flex items-start gap-3">
            <div className="size-9 rounded-lg bg-primary/10 text-primary grid place-items-center">
              <ShieldCheck className="size-4" />
            </div>
            <div>
              <div className="font-medium text-sm">Zwei-Faktor-Authentifizierung</div>
              <div className="text-xs text-muted-foreground max-w-md">
                Zusätzlicher Code per App beim Login. Empfohlen für Inhaber-Konten.
              </div>
            </div>
          </div>
          <Switch
            checked={twoFA}
            onCheckedChange={(v) => {
              setTwoFA(v);
              if (v) setTwoFASetup(true);
              else toast.success("Zwei-Faktor deaktiviert");
            }}
          />
        </div>

        <div className="border-t border-border/60 pt-5">
          <div className="text-sm font-medium mb-3">Aktive Sitzungen</div>
          <ul className="space-y-2">
            {sitzungen.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between rounded-xl border border-border/60 bg-background/60 px-4 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-9 rounded-lg bg-muted text-muted-foreground grid place-items-center">
                    <s.icon className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">
                      {s.geraet}
                      {s.aktuell && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
                          Dieses Gerät
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {s.ort} · {s.letzte}
                    </div>
                  </div>
                </div>
                {!s.aktuell && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSitzungen((cur) => cur.filter((c) => c.id !== s.id));
                      toast.success("Sitzung beendet");
                    }}
                  >
                    Abmelden
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-border/60 pt-5 flex justify-end">
          <Button
            variant="outline"
            className="gap-2 text-destructive hover:text-destructive"
            onClick={() => toast("Du wurdest abgemeldet (Demo).")}
          >
            <LogOut className="size-4" /> Von diesem Gerät abmelden
          </Button>
        </div>
      </Card>

      {/* Sprache & Darstellung */}
      <Card
        titel="Sprache & Darstellung"
        beschreibung="So sieht Toolfolio für dich aus."
        footer={
          <Button onClick={() => speichern("Darstellung aktualisiert.")}>Speichern</Button>
        }
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Sprache</Label>
            <Select value={sprache} onValueChange={setSprache}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Zeitzone</Label>
            <Select value={zeitzone} onValueChange={setZeitzone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Europe/Berlin">Europe/Berlin</SelectItem>
                <SelectItem value="Europe/Vienna">Europe/Vienna</SelectItem>
                <SelectItem value="Europe/Zurich">Europe/Zurich</SelectItem>
                <SelectItem value="UTC">UTC</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Darstellung</Label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "hell", label: "Hell", icon: Sun },
              { id: "dunkel", label: "Dunkel", icon: Moon },
              { id: "system", label: "System", icon: Monitor },
            ].map((opt) => {
              const aktiv = theme === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTheme(opt.id)}
                  className={cn(
                    "rounded-xl border px-3 py-3 text-sm font-medium flex flex-col items-center gap-1.5 transition-colors",
                    aktiv
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-card text-muted-foreground hover:text-foreground",
                  )}
                >
                  <opt.icon className="size-4" />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Zahlen- und Datumsformat</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="de">Deutsch (1.249,00 €, 14.08.2026)</SelectItem>
                <SelectItem value="int">International (1,249.00 €, 2026-08-14)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Standardwährung</Label>
            <Select value={waehrung} onValueChange={setWaehrung}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EUR">Euro (€)</SelectItem>
                <SelectItem value="USD">US-Dollar ($)</SelectItem>
                <SelectItem value="CHF">Schweizer Franken (CHF)</SelectItem>
                <SelectItem value="GBP">Britisches Pfund (£)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <Globe className="size-3.5 mt-0.5 shrink-0" />
          Diese Einstellungen wirken sich auf alle Ansichten in deinem Konto aus.
        </div>
      </Card>

      {/* Passwort-Dialog */}
      <Dialog open={pwOpen} onOpenChange={setPwOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Passwort ändern</DialogTitle>
            <DialogDescription>
              Wähle ein neues, sicheres Passwort. Mindestens 12 Zeichen.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="pw-alt">Aktuelles Passwort</Label>
              <Input id="pw-alt" type="password" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pw-neu">Neues Passwort</Label>
              <Input id="pw-neu" type="password" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pw-wdh">Neues Passwort wiederholen</Label>
              <Input id="pw-wdh" type="password" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPwOpen(false)}>
              Abbrechen
            </Button>
            <Button
              onClick={() => {
                setPwOpen(false);
                toast.success("Passwort geändert");
              }}
            >
              Passwort speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2FA-Setup-Dialog */}
      <Dialog open={twoFASetup} onOpenChange={setTwoFASetup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Zwei-Faktor einrichten</DialogTitle>
            <DialogDescription>
              Scanne den QR-Code mit deiner Authenticator-App und gib den 6-stelligen Code ein.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="size-40 rounded-xl border border-dashed border-border bg-muted/40 grid place-items-center text-xs text-muted-foreground">
              QR-Code (Platzhalter)
            </div>
            <Input placeholder="123 456" className="max-w-[180px] text-center tracking-widest" />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setTwoFASetup(false);
                setTwoFA(false);
              }}
            >
              Abbrechen
            </Button>
            <Button
              onClick={() => {
                setTwoFASetup(false);
                toast.success("Zwei-Faktor aktiviert");
              }}
            >
              Aktivieren
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
