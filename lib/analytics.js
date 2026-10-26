// Calculs d'indicateurs à partir des lignes nettoyées.
// Aucune dépendance à React : facile à tester.

const MONTHS = [
  "janv.", "févr.", "mars", "avr.", "mai", "juin",
  "juil.", "août", "sept.", "oct.", "nov.", "déc.",
];

/** "2025-03" -> "mars 2025" */
export function monthLabel(monthKey) {
  const [year, month] = monthKey.split("-");
  return `${MONTHS[Number(month) - 1]} ${year}`;
}

/** Liste continue de mois entre deux clés "AAAA-MM" (inclus). */
function monthRange(from, to) {
  const result = [];
  let [year, month] = from.split("-").map(Number);
  const [endYear, endMonth] = to.split("-").map(Number);
  while (year < endYear || (year === endYear && month <= endMonth)) {
    result.push(`${year}-${String(month).padStart(2, "0")}`);
    month++;
    if (month > 12) {
      month = 1;
      year++;
    }
  }
  return result;
}

/** Chiffre d'affaires par mois, sans trou (un mois sans vente vaut 0). */
export function revenueByMonth(rows) {
  if (rows.length === 0) return [];
  const totals = new Map();
  for (const row of rows) {
    const key = row.date.slice(0, 7);
    totals.set(key, (totals.get(key) ?? 0) + row.total);
  }
  const keys = [...totals.keys()].sort();
  return monthRange(keys[0], keys[keys.length - 1]).map((key) => ({
    month: key,
    label: monthLabel(key),
    revenue: totals.get(key) ?? 0,
  }));
}

/** Total des ventes regroupé par une colonne (category, city, product), du plus grand au plus petit. */
export function revenueBy(rows, key) {
  const totals = new Map();
  for (const row of rows) {
    totals.set(row[key], (totals.get(row[key]) ?? 0) + row.total);
  }
  return [...totals.entries()]
    .map(([name, revenue]) => ({ name, revenue }))
    .sort((a, b) => b.revenue - a.revenue);
}

/** Les n meilleurs produits par chiffre d'affaires. */
export function topProducts(rows, n = 5) {
  return revenueBy(rows, "product").slice(0, n);
}

/**
 * Indicateurs clés.
 * - growth : évolution du dernier mois par rapport au précédent (en %),
 *   ou null s'il y a moins de deux mois ou si le mois précédent vaut 0.
 */
export function computeKpis(rows) {
  const revenue = rows.reduce((sum, row) => sum + row.total, 0);
  const units = rows.reduce((sum, row) => sum + row.quantity, 0);
  const salesCount = rows.length;
  const averageBasket = salesCount > 0 ? revenue / salesCount : 0;

  const months = revenueByMonth(rows);
  let growth = null;
  let growthLabel = null;
  if (months.length >= 2) {
    const last = months[months.length - 1];
    const previous = months[months.length - 2];
    if (previous.revenue > 0) {
      growth = ((last.revenue - previous.revenue) / previous.revenue) * 100;
      growthLabel = `${last.label} vs ${previous.label}`;
    }
  }

  return { revenue, units, salesCount, averageBasket, growth, growthLabel };
}
