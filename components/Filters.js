"use client";

import { activeFilterCount } from "@/lib/filters";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";

function Field({ label, htmlFor, children }) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1 block text-xs font-medium text-slate-600"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export default function Filters({
  filters,
  onChange,
  onReset,
  categories,
  cities,
  resultCount,
  totalCount,
  onExport,
}) {
  const active = activeFilterCount(filters);

  function set(key) {
    return (event) => onChange({ ...filters, [key]: event.target.value });
  }

  return (
    <section aria-labelledby="filters-title">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="filters-title" className="text-lg font-semibold text-slate-900">
          Filtres
        </h2>
        <p className="text-sm text-slate-500" aria-live="polite">
          {resultCount} ventes sur {totalCount}
        </p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-white p-4 lg:grid-cols-4">
        <Field label="Du" htmlFor="filter-from">
          <input
            id="filter-from"
            type="date"
            value={filters.from}
            max={filters.to || undefined}
            onChange={set("from")}
            className={inputClass}
          />
        </Field>
        <Field label="Au" htmlFor="filter-to">
          <input
            id="filter-to"
            type="date"
            value={filters.to}
            min={filters.from || undefined}
            onChange={set("to")}
            className={inputClass}
          />
        </Field>
        <Field label="Catégorie" htmlFor="filter-category">
          <select
            id="filter-category"
            value={filters.category}
            onChange={set("category")}
            className={inputClass}
          >
            <option value="">Toutes</option>
            {categories.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Ville" htmlFor="filter-city">
          <select
            id="filter-city"
            value={filters.city}
            onChange={set("city")}
            className={inputClass}
          >
            <option value="">Toutes</option>
            {cities.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </Field>

        <div className="col-span-2 flex flex-wrap items-center gap-3 lg:col-span-4">
          <button
            type="button"
            onClick={onReset}
            disabled={active === 0}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            Réinitialiser{active > 0 ? ` (${active})` : ""}
          </button>
          <button
            type="button"
            onClick={onExport}
            disabled={resultCount === 0}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-40"
          >
            Exporter en CSV
          </button>
        </div>
      </div>
    </section>
  );
}
