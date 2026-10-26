"use client";

import { useMemo, useState } from "react";
import { COLUMN_LABELS } from "@/lib/schema";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";

const COLUMNS = [
  { key: "date", numeric: false, render: (v) => formatDate(v) },
  { key: "product", numeric: false },
  { key: "category", numeric: false },
  { key: "city", numeric: false },
  { key: "quantity", numeric: true, render: (v) => formatNumber(v) },
  { key: "price", numeric: true, render: (v) => formatCurrency(v) },
  { key: "total", numeric: true, render: (v) => formatCurrency(v) },
];

const PAGE_SIZES = [10, 25, 50];

export default function DataTable({ rows }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState({ key: "date", direction: "asc" });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      [row.product, row.category, row.city, row.date].some((value) =>
        String(value).toLowerCase().includes(q)
      )
    );
  }, [rows, query]);

  const sorted = useMemo(() => {
    const factor = sort.direction === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const x = a[sort.key];
      const y = b[sort.key];
      if (typeof x === "number") return (x - y) * factor;
      return String(x).localeCompare(String(y), "fr") * factor;
    });
  }, [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const visible = sorted.slice(start, start + pageSize);

  function toggleSort(key) {
    setSort((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
    setPage(1);
  }

  return (
    <section aria-labelledby="table-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="table-title" className="text-lg font-semibold text-slate-900">
          Données nettoyées
        </h2>
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Rechercher (produit, ville, catégorie…)"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 sm:w-72"
        />
      </div>

      <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              {COLUMNS.map(({ key, numeric }) => {
                const active = sort.key === key;
                return (
                  <th
                    key={key}
                    scope="col"
                    aria-sort={
                      active
                        ? sort.direction === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                    className={`px-4 py-3 font-medium ${
                      numeric ? "text-right" : ""
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSort(key)}
                      className="inline-flex items-center gap-1 hover:text-slate-900"
                    >
                      {COLUMN_LABELS[key]}
                      <span aria-hidden="true" className="text-xs">
                        {active ? (sort.direction === "asc" ? "▲" : "▼") : ""}
                      </span>
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visible.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50">
                {COLUMNS.map(({ key, numeric, render }) => (
                  <td
                    key={key}
                    className={`whitespace-nowrap px-4 py-2.5 ${
                      numeric ? "text-right tabular-nums" : ""
                    }`}
                  >
                    {render ? render(row[key]) : row[key]}
                  </td>
                ))}
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td
                  colSpan={COLUMNS.length}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  Aucun résultat.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <label htmlFor="page-size">Lignes par page</label>
          <select
            id="page-size"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="rounded-md border border-slate-300 bg-white px-2 py-1"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span>
            {sorted.length === 0 ? 0 : start + 1}–
            {Math.min(start + pageSize, sorted.length)} sur{" "}
            {formatNumber(sorted.length)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40"
          >
            Précédent
          </button>
          <span>
            Page {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40"
          >
            Suivant
          </button>
        </div>
      </div>
    </section>
  );
}
