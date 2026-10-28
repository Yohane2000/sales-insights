"use client";

import { useMemo, useState } from "react";
import Filters from "@/components/Filters";
import KpiCards from "@/components/KpiCards";
import { Breakdowns, MonthlyChart } from "@/components/Charts";
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

  const reset = () => setFilters(EMPTY_FILTERS);

  return (
    <>
      <Filters
        filters={filters}
        onChange={setFilters}
        onReset={reset}
        categories={categories}
        cities={cities}
        resultCount={filtered.length}
        totalCount={rows.length}
        onExport={() => downloadCsv(filtered)}
      />

      {filtered.length === 0 ? (
        <div className="panel empty-state">
          <p>Aucune vente ne correspond à ces filtres.</p>
          <button type="button" onClick={reset} className="btn btn-secondary">
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <>
          <div className="overview">
            <KpiCards kpis={kpis} />
            <MonthlyChart rows={filtered} bare />
          </div>
          <Breakdowns rows={filtered} />
          <DataTable rows={filtered} />
        </>
      )}
    </>
  );
}
