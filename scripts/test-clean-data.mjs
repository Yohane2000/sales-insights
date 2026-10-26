// Vérifie la logique de nettoyage sur le CSV de démo.
// Lancer avec : npm run test:clean
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import Papa from "papaparse";
import {
  cleanSalesData,
  parseDate,
  parseNumber,
  cleanTitle,
} from "../lib/cleanData.js";

// --- Tests unitaires ---
assert.equal(parseDate("2025-03-14"), "2025-03-14");
assert.equal(parseDate("14/03/2025"), "2025-03-14");
assert.equal(parseDate("2025-02-30"), null);
assert.equal(parseDate(""), null);
assert.equal(parseNumber("1 250,50"), 1250.5);
assert.equal(parseNumber("12 500 FCFA"), 12500);
assert.equal(parseNumber("n/a"), null);
assert.equal(cleanTitle("saint-louis"), "Saint-Louis");
assert.equal(cleanTitle("  thiès "), "Thiès");

// --- Test sur le fichier de démo ---
const csv = readFileSync(new URL("../public/demo-sales.csv", import.meta.url), "utf8");
const parsed = Papa.parse(csv, { header: true, skipEmptyLines: "greedy" });
const { rows, report, missingColumns } = cleanSalesData(
  parsed.meta.fields,
  parsed.data
);

assert.deepEqual(missingColumns, []);
assert.equal(report.totalRows, 800);
assert.equal(report.duplicates, 1);
assert.equal(report.reasons.missingValues, 2); // date manquante + ville manquante
assert.equal(report.reasons.invalidDate, 1);
assert.equal(report.reasons.invalidQuantity, 1);
assert.equal(report.reasons.invalidPrice, 1);
assert.equal(report.keptRows + report.removedRows, report.totalRows);
assert.ok(rows.some((r) => r.city === "Dakar" && r.date === "2025-07-15"));
assert.ok(rows.every((r) => r.total === r.quantity * r.price));

// Colonnes manquantes
const bad = cleanSalesData(["date", "produit"], [{ date: "2025-01-01", produit: "x" }]);
assert.ok(bad.missingColumns.length > 0);

console.log("Tous les tests passent.");
console.log(report);
