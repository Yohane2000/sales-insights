/**
 * Schéma attendu pour le fichier de ventes.
 * Chaque colonne a un nom canonique et une liste d'alias acceptés
 * (français / anglais), ce qui rend l'import tolérant.
 */
export const COLUMNS = {
  date: ["date", "jour", "order_date", "date_vente", "date_commande"],
  product: ["product", "produit", "article", "item", "product_name"],
  category: ["category", "categorie", "catégorie", "famille", "type"],
  quantity: ["quantity", "quantite", "quantité", "qty", "qte", "qté"],
  price: ["price", "prix", "prix_unitaire", "unit_price", "pu"],
  city: ["city", "ville", "localite", "localité", "location"],
};

export const REQUIRED_COLUMNS = Object.keys(COLUMNS);

/** Libellés affichés dans l'interface. */
export const COLUMN_LABELS = {
  date: "Date",
  product: "Produit",
  category: "Catégorie",
  quantity: "Quantité",
  price: "Prix unitaire",
  city: "Ville",
  total: "Total",
};

/**
 * Normalise un en-tête : minuscules, sans accents, sans espaces superflus.
 * "Catégorie " -> "categorie"
 */
export function normalizeHeader(header) {
  return String(header ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[\s-]+/g, "_");
}

/**
 * Associe les en-têtes du fichier aux colonnes canoniques.
 * Retourne { mapping, missing } où mapping[nomCanonique] = en-tête d'origine.
 */
export function mapHeaders(headers) {
  const normalizedAliases = Object.fromEntries(
    Object.entries(COLUMNS).map(([key, aliases]) => [
      key,
      aliases.map(normalizeHeader),
    ])
  );

  const mapping = {};
  for (const header of headers) {
    const normalized = normalizeHeader(header);
    for (const [key, aliases] of Object.entries(normalizedAliases)) {
      if (!mapping[key] && aliases.includes(normalized)) {
        mapping[key] = header;
      }
    }
  }

  const missing = REQUIRED_COLUMNS.filter((key) => !mapping[key]);
  return { mapping, missing };
}
