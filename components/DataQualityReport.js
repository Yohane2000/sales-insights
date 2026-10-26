import { formatDate, formatNumber } from "@/lib/format";

function Stat({ label, value, tone = "default" }) {
  const tones = {
    default: "text-slate-900",
    good: "text-emerald-600",
    warn: "text-amber-600",
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-semibold ${tones[tone]}`}>{value}</p>
    </div>
  );
}

export default function DataQualityReport({ report, fileName }) {
  const { reasons } = report;
  const details = [
    ["Valeurs manquantes", reasons.missingValues],
    ["Dates invalides", reasons.invalidDate],
    ["Quantités invalides", reasons.invalidQuantity],
    ["Prix invalides", reasons.invalidPrice],
    ["Doublons", report.duplicates],
  ].filter(([, count]) => count > 0);

  return (
    <section aria-labelledby="quality-title">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="quality-title" className="text-lg font-semibold text-slate-900">
          Qualité des données
        </h2>
        <p className="text-sm text-slate-500">
          Fichier : <span className="font-medium">{fileName}</span>
        </p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Lignes lues" value={formatNumber(report.totalRows)} />
        <Stat
          label="Lignes conservées"
          value={formatNumber(report.keptRows)}
          tone="good"
        />
        <Stat
          label="Lignes retirées"
          value={formatNumber(report.removedRows)}
          tone={report.removedRows > 0 ? "warn" : "default"}
        />
        <Stat
          label="Période"
          value={
            report.dateRange
              ? `${formatDate(report.dateRange.from)} → ${formatDate(
                  report.dateRange.to
                )}`
              : "—"
          }
        />
      </div>

      {details.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2 text-sm">
          {details.map(([label, count]) => (
            <li
              key={label}
              className="rounded-full bg-amber-50 px-3 py-1 text-amber-800 ring-1 ring-amber-200"
            >
              {label} : {formatNumber(count)}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
