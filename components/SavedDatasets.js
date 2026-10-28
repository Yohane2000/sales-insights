"use client";

import { formatDate, formatNumber } from "@/lib/format";

export default function SavedDatasets({ datasets, onLoad, onDelete, busy }) {
  return (
    <section aria-labelledby="saved-title">
      <div className="section-head">
        <h2 id="saved-title" className="section-title">
          Mes jeux de données
        </h2>
      </div>

      {datasets.length === 0 ? (
        <p className="section-meta">
          Aucun jeu de données enregistré pour l&apos;instant.
        </p>
      ) : (
        <ul className="panel saved-list">
          {datasets.map((dataset) => (
            <li key={dataset.id} className="saved-item">
              <div>
                <p className="saved-name">{dataset.name}</p>
                <p className="saved-meta">
                  {formatNumber(dataset.row_count)} lignes, enregistré le{" "}
                  {formatDate(dataset.created_at.slice(0, 10))}
                </p>
              </div>
              <div className="saved-actions">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onLoad(dataset)}
                  className="btn btn-primary btn-small"
                >
                  Ouvrir
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onDelete(dataset)}
                  className="btn btn-secondary btn-small"
                >
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
