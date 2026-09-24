import type { Transaction } from "@workspace/api-client-react";
import clsx from "clsx";
import { Loader2, Trash2 } from "lucide-react";
import { formatDate, formatEuro } from "../lib/format";

export function TransactionList({ transactions, isLoading, onDelete, deletingId }: {
  transactions?: Transaction[];
  isLoading: boolean;
  onDelete: (id: number) => void;
  deletingId?: number;
}) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="mb-4 flex items-baseline justify-between text-lg font-semibold text-slate-900">
        Movimenti
        {transactions && <span className="text-sm font-normal text-slate-500">{transactions.length}</span>}
      </h2>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      ) : !transactions?.length ? (
        <p className="py-10 text-center text-slate-500">Nessun movimento in questo periodo</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {transactions.map((t) => (
            <li key={t.id} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900">{t.category}</p>
                <p className="truncate text-sm text-slate-500">
                  {formatDate(t.date)}
                  {t.description && ` · ${t.description}`}
                </p>
              </div>
              <span
                className={clsx(
                  "shrink-0 font-semibold tabular-nums",
                  t.type === "entrata" ? "text-emerald-600" : "text-rose-600",
                )}
              >
                {t.type === "entrata" ? "+" : "−"}
                {formatEuro(t.amount)}
              </span>
              <button
                type="button"
                aria-label="Elimina movimento"
                disabled={deletingId === t.id}
                onClick={() => window.confirm("Eliminare questo movimento?") && onDelete(t.id)}
                className="rounded-md p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
              >
                {deletingId === t.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
