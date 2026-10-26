"use client";

import { useMemo, useState } from "react";
import Filters from "@/components/Filters";
import KpiCards from "@/components/KpiCards";
import Charts from "@/components/Charts";
import DataTable from "@/components/DataTable";
import { computeKpis } from "@/lib/analytics";
import { downloadCsv } from "@/lib/exportCsv";
import { EMPTY_FILTERS, filterRows, uniqueValues } from "@/lib/filters";

/**
 * Tableau de bord : les filtres s'appliquent aux KPI, aux graphiques
 * et au tableau en même temps. Utiliser `key` côté parent pour réinitialiser
 * les filtres quand on change de jeu de données.
 */
export default function Dashboard({ rows }) {
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const categories = useMemo(() => uniqueValues(rows, "category"), [rows]);
  const cities = useMemo(() => uniqueValues(rows, "city"), [rows]);
  const filtered = useMemo(() => filterRows(rows, filters), [rows, filters]);
  const kpis = useMemo(() => computeKpis(filtered), [filtered]);

  return (
    <>
      <Filters
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(EMPTY_FILTERS)}
        categories={categories}
        cities={cities}
        resultCount={filtered.length}
        totalCount={rows.length}
        onExport={() => downloadCsv(filtered)}
      />

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-white px-4 py-10 text-center text-slate-500">
          Aucune vente ne correspond à ces filtres.
        </p>
      ) : (
        <>
          <KpiCards kpis={kpis} />
          <Charts rows={filtered} />
          <DataTable rows={filtered} />
        </>
      )}
    </>
  );
}
