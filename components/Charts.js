"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/format";
import { revenueBy, revenueByMonth, topProducts } from "@/lib/analytics";

// Une seule couleur pour les séries (indigo). L'ocre ne sert qu'à
// repérer le mois le plus fort : c'est le seul point à retenir.
const SERIES = "#3547c9";
const PEAK = "#c77d00";
const GRID = "#e6e9f4";
const AXIS_TEXT = "#5b6482";

const compact = new Intl.NumberFormat("fr-FR", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const shorten = (text) =>
  text.length > 24 ? `${text.slice(0, 23)}…` : text;

/** Désactive l'animation des graphiques si la personne l'a demandé. */
function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = (event) => setReduced(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

function ChartCard({ title, description, children, bare = false }) {
  return (
    <figure className={bare ? "chart-card chart-card-bare" : "chart-card"}>
      <figcaption>
        <p className="chart-title">{title}</p>
        {description && <p className="chart-desc">{description}</p>}
      </figcaption>
      <div className="chart-body">{children}</div>
    </figure>
  );
}

function MoneyTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="tooltip">
      <p className="tooltip-title">{label ?? payload[0].payload.name}</p>
      <p className="tooltip-value">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

function HorizontalBars({ data, height, animate }) {
  return (
    <div
      style={{ height }}
      role="img"
      aria-label="Graphique en barres horizontales"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 52, bottom: 4, left: 0 }}
        >
          <CartesianGrid horizontal={false} stroke={GRID} />
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={150}
            tickFormatter={shorten}
            tick={{ fill: AXIS_TEXT, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={<MoneyTooltip />}
            cursor={{ fill: "rgba(53, 71, 201, 0.06)" }}
          />
          <Bar
            dataKey="revenue"
            fill={SERIES}
            radius={[0, 6, 6, 0]}
            maxBarSize={20}
            isAnimationActive={animate}
          >
            <LabelList
              dataKey="revenue"
              position="right"
              formatter={(value) => compact.format(value)}
              style={{ fill: AXIS_TEXT, fontSize: 12 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Chiffre d'affaires par mois, avec le mois le plus fort mis en évidence. */
export function MonthlyChart({ rows, bare = false }) {
  const animate = !useReducedMotion();
  const monthly = useMemo(() => revenueByMonth(rows), [rows]);

  const peak = useMemo(
    () =>
      monthly.reduce(
        (best, month) => (!best || month.revenue > best.revenue ? month : best),
        null
      ),
    [monthly]
  );

  // Si tous les mois sont dans la même année, l'année est inutile sur l'axe.
  const singleYear = new Set(monthly.map((m) => m.month.slice(0, 4))).size === 1;
  const tickLabel = (label) => (singleYear ? label.split(" ")[0] : label);

  return (
    <ChartCard
      bare={bare}
      title="Chiffre d'affaires par mois"
      description={
        peak && monthly.length > 1
          ? `Mois le plus fort : ${peak.label}, ${formatCurrency(peak.revenue)}`
          : "Total des ventes par mois, en FCFA"
      }
    >
      <div
        style={{ height: 300 }}
        role="img"
        aria-label="Histogramme du chiffre d'affaires par mois"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={monthly}
            margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
          >
            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis
              dataKey="label"
              tickFormatter={tickLabel}
              tick={{ fill: AXIS_TEXT, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              minTickGap={8}
            />
            <YAxis
              tickFormatter={(v) => compact.format(v)}
              tick={{ fill: AXIS_TEXT, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip
              content={<MoneyTooltip />}
              cursor={{ fill: "rgba(53, 71, 201, 0.06)" }}
            />
            <Bar
              dataKey="revenue"
              radius={[6, 6, 0, 0]}
              maxBarSize={44}
              isAnimationActive={animate}
            >
              {monthly.map((month) => (
                <Cell
                  key={month.month}
                  fill={month.month === peak?.month ? PEAK : SERIES}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

/** Répartition du chiffre d'affaires : catégories, villes et meilleurs produits. */
export function Breakdowns({ rows }) {
  const animate = !useReducedMotion();
  const categories = useMemo(() => revenueBy(rows, "category"), [rows]);
  const cities = useMemo(() => revenueBy(rows, "city"), [rows]);
  const products = useMemo(() => topProducts(rows, 5), [rows]);

  const heightFor = (data) => Math.max(180, data.length * 44);

  return (
    <section aria-label="Répartition des ventes" className="chart-grid">
      <ChartCard title="Par catégorie" description="Chiffre d'affaires, en FCFA">
        <HorizontalBars
          data={categories}
          height={heightFor(categories)}
          animate={animate}
        />
      </ChartCard>

      <ChartCard title="Par ville" description="Chiffre d'affaires, en FCFA">
        <HorizontalBars
          data={cities}
          height={heightFor(cities)}
          animate={animate}
        />
      </ChartCard>

      <div className="span-2">
        <ChartCard
          title="Top 5 des produits"
          description="Chiffre d'affaires, en FCFA"
        >
          <HorizontalBars
            data={products}
            height={heightFor(products)}
            animate={animate}
          />
        </ChartCard>
      </div>
    </section>
  );
}
