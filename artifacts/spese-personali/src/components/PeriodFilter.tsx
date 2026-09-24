import { MONTHS } from "../lib/format";
import type { Period } from "../lib/period";

const selectCls =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

export function PeriodFilter({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="flex gap-2">
      <select
        aria-label="Mese"
        value={value.month ?? ""}
        onChange={(e) => onChange({ ...value, month: e.target.value ? Number(e.target.value) : undefined })}
        className={selectCls}
      >
        <option value="">Tutto l'anno</option>
        {MONTHS.map((name, i) => (
          <option key={name} value={i + 1}>
            {name}
          </option>
        ))}
      </select>
      <select
        aria-label="Anno"
        value={value.year}
        onChange={(e) => onChange({ ...value, year: Number(e.target.value) })}
        className={selectCls}
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}
