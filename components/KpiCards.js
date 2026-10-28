import { formatCurrency, formatNumber } from "@/lib/format";

function Item({ label, value, hint, trend }) {
  return (
    <div className="kpi-item">
      <dt>{label}</dt>
      <dd className={trend ? `kpi-${trend}` : undefined}>
        {value}
        {hint && <p className="kpi-hint">{hint}</p>}
      </dd>
    </div>
  );
}

/**
 * Bloc des indicateurs : le chiffre d'affaires en grand,
 * les quatre autres indicateurs dessous.
 */
export default function KpiCards({ kpis }) {
  let growthValue = "—";
  let growthHint = "Au moins deux mois de données requis";
  let trend = null;
  if (kpis.growth !== null) {
    const arrow = kpis.growth >= 0 ? "▲" : "▼";
    const sign = kpis.growth >= 0 ? "+" : "";
    growthValue = `${arrow} ${sign}${kpis.growth.toFixed(1).replace(".", ",")} %`;
    growthHint = kpis.growthLabel;
    trend = kpis.growth >= 0 ? "up" : "down";
  }

  return (
    <section aria-labelledby="kpi-title" className="kpi-board">
      <h2 id="kpi-title" className="visually-hidden">
        Indicateurs clés
      </h2>

      <div>
        <p className="kpi-hero-label">Chiffre d&apos;affaires</p>
        <p className="kpi-hero-value">
          <span>{formatNumber(Math.round(kpis.revenue))}</span>
          <span className="kpi-hero-unit">FCFA</span>
        </p>
      </div>

      <dl className="kpi-list">
        <Item label="Nombre de ventes" value={formatNumber(kpis.salesCount)} />
        <Item
          label="Panier moyen"
          value={formatCurrency(Math.round(kpis.averageBasket))}
        />
        <Item label="Unités vendues" value={formatNumber(kpis.units)} />
        <Item
          label="Croissance mensuelle"
          value={growthValue}
          hint={growthHint}
          trend={trend}
        />
      </dl>
    </section>
  );
}
