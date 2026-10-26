"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/format";
import { revenueBy, revenueByMonth, topProducts } from "@/lib/analytics";

// Une seule série par graphique : une seule couleur (bleu), l'identité
// est portée par les libellés des axes, pas par la couleur.
const SERIES = "#2a78d6";
const GRID = "#e2e8f0";
const AXIS_TEXT = "#475569";

const compact = new Intl.NumberFormat("fr-FR", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function ChartCard({ title, description, children }) {
  return (
    <figure className="rounded-xl border border-slate-200 bg-white p-4">
      <figcaption className="mb-3">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        {description && (
          <p className="text-xs text-slate-500">{description}</p>
        )}
      </figcaption>
      {children}
    </figure>
  );
}

function MoneyTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-slate-900">{label ?? payload[0].payload.name}</p>
      <p className="mt-0.5 tabular-nums text-slate-600">
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}

function HorizontalBars({ data, height }) {
  return (
    <div style={{ height }} role="img" aria-label="Graphique en barres horizontales">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 16, bottom: 4, left: 8 }}
        >
          <CartesianGrid horizontal={false} stroke={GRID} />
          <XAxis
            type="number"
            tickFormatter={(v) => compact.format(v)}
            tick={{ fill: AXIS_TEXT, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={130}
            tick={{ fill: AXIS_TEXT, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<MoneyTooltip />} cursor={{ fill: "#f1f5f9" }} />
          <Bar
            dataKey="revenue"
            fill={SERIES}
            radius={[0, 4, 4, 0]}
            maxBarSize={22}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function Charts({ rows }) {
  const monthly = useMemo(() => revenueByMonth(rows), [rows]);
  const categories = useMemo(() => revenueBy(rows, "category"), [rows]);
  const cities = useMemo(() => revenueBy(rows, "city"), [rows]);
  const products = useMemo(() => topProducts(rows, 5), [rows]);

  return (
    <section aria-labelledby="charts-title">
      <h2 id="charts-title" className="text-lg font-semibold text-slate-900">
        Graphiques
      </h2>

      <div className="mt-3 grid gap-4 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <ChartCard
            title="Évolution du chiffre d'affaires"
            description="Total des ventes par mois"
          >
            <div
              style={{ height: 280 }}
              role="img"
              aria-label="Courbe du chiffre d'affaires par mois"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthly}
                  margin={{ top: 8, right: 16, bottom: 4, left: 0 }}
                >
                  <CartesianGrid vertical={false} stroke={GRID} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: AXIS_TEXT, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    minTickGap={16}
                  />
                  <YAxis
                    tickFormatter={(v) => compact.format(v)}
                    tick={{ fill: AXIS_TEXT, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={48}
                  />
                  <Tooltip content={<MoneyTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke={SERIES}
                    strokeWidth={2}
                    dot={{ r: 4, fill: SERIES, stroke: "#ffffff", strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        <ChartCard
          title="Ventes par catégorie"
          description="Chiffre d'affaires total"
        >
          <HorizontalBars data={categories} height={Math.max(180, categories.length * 44)} />
        </ChartCard>

        <ChartCard title="Ventes par ville" description="Chiffre d'affaires total">
          <HorizontalBars data={cities} height={Math.max(180, cities.length * 44)} />
        </ChartCard>

        <div className="lg:col-span-2">
          <ChartCard
            title="Top 5 des produits"
            description="Par chiffre d'affaires"
          >
            <HorizontalBars data={products} height={Math.max(180, products.length * 44)} />
          </ChartCard>
        </div>
      </div>
    </section>
  );
}
