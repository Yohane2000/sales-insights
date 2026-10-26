// Export des lignes affichées en CSV, ouvrable directement dans Excel (France).

const HEADER = ["date", "produit", "categorie", "quantite", "prix", "ville", "total"];

function escapeCell(value) {
  const text = String(value);
  return /[";\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Construit le texte CSV (séparateur « ; », avec BOM pour les accents dans Excel). */
export function buildCsv(rows) {
  const lines = rows.map((row) =>
    [row.date, row.product, row.category, row.quantity, row.price, row.city, row.total]
      .map(escapeCell)
      .join(";")
  );
  return "﻿" + [HEADER.join(";"), ...lines].join("\r\n") + "\r\n";
}

/** Déclenche le téléchargement du fichier dans le navigateur. */
export function downloadCsv(rows, fileName = "ventes-filtrees.csv") {
  const blob = new Blob([buildCsv(rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
