/**
 * RSVP → Google Sheets
 *
 * Aquest codi va dins del Google Sheet (Extensions → Apps Script), no a la web.
 * Cada confirmació del formulari s'afegeix com una fila nova a la pestanya
 * "Confirmacions". Vegeu el README → "Amb Google Sheets" per als passos.
 */

const SHEET_NAME = "Confirmacions";

// Ordre de les columnes. Els noms de l'esquerra són els "name" del formulari.
const COLUMNS = [
  ["data", "Data"],
  ["nom", "Nom i cognoms"],
  ["email", "Correu"],
  ["assistencia", "Vindrà?"],
  ["acompanyants", "Acompanyants"],
  ["noms_acompanyants", "Noms dels acompanyants"],
  ["transport", "Autocar"],
  ["dieta", "Restriccions alimentàries"],
  ["canco", "Cançó"]
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const p = (e && e.parameter) || {};
    if (p._gotcha) return ok_(); // trampa antispam

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(COLUMNS.map(([, title]) => title));
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight("bold");
    }

    const coming = String(p.assistencia || "").indexOf("Sí") === 0;
    sheet.appendRow(COLUMNS.map(([key]) => {
      if (key === "data") return new Date();
      // Si no ve, els detalls no compten (encara que el formulari els enviï)
      if (!coming && ["acompanyants", "noms_acompanyants", "transport", "dieta", "canco"].indexOf(key) > -1) return "";
      return p[key] || "";
    }));
    return ok_();
  } finally {
    lock.releaseLock();
  }
}

// Per comprovar que el desplegament funciona: obriu l'URL al navegador.
function doGet() {
  return ContentService.createTextOutput("RSVP de Gemma & Ray: funciona.");
}

function ok_() {
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
