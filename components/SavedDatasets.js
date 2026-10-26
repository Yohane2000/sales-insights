"use client";

import { formatDate, formatNumber } from "@/lib/format";

export default function SavedDatasets({ datasets, onLoad, onDelete, busy }) {
  return (
    <section aria-labelledby="saved-title">
      <h2 id="saved-title" className="text-lg font-semibold text-slate-900">
        Mes jeux de données
      </h2>

      {datasets.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">
          Aucun jeu de données sauvegardé pour l&apos;instant.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {datasets.map((dataset) => (
            <li
              key={dataset.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium text-slate-900">{dataset.name}</p>
                <p className="text-xs text-slate-500">
                  {formatNumber(dataset.row_count)} lignes · enregistré le{" "}
                  {formatDate(dataset.created_at.slice(0, 10))}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onLoad(dataset)}
                  className="rounded-md bg-indigo-600 px-3 py-1.5 text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  Ouvrir
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onDelete(dataset)}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
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
