import { formatCurrency, formatNumber } from "@/lib/format";

function Card({ label, value, hint, trend }) {
  const trendStyle =
    trend === "up"
      ? "text-emerald-700"
      : trend === "down"
      ? "text-red-700"
      : "text-slate-500";
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
        {value}
      </p>
      {hint && <p className={`mt-1 text-xs ${trendStyle}`}>{hint}</p>}
    </div>
  );
}

export default function KpiCards({ kpis }) {
  let growthValue = "—";
  let growthHint = "Au moins deux mois de données requis";
  let trend = "flat";
  if (kpis.growth !== null) {
    const arrow = kpis.growth >= 0 ? "▲" : "▼";
    const sign = kpis.growth >= 0 ? "+" : "";
    growthValue = `${sign}${kpis.growth.toFixed(1).replace(".", ",")} %`;
    growthHint = `${arrow} ${kpis.growthLabel}`;
    trend = kpis.growth >= 0 ? "up" : "down";
  }

  return (
    <section aria-labelledby="kpi-title">
      <h2 id="kpi-title" className="text-lg font-semibold text-slate-900">
        Indicateurs clés
      </h2>
      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Card label="Chiffre d'affaires" value={formatCurrency(kpis.revenue)} />
        <Card label="Nombre de ventes" value={formatNumber(kpis.salesCount)} />
        <Card
          label="Panier moyen"
          value={formatCurrency(Math.round(kpis.averageBasket))}
        />
        <Card label="Unités vendues" value={formatNumber(kpis.units)} />
        <Card
          label="Croissance mensuelle"
          value={growthValue}
          hint={growthHint}
          trend={trend}
        />
      </div>
    </section>
  );
}
