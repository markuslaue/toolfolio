import { describe, it, expect } from "vitest";
import { parseCamt053, parseMt940, parseKontoauszug, parseCsv, erkenneAbos } from "@/lib/import";

/* ---------------- CAMT.053 ---------------- */

const CAMT = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02">
  <BkToCstmrStmt>
    <Stmt>
      <Ntry>
        <Amt Ccy="EUR">9.99</Amt>
        <CdtDbtInd>DBIT</CdtDbtInd>
        <BookgDt><Dt>2025-01-15</Dt></BookgDt>
        <NtryDtls><TxDtls>
          <RmtInf><Ustrd>NOTION LABS SUBSCRIPTION</Ustrd></RmtInf>
          <RltdPties><Cdtr><Nm>Notion Labs Inc</Nm></Cdtr></RltdPties>
        </TxDtls></NtryDtls>
      </Ntry>
      <Ntry>
        <Amt Ccy="EUR">9.99</Amt>
        <CdtDbtInd>DBIT</CdtDbtInd>
        <BookgDt><Dt>2025-02-15</Dt></BookgDt>
        <NtryDtls><TxDtls><RmtInf><Ustrd>NOTION LABS SUBSCRIPTION</Ustrd></RmtInf></TxDtls></NtryDtls>
      </Ntry>
      <Ntry>
        <Amt Ccy="EUR">1200.00</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <BookgDt><Dt>2025-02-01</Dt></BookgDt>
        <NtryDtls><TxDtls><RmtInf><Ustrd>Kundenzahlung Projekt</Ustrd></RmtInf></TxDtls></NtryDtls>
      </Ntry>
    </Stmt>
  </BkToCstmrStmt>
</Document>`;

describe("parseCamt053", () => {
  it("liest Betrag, Vorzeichen, Datum und Text je Buchung", () => {
    const b = parseCamt053(CAMT);
    expect(b).toHaveLength(3);
    expect(b[0]).toMatchObject({ datum: "2025-01-15", betrag: -9.99 });
    expect(b[0].text).toContain("NOTION");
    expect(b[0].text).toContain("Notion Labs Inc");
  });

  it("macht Soll negativ und Haben positiv", () => {
    const b = parseCamt053(CAMT);
    expect(b[0].betrag).toBeLessThan(0); // DBIT
    expect(b[2].betrag).toBeGreaterThan(0); // CRDT
  });
});

/* ---------------- MT940 ---------------- */

const MT940 = `:20:STARTUMS
:25:10050000/1234567
:28C:00012/001
:60F:C250101EUR1000,00
:61:2501150115DR9,99NTRFNONREF
:86:020?00DAUERAUFTRAG?20NOTION LABS?21SUBSCRIPTION?32NOTION LABS INC
:61:2502150215DR9,99NTRFNONREF
:86:020?00DAUERAUFTRAG?20NOTION LABS?21SUBSCRIPTION
:61:2502010201CR1200,00NTRFNONREF
:86:051?00GUTSCHRIFT?20Kundenzahlung Projekt
:62F:C250228EUR2180,02
:20:NEXT`;

describe("parseMt940", () => {
  it("liest die :61:-Umsatzzeilen mit Datum und Vorzeichen", () => {
    const b = parseMt940(MT940);
    expect(b).toHaveLength(3);
    expect(b[0]).toMatchObject({ datum: "2025-01-15", betrag: -9.99 });
    expect(b[2]).toMatchObject({ datum: "2025-02-01", betrag: 1200 });
  });

  it("haengt den :86:-Verwendungszweck an und entfernt ?NN-Marker", () => {
    const b = parseMt940(MT940);
    expect(b[0].text).toContain("NOTION LABS");
    expect(b[0].text).not.toContain("?20");
  });
});

/* ---------------- Dispatcher ---------------- */

describe("parseKontoauszug", () => {
  it("erkennt CAMT an Inhalt", () => {
    const r = parseKontoauszug("auszug.xml", CAMT);
    expect(r.format).toBe("camt");
    expect(r.buchungen.length).toBe(3);
  });

  it("erkennt MT940 an den :NN:-Feldern", () => {
    const r = parseKontoauszug("auszug.sta", MT940);
    expect(r.format).toBe("mt940");
    expect(r.buchungen.length).toBe(3);
  });

  it("faellt fuer CSV auf den CSV-Parser zurueck", () => {
    const csv = "Datum;Verwendungszweck;Betrag\n15.01.2025;NOTION LABS;-9,99";
    const r = parseKontoauszug("export.csv", csv);
    expect(r.format).toBe("csv");
    expect(r.buchungen).toHaveLength(1);
    expect(r.buchungen[0].betrag).toBe(-9.99);
  });
});

/* ---------------- Ende-zu-Ende: CAMT/MT940 -> Abo-Erkennung ---------------- */

describe("Erkennung aus CAMT und MT940", () => {
  it("erkennt das wiederkehrende Notion-Abo aus CAMT", () => {
    const treffer = erkenneAbos(parseCamt053(CAMT), []);
    const notion = treffer.find((t) => t.tool === "Notion");
    expect(notion).toBeTruthy();
    expect(notion!.betrag).toBe(9.99);
    expect(notion!.konfidenz).toBe("hoch"); // Merchant erkannt
  });

  it("erkennt das wiederkehrende Notion-Abo aus MT940", () => {
    const treffer = erkenneAbos(parseMt940(MT940), []);
    const notion = treffer.find((t) => t.tool === "Notion");
    expect(notion).toBeTruthy();
    expect(notion!.anzahl).toBe(2);
  });

  it("ignoriert Gutschriften (positive Betraege)", () => {
    const treffer = erkenneAbos(parseCsv("Datum;Text;Betrag\n01.02.2025;Kundenzahlung;1200,00"), []);
    expect(treffer).toHaveLength(0);
  });
});

/* ---------------- Klassifikation: nur Software erkennen ---------------- */

const GEMISCHT = `Datum;Verwendungszweck;Betrag
15.01.2025;NOTION LABS SUBSCRIPTION;-9,99
15.02.2025;NOTION LABS SUBSCRIPTION;-9,99
03.01.2025;PAYPAL *FRAMER.COM MONTHLY;-15,00
03.02.2025;PAYPAL *FRAMER.COM MONTHLY;-15,00
10.01.2025;FIGMA MONTHLY SUBSCRIPTION;-12,00
01.01.2025;Miete Wohnung Musterstrasse;-850,00
05.01.2025;REWE SAGT DANKE FILIALE 123;-54,20
07.01.2025;Allianz Versicherung Beitrag;-45,00
20.01.2025;FINANZAMT MITTE UMSATZSTEUER;-320,00
22.01.2025;Aral Tankstelle Berlin;-70,30
25.01.2025;Amazon Marktplatz Bestellung;-39,90
28.01.2025;GEHALT Mitarbeiter Mueller;-2400,00`;

describe("Software-Klassifikation im Import", () => {
  const treffer = erkenneAbos(parseCsv(GEMISCHT), []);
  const namen = treffer.map((t) => t.tool.toLowerCase()).join(" | ");

  it("erkennt echte Software-Abos", () => {
    expect(treffer.find((t) => t.tool === "Notion")).toBeTruthy();
    expect(namen).toContain("framer");
    expect(treffer.find((t) => t.tool === "Figma")).toBeTruthy();
  });

  it("filtert Miete, Einkauf, Versicherung, Steuer, Tanken, Gehalt heraus", () => {
    expect(namen).not.toMatch(/miete|rewe|allianz|versicher|finanzamt|aral|tankstelle|gehalt|mitarbeiter/);
  });

  it("verwirft einmalige Posten ohne SaaS-Signal (z. B. Amazon-Bestellung)", () => {
    expect(namen).not.toContain("amazon");
    expect(namen).not.toContain("marktplatz");
  });

  it("liefert nur die echten Tools (kein Rauschen)", () => {
    // Notion, Framer, Figma = 3 Tools, der Rest ist kein Tool.
    expect(treffer.length).toBe(3);
  });
});

/* ---------------- Mehrspaltige CSV: Beguenstigter-Name nicht verlieren ---------------- */

const MEHRSPALTIG = `Buchungstag;Beguenstigter/Zahlungspflichtiger;Verwendungszweck;Betrag
15.01.2025;NOTION LABS INC;Beleg-Nr. 12345;-9,99
20.01.2025;IHK Industrie- und Handelskammer zu Leipzig;Beleg-Nr. 905160627 End-to-End-Ref.: CCB.336.UE.POS00353399;-250,00
10.01.2025;Acme Cloud GmbH;Rechnung 2025-01 Lizenz;-29,00
10.02.2025;Acme Cloud GmbH;Rechnung 2025-02 Lizenz;-29,00`;

describe("Mehrspaltige Bank-CSV (Name + Verwendungszweck)", () => {
  const treffer = erkenneAbos(parseCsv(MEHRSPALTIG), []);
  const namen = treffer.map((t) => t.tool).join(" | ");

  it("liest den Anbieternamen aus der Beguenstigten-Spalte, nicht nur die Beleg-Nr.", () => {
    expect(treffer.find((t) => t.tool === "Notion")).toBeTruthy();
    expect(namen).not.toMatch(/beleg|905160627|12345/i);
  });

  it("filtert die IHK (Kammerbeitrag) als Nicht-Software heraus", () => {
    expect(namen).not.toMatch(/ihk|handelskammer/i);
  });

  it("erkennt ein wiederkehrendes Tool mit SaaS-Signal (Cloud/Lizenz)", () => {
    const acme = treffer.find((t) => /acme/i.test(t.tool));
    expect(acme).toBeTruthy();
    expect(acme!.tool.toLowerCase()).toContain("cloud");
  });

  it("haengt alle Original-Referenzen je Treffer an", () => {
    const acme = treffer.find((t) => /acme/i.test(t.tool))!;
    expect(acme.referenzen.length).toBe(2);
    expect(acme.referenzen.some((r) => r.text.includes("Rechnung 2025-01"))).toBe(true);
  });
});
