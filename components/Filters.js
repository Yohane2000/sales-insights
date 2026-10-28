"use client";

import { activeFilterCount } from "@/lib/filters";

function Field({ label, htmlFor, children }) {
  return (
    <div className="field">
      <label htmlFor={htmlFor} className="field-label">
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
    <section aria-labelledby="filters-title" className="panel toolbar">
      <h2 id="filters-title" className="visually-hidden">
        Filtres
      </h2>

      <Field label="Du" htmlFor="filter-from">
        <input
          id="filter-from"
          type="date"
          value={filters.from}
          max={filters.to || undefined}
          onChange={set("from")}
          className="input"
        />
      </Field>
      <Field label="Au" htmlFor="filter-to">
        <input
          id="filter-to"
          type="date"
          value={filters.to}
          min={filters.from || undefined}
          onChange={set("to")}
          className="input"
        />
      </Field>
      <Field label="Catégorie" htmlFor="filter-category">
        <select
          id="filter-category"
          value={filters.category}
          onChange={set("category")}
          className="input"
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
          className="input"
        >
          <option value="">Toutes</option>
          {cities.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </Field>

      <div className="toolbar-end">
        <p className="toolbar-count" aria-live="polite">
          {resultCount} ventes sur {totalCount}
        </p>
        <button
          type="button"
          onClick={onReset}
          disabled={active === 0}
          className="btn btn-secondary"
        >
          Réinitialiser{active > 0 ? ` (${active})` : ""}
        </button>
        <button
          type="button"
          onClick={onExport}
          disabled={resultCount === 0}
          className="btn btn-primary"
        >
          Exporter en CSV
        </button>
      </div>
    </section>
  );
}
