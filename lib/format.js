const numberFormatter = new Intl.NumberFormat("fr-FR");

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 0,
});

/** 12500 -> "12 500" */
export function formatNumber(value) {
  return numberFormatter.format(value);
}

/** 12500 -> "12 500 FCFA" */
export function formatCurrency(value, currency = "FCFA") {
  return `${currencyFormatter.format(value)} ${currency}`;
}

/** "2025-03-14" -> "14/03/2025" */
export function formatDate(isoDate) {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}
