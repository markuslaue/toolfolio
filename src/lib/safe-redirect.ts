/**
 * Open-Redirect-Schutz: erlaubt ausschliesslich interne, relative Pfade.
 * Externe URLs (//evil.com, https://...) und Protokoll-Tricks werden auf den
 * Fallback abgewiesen.
 */
export function safeRedirect(
  target: string | null | undefined,
  fallback = "/app",
): string {
  if (!target) return fallback;
  if (!target.startsWith("/")) return fallback; // muss relativ sein
  if (target.startsWith("//")) return fallback; // protokoll-relativ -> extern
  if (target.startsWith("/\\")) return fallback; // Backslash-Trick
  return target;
}
