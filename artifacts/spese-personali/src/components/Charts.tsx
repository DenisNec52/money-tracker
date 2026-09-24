import type { CategoryTotal, MonthlyStat } from "@workspace/api-client-react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART_COLORS } from "../lib/categories";
import { formatEuro, monthShort } from "../lib/format";

const compactEuro = new Intl.NumberFormat("it-IT", { notation: "compact", style: "currency", currency: "EUR" });

const cardCls = "rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200";
const tooltipStyle = { borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" };
const euroTooltip = (value: unknown) => formatEuro(Number(value));

function ChartSkeleton() {
  return (
    <div className={cardCls}>
      <div className="mb-4 h-7 w-48 animate-pulse rounded bg-slate-100" />
      <div className="h-[280px] animate-pulse rounded-lg bg-slate-100" />
    </div>
  );
}

export function MonthlyBarChart({ data, year, selectedMonth, isLoading }: {
  data?: MonthlyStat[];
  year: number;
  selectedMonth?: number;
  isLoading: boolean;
}) {
  if (isLoading) return <ChartSkeleton />;

  const chartData = data?.map((d) => ({ ...d, name: monthShort(d.month) }));
  // Dim the months outside the selected one, so the chart still shows the whole year for context.
  const opacity = (month: number) => (selectedMonth === undefined || selectedMonth === month ? 1 : 0.35);

  return (
    <div className={cardCls}>
      <h3 className="mb-4 text-lg font-semibold text-slate-900">Entrate e uscite {year}</h3>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} tick={{ fill: "#64748b" }} />
            <YAxis
              width={70}
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#64748b" }}
              tickFormatter={(v: number) => compactEuro.format(v)}
            />
            <Tooltip cursor={{ fill: "#f1f5f9" }} contentStyle={tooltipStyle} formatter={euroTooltip} />
            <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: 20, fontSize: 12 }} />
            <Bar dataKey="entrate" name="Entrate" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={24}>
              {chartData?.map((d) => <Cell key={`e-${d.month}`} fillOpacity={opacity(d.month)} />)}
            </Bar>
            <Bar dataKey="uscite" name="Uscite" fill="#e11d48" radius={[4, 4, 0, 0]} maxBarSize={24}>
              {chartData?.map((d) => <Cell key={`u-${d.month}`} fillOpacity={opacity(d.month)} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function CategoryPieChart({ data, isLoading }: { data?: CategoryTotal[]; isLoading: boolean }) {
  if (isLoading) return <ChartSkeleton />;

  return (
    <div className={cardCls}>
      <h3 className="mb-4 text-lg font-semibold text-slate-900">Uscite per categoria</h3>
      <div className="flex h-[280px] items-center justify-center">
        {!data?.length ? (
          <p className="text-slate-500">Nessuna uscita nel periodo</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="total" nameKey="category" innerRadius={60} outerRadius={100} paddingAngle={2} stroke="none">
                {data.map((d, i) => (
                  <Cell key={d.category} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={euroTooltip} />
              <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: 13, paddingLeft: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

/** Both charts together: default export so App can lazy-load recharts in its own chunk. */
export default function ChartsPanel({ monthly, categories, year, selectedMonth, monthlyLoading, categoriesLoading }: {
  monthly?: MonthlyStat[];
  categories?: CategoryTotal[];
  year: number;
  selectedMonth?: number;
  monthlyLoading: boolean;
  categoriesLoading: boolean;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <MonthlyBarChart data={monthly} year={year} selectedMonth={selectedMonth} isLoading={monthlyLoading} />
      <CategoryPieChart data={categories} isLoading={categoriesLoading} />
    </div>
  );
}
