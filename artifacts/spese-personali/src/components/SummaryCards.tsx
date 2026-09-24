import type { Summary } from "@workspace/api-client-react";
import clsx from "clsx";
import { TrendingDown, TrendingUp, Wallet, type LucideIcon } from "lucide-react";
import { formatEuro } from "../lib/format";

function Card({ label, value, icon: Icon, tone, isLoading }: {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: "pos" | "neg";
  isLoading: boolean;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">{label}</span>
        <Icon className={clsx("h-5 w-5", tone === "pos" ? "text-emerald-600" : "text-rose-600")} />
      </div>
      {isLoading ? (
        <div className="mt-3 h-8 w-32 animate-pulse rounded bg-slate-200" />
      ) : (
        <p className={clsx("mt-2 text-2xl font-semibold", tone === "pos" ? "text-emerald-600" : "text-rose-600")}>
          {formatEuro(value)}
        </p>
      )}
    </div>
  );
}

export function SummaryCards({ summary, isLoading }: { summary?: Summary; isLoading: boolean }) {
  const saldo = summary?.saldo ?? 0;
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card label="Entrate" value={summary?.entrate ?? 0} icon={TrendingUp} tone="pos" isLoading={isLoading} />
      <Card label="Uscite" value={summary?.uscite ?? 0} icon={TrendingDown} tone="neg" isLoading={isLoading} />
      <Card label="Saldo" value={saldo} icon={Wallet} tone={saldo >= 0 ? "pos" : "neg"} isLoading={isLoading} />
    </div>
  );
}
