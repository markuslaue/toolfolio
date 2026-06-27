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
