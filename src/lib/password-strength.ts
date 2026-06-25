/** Einfache Passwort-Staerke (0-4) fuer die visuelle Anzeige. */
export function scorePassword(pw: string): number {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

export const STRENGTH = [
  { label: "Zu schwach", color: "bg-destructive", text: "text-destructive" },
  { label: "Schwach", color: "bg-destructive", text: "text-destructive" },
  { label: "Mittel", color: "bg-warning", text: "text-warning" },
  { label: "Stark", color: "bg-success", text: "text-success" },
  { label: "Sehr stark", color: "bg-success", text: "text-success" },
] as const;
