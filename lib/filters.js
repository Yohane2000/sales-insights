// Filtrage des lignes de ventes. Une valeur vide ("") signifie « tout ».

export const EMPTY_FILTERS = { from: "", to: "", category: "", city: "" };

/** Valeurs distinctes d'une colonne, triées alphabétiquement. */
export function uniqueValues(rows, key) {
  return [...new Set(rows.map((row) => row[key]))].sort((a, b) =>
    String(a).localeCompare(String(b), "fr")
  );
}

/** Applique les filtres. Les dates sont au format "AAAA-MM-JJ" (comparables en texte). */
export function filterRows(rows, filters) {
  const { from, to, category, city } = filters;
  return rows.filter(
    (row) =>
      (!from || row.date >= from) &&
      (!to || row.date <= to) &&
      (!category || row.category === category) &&
      (!city || row.city === city)
  );
}

/** Nombre de filtres actifs (pour afficher « Réinitialiser »). */
export function activeFilterCount(filters) {
  return Object.values(filters).filter(Boolean).length;
}
