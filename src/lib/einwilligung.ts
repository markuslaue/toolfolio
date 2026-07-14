/**
 * Der Wortlaut der Launch-Einwilligung, versioniert.
 *
 * WARUM VERSIONIERT: Im Streitfall muss Toolfolio nicht nur belegen, DASS jemand
 * zugestimmt hat, sondern WELCHEM SATZ. Aendert sich der Text, bekommt er eine
 * neue Version, und alte Einwilligungen behalten ihren alten Wortlaut. Ein
 * blosses `einwilligung: true` in der Datenbank waere als Nachweis wertlos.
 *
 * DIE REGELN, die dieser Text erfuellen muss (§ 7 UWG, Art. 6 I a und 7 IV DSGVO):
 *   - eigene Checkbox, NICHT vorangekreuzt
 *   - FREIWILLIG: die Anfrage geht auch ohne das Haekchen raus (kein Kopplungsverbot-Verstoss)
 *   - Zweck im Klartext, nicht in der Datenschutzerklaerung versteckt
 *   - KATEGORIESPEZIFISCH. "Werbung allgemein" waere zu unbestimmt und unwirksam.
 *   - erkennbar, dass TOOLFOLIO schreibt, nicht der fremde Anbieter. Sonst denkt der
 *     Nutzer, seine Adresse wird weitergegeben, und das waere eine andere Rechtsgrundlage.
 *   - Widerruf jederzeit, ohne Begruendung
 */

export const EINWILLIGUNG_VERSION = "launch-v1";

/** Der Satz an der Checkbox. Kategoriespezifisch, freundlich, aber eindeutig. */
export function einwilligungText(kategorie: string): string {
  return `Wenn wir spannende Angebote von Anbietern zum Thema ${kategorie} haben, darf Toolfolio dich per E-Mail darüber informieren. Du kannst das jederzeit mit einem Klick widerrufen.`;
}

/** Der kleine Zusatz darunter. Muss die Freiwilligkeit ausdrücklich benennen. */
export function einwilligungHinweis(): string {
  return "Freiwillig. Deine Anfrage geht auch ohne dieses Häkchen raus.";
}

/** Was in der Bestätigungsmail steht (Double-Opt-in). */
export function bestaetigungText(kategorie: string): string {
  return `Du hast bei Toolfolio angegeben, dass wir dich über Angebote zum Thema ${kategorie} informieren dürfen. Bestätige das bitte einmal, dann ist es verbindlich. Ohne diese Bestätigung schreiben wir dich nicht an.`;
}

/** Der Hinweis unter der Anfrage selbst. Das ist KEINE Einwilligung, nur Transparenz. */
export function anfrageHinweis(anbieter: string | null): string {
  return anbieter
    ? `Deine Anfrage geht an ${anbieter}. Wir speichern sie, um sie zuzustellen und belegen zu können, dass wir es getan haben.`
    : "Deine Anfrage geht an die passenden Anbieter dieser Kategorie. Wir speichern sie, um sie zuzustellen und belegen zu können, dass wir es getan haben.";
}
