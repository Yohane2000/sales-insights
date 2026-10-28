import { formatDate, formatNumber } from "@/lib/format";

function Figure({ label, value, text = false }) {
  return (
    <div className="figure">
      <dt>{label}</dt>
      <dd className={text ? "figure-text" : undefined}>{value}</dd>
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

  const keptShare =
    report.totalRows > 0 ? (report.keptRows / report.totalRows) * 100 : 100;
  const isDemo = fileName === "demo-sales.csv";

  return (
    <section aria-labelledby="quality-title" className="panel quality">
      <div className="section-head">
        <h2 id="quality-title" className="section-title">
          Qualité des données
        </h2>
        <p className="section-meta">
          Fichier : <strong>{fileName}</strong>
          {isDemo ? " (données fictives)" : ""}
        </p>
      </div>

      <div
        className="quality-bar"
        role="img"
        aria-label={`${formatNumber(report.keptRows)} lignes conservées sur ${formatNumber(
          report.totalRows
        )}`}
      >
        <div className="quality-bar-kept" style={{ width: `${keptShare}%` }} />
        <div
          className="quality-bar-removed"
          style={{ width: `${100 - keptShare}%` }}
        />
      </div>

      <dl className="quality-figures">
        <Figure label="Lignes lues" value={formatNumber(report.totalRows)} />
        <Figure label="Conservées" value={formatNumber(report.keptRows)} />
        <Figure label="Retirées" value={formatNumber(report.removedRows)} />
        <Figure
          label="Période"
          text
          value={
            report.dateRange
              ? `Du ${formatDate(report.dateRange.from)} au ${formatDate(
                  report.dateRange.to
                )}`
              : "—"
          }
        />
      </dl>

      {details.length > 0 && (
        <ul className="quality-reasons" aria-label="Lignes retirées, par motif">
          {details.map(([label, count]) => (
            <li key={label} className="tag">
              {label} : {formatNumber(count)}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
