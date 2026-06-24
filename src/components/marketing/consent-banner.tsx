import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Shield, Settings2, PlayCircle, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * Consent (R-04) - Dummy-Implementierung.
 * Hinweis fuer die Produktion:
 *  - Auswahl wird als First-Party-Consent-Cookie/-Eintrag inkl. Zeitstempel und Umfang
 *    gespeichert (selbst "notwendig"), damit die Einwilligung nachweisbar ist.
 *  - Nicht notwendige Skripte und Embeds (z. B. YouTube) duerfen erst nach Einwilligung laden.
 *  - In diesem Dummy wird nichts in localStorage/sessionStorage geschrieben.
 */

export type ConsentCategories = {
  necessary: true;
  statistics: boolean;
  externalMedia: boolean;
};

type ConsentState = {
  decided: boolean;
  categories: ConsentCategories;
};

type ConsentContextValue = {
  state: ConsentState;
  openSettings: () => void;
  acceptAll: () => void;
  acceptNecessary: () => void;
  save: (next: Pick<ConsentCategories, "statistics" | "externalMedia">) => void;
  reset: () => void;
};

const defaultState: ConsentState = {
  decided: false,
  categories: { necessary: true, statistics: false, externalMedia: false },
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function useConsent() {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error("useConsent must be used within ConsentProvider");
  return ctx;
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConsentState>(defaultState);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const api = useMemo<ConsentContextValue>(
    () => ({
      state,
      openSettings: () => setSettingsOpen(true),
      acceptAll: () =>
        setState({
          decided: true,
          categories: { necessary: true, statistics: true, externalMedia: true },
        }),
      acceptNecessary: () =>
        setState({
          decided: true,
          categories: { necessary: true, statistics: false, externalMedia: false },
        }),
      save: (next) =>
        setState({
          decided: true,
          categories: { necessary: true, ...next },
        }),
      reset: () => setState(defaultState),
    }),
    [state],
  );

  return (
    <ConsentContext.Provider value={api}>
      {children}
      <CookieBanner onOpenSettings={() => setSettingsOpen(true)} />
      <CookieSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </ConsentContext.Provider>
  );
}

/* ============================ Banner ============================ */

function CookieBanner({ onOpenSettings }: { onOpenSettings: () => void }) {
  const { state, acceptAll, acceptNecessary } = useConsent();
  if (state.decided) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="consent-banner-title"
      aria-describedby="consent-banner-desc"
      className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-6 pointer-events-none"
    >
      <div className="pointer-events-auto mx-auto max-w-3xl rounded-2xl border border-border bg-white text-[#1F1D2B] shadow-[0_20px_60px_-20px_rgba(31,29,43,0.35)]">
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-[#6C5CE7]/10 text-[#6C5CE7]">
              <Shield className="size-5" />
            </span>
            <div className="min-w-0">
              <h2
                id="consent-banner-title"
                className="font-display text-lg sm:text-xl font-semibold tracking-tight"
              >
                Datenschutz bei Toolfolio
              </h2>
              <p
                id="consent-banner-desc"
                className="mt-1.5 text-sm text-[#6B7280] leading-relaxed"
              >
                Notwendige Cookies sind immer aktiv, damit Login und Sicherheit funktionieren.
                Optionale Inhalte wie eingebettete Videos laden wir nur, wenn du einwilligst.
                Mehr in der{" "}
                <Link to="/datenschutz" className="text-[#6C5CE7] underline underline-offset-2">
                  Datenschutzerklärung
                </Link>{" "}
                und im{" "}
                <Link to="/impressum" className="text-[#6C5CE7] underline underline-offset-2">
                  Impressum
                </Link>
                .
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            <Button
              type="button"
              onClick={acceptNecessary}
              className="h-11 rounded-xl bg-[#F3F2F8] text-[#1F1D2B] hover:bg-[#E8E6F2] shadow-none border border-[#E5E3EE]"
            >
              Nur notwendige
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onOpenSettings}
              className="h-11 rounded-xl border-[#E5E3EE] text-[#1F1D2B] hover:bg-[#F3F2F8]"
            >
              <Settings2 className="size-4" />
              Einstellungen
            </Button>
            <Button
              type="button"
              onClick={acceptAll}
              className="h-11 rounded-xl bg-[#6C5CE7] text-white hover:bg-[#5b4cd6]"
            >
              Alle akzeptieren
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ====================== Settings-Dialog ====================== */

function CookieSettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { state, acceptAll, save } = useConsent();
  const [stats, setStats] = useState<boolean>(state.categories.statistics);
  const [media, setMedia] = useState<boolean>(state.categories.externalMedia);

  // sync, wenn Dialog frisch geoeffnet wird
  const lastOpenRef = useState<boolean>(false);
  if (open && !lastOpenRef[0]) {
    lastOpenRef[1](true);
    setStats(state.categories.statistics);
    setMedia(state.categories.externalMedia);
  }
  if (!open && lastOpenRef[0]) lastOpenRef[1](false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl rounded-2xl bg-white text-[#1F1D2B] border-[#E5E3EE]">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Cookie-Einstellungen</DialogTitle>
          <DialogDescription className="text-[#6B7280]">
            Entscheide selbst, welche Kategorien du erlaubst. Du kannst deine Wahl jederzeit
            ueber den Link „Cookie-Einstellungen“ im Footer aendern.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <CategoryRow
            title="Notwendig"
            description="Login-Session, Sicherheit und das Speichern deiner Cookie-Entscheidung. Ohne diese Cookies funktioniert die Seite nicht."
            checked
            disabled
          />
          <CategoryRow
            title="Statistik (Plausible)"
            description="Anonyme, cookielose Reichweitenmessung mit EU-Hosting. Es werden keine personenbezogenen Profile gebildet. Hinweis: Einwilligungspflicht in unserer Konfiguration noch juristisch zu klaeren, Standard bleibt datensparsam."
            checked={stats}
            onChange={setStats}
          />
          <CategoryRow
            title="Externe Medien (YouTube)"
            description="Wenn du dies aktivierst, werden eingebettete Videos geladen. Dabei koennen Daten an Google uebermittelt werden, auch in die USA (Drittland)."
            checked={media}
            onChange={setMedia}
          />
        </div>

        <div className="rounded-xl bg-[#F7F6FB] p-4 text-xs text-[#6B7280] leading-relaxed">
          Solange „Externe Medien“ nicht aktiv ist, zeigen Videobereiche einen Platzhalter
          (Click-to-load). Du kannst ein einzelnes Video manuell laden, ohne die Kategorie
          global zu aktivieren.
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            onClick={() => {
              save({ statistics: stats, externalMedia: media });
              onOpenChange(false);
            }}
            className="h-11 rounded-xl bg-[#F3F2F8] text-[#1F1D2B] hover:bg-[#E8E6F2] shadow-none border border-[#E5E3EE]"
          >
            Auswahl speichern
          </Button>
          <Button
            type="button"
            onClick={() => {
              acceptAll();
              onOpenChange(false);
            }}
            className="h-11 rounded-xl bg-[#6C5CE7] text-white hover:bg-[#5b4cd6]"
          >
            Alle akzeptieren
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CategoryRow({
  title,
  description,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-[#E5E3EE] bg-white p-4">
      <div className="min-w-0">
        <div className="font-semibold text-[#1F1D2B]">{title}</div>
        <p className="mt-1 text-sm text-[#6B7280] leading-relaxed">{description}</p>
      </div>
      <Switch
        checked={checked}
        disabled={disabled}
        onCheckedChange={(v) => onChange?.(Boolean(v))}
        className={cn(
          "mt-1 data-[state=checked]:bg-[#6C5CE7] data-[state=unchecked]:bg-[#D7D5E2]",
          disabled && "opacity-70",
        )}
        aria-label={title}
      />
    </div>
  );
}

/* ====================== Footer-Link ====================== */

export function CookieSettingsLink({ className }: { className?: string }) {
  const { openSettings } = useConsent();
  return (
    <button
      type="button"
      onClick={openSettings}
      className={cn(
        "text-sm text-muted-foreground hover:text-foreground transition-colors text-left",
        className,
      )}
    >
      Cookie-Einstellungen
    </button>
  );
}

/* ====================== YouTube Click-to-load ====================== */

export function YouTubeEmbed({
  videoId,
  title,
  thumbnailUrl,
  className,
}: {
  videoId: string;
  title: string;
  thumbnailUrl?: string;
  className?: string;
}) {
  const { state, openSettings } = useConsent();
  const [localAllow, setLocalAllow] = useState(false);
  const allowed = state.categories.externalMedia || localAllow;
  const thumb =
    thumbnailUrl ?? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  if (allowed) {
    return (
      <div className={cn("relative aspect-video w-full overflow-hidden rounded-2xl", className)}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 size-full"
        />
        {localAllow && !state.categories.externalMedia && (
          <button
            type="button"
            onClick={() => setLocalAllow(false)}
            className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80"
            aria-label="Video wieder ausblenden"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative aspect-video w-full overflow-hidden rounded-2xl border border-[#E5E3EE] bg-[#F7F6FB]",
        className,
      )}
    >
      <img
        src={thumb}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 size-full object-cover opacity-60"
        loading="lazy"
      />
      <div className="absolute inset-0 grid place-items-center bg-gradient-to-t from-black/55 via-black/25 to-transparent p-4">
        <div className="max-w-md text-center text-white">
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-white/15 backdrop-blur">
            <PlayCircle className="size-7" />
          </div>
          <div className="mt-3 font-display text-base sm:text-lg font-semibold">{title}</div>
          <p className="mt-1 text-xs sm:text-sm text-white/85">
            Wenn du das Video laedst, werden Daten an YouTube/Google uebermittelt, auch in die
            USA. Mehr in der{" "}
            <Link to="/datenschutz" className="underline underline-offset-2">
              Datenschutzerklärung
            </Link>
            .
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => setLocalAllow(true)}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-[#6C5CE7] px-4 text-sm font-medium text-white hover:bg-[#5b4cd6]"
            >
              Video laden, Daten gehen an YouTube
            </button>
            <button
              type="button"
              onClick={openSettings}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-white/15 px-4 text-sm font-medium text-white backdrop-blur hover:bg-white/25"
            >
              Einstellungen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
