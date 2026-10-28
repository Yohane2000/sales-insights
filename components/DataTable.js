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
      <div className="section-head">
        <h2 id="table-title" className="section-title">
          Données nettoyées
        </h2>
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Rechercher un produit, une ville…"
          aria-label="Rechercher dans le tableau"
          className="input search"
        />
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
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
                    className={numeric ? "num" : undefined}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSort(key)}
                      className="sort-button"
                    >
                      {COLUMN_LABELS[key]}
                      <span aria-hidden="true" className="sort-mark">
                        {active ? (sort.direction === "asc" ? "▲" : "▼") : ""}
                      </span>
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.id}>
                {COLUMNS.map(({ key, numeric, render }) => (
                  <td
                    key={key}
                    className={
                      [numeric ? "num" : "", key === "total" ? "total" : ""]
                        .filter(Boolean)
                        .join(" ") || undefined
                    }
                  >
                    {render ? render(row[key]) : row[key]}
                  </td>
                ))}
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className="empty">
                  Aucun résultat pour cette recherche.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <div className="group">
          <label htmlFor="page-size">Lignes par page</label>
          <select
            id="page-size"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="input select-small"
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

        <div className="group">
          <button
            type="button"
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="btn btn-secondary btn-small"
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
            className="btn btn-secondary btn-small"
          >
            Suivant
          </button>
        </div>
      </div>
    </section>
  );
}
