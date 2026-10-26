import { mapHeaders } from "./schema.js";

/**
 * Convertit une date texte en "AAAA-MM-JJ".
 * Formats acceptés : 2025-03-14, 14/03/2025, 14-03-2025, 14.03.2025
 * Retourne null si la date est invalide.
 */
export function parseDate(value) {
  const text = String(value ?? "").trim();
  if (!text) return null;

  let year, month, day;

  let match = text.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (match) {
    [, year, month, day] = match;
  } else {
    match = text.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
    if (!match) return null;
    [, day, month, year] = match;
  }

  const y = Number(year);
  const m = Number(month);
  const d = Number(day);
  const date = new Date(Date.UTC(y, m - 1, d));

  // Vérifie que la date existe vraiment (ex. refuse le 31/02)
  if (
    date.getUTCFullYear() !== y ||
    date.getUTCMonth() !== m - 1 ||
    date.getUTCDate() !== d
  ) {
    return null;
  }

  return `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(
    d
  ).padStart(2, "0")}`;
}

/**
 * Convertit un nombre texte en nombre.
 * Gère "1 250,50", "1250.5", "12 500 FCFA".
 * Retourne null si invalide.
 */
export function parseNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  let text = String(value ?? "").trim();
  if (!text) return null;

  text = text
    .replace(/[^\d,.\-\s]/g, "") // retire devises et lettres
    .replace(/\s/g, ""); // retire les espaces (séparateurs de milliers)

  // Si la virgule est le séparateur décimal : "1250,50" -> "1250.50"
  if (text.includes(",") && !text.includes(".")) {
    text = text.replace(",", ".");
  } else {
    text = text.replace(/,/g, "");
  }

  if (text === "" || text === "-" || text === ".") return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

/** Nettoie un texte : espaces superflus retirés, première lettre en majuscule. */
export function cleanText(value) {
  const text = String(value ?? "").trim().replace(/\s+/g, " ");
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/** Met une majuscule à chaque mot : "saint-louis" -> "Saint-Louis". */
export function cleanTitle(value) {
  const text = String(value ?? "").trim().replace(/\s+/g, " ");
  return text
    .toLowerCase()
    .replace(/(^|[\s-])(\p{L})/gu, (_, sep, letter) => sep + letter.toUpperCase());
}

/**
 * Nettoie et valide les lignes brutes d'un CSV de ventes.
 *
 * Retourne :
 *  - rows    : lignes propres { id, date, product, category, quantity, price, city, total }
 *  - report  : statistiques de qualité (lignes lues, gardées, rejetées, doublons...)
 *  - missingColumns : colonnes obligatoires absentes (si non vide, rows est vide)
 */
export function cleanSalesData(headers, rawRows) {
  const { mapping, missing } = mapHeaders(headers);

  const report = {
    totalRows: rawRows.length,
    keptRows: 0,
    removedRows: 0,
    duplicates: 0,
    reasons: {
      missingValues: 0,
      invalidDate: 0,
      invalidQuantity: 0,
      invalidPrice: 0,
    },
    dateRange: null,
  };

  if (missing.length > 0) {
    return { rows: [], report, missingColumns: missing };
  }

  const seen = new Set();
  const rows = [];

  for (const raw of rawRows) {
    const dateValue = raw[mapping.date];
    const product = cleanText(raw[mapping.product]);
    const category = cleanText(raw[mapping.category]);
    const city = cleanTitle(raw[mapping.city]);

    if (!String(dateValue ?? "").trim() || !product || !category || !city) {
      report.reasons.missingValues++;
      continue;
    }

    const date = parseDate(dateValue);
    if (!date) {
      report.reasons.invalidDate++;
      continue;
    }

    const quantity = parseNumber(raw[mapping.quantity]);
    if (quantity === null || quantity <= 0 || !Number.isInteger(quantity)) {
      report.reasons.invalidQuantity++;
      continue;
    }

    const price = parseNumber(raw[mapping.price]);
    if (price === null || price < 0) {
      report.reasons.invalidPrice++;
      continue;
    }

    // Détection des doublons (même ligne exacte déjà vue)
    const key = [date, product, category, quantity, price, city].join("|");
    if (seen.has(key)) {
      report.duplicates++;
      continue;
    }
    seen.add(key);

    rows.push({
      id: rows.length + 1,
      date,
      product,
      category,
      quantity,
      price,
      city,
      total: quantity * price,
    });
  }

  rows.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  rows.forEach((row, index) => {
    row.id = index + 1;
  });

  report.keptRows = rows.length;
  report.removedRows = report.totalRows - rows.length;
  if (rows.length > 0) {
    report.dateRange = { from: rows[0].date, to: rows[rows.length - 1].date };
  }

  return { rows, report, missingColumns: [] };
}
