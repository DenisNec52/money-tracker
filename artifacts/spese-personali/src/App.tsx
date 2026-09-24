import {
  useCreateTransaction,
  useDeleteTransaction,
  useGetMonthlyStats,
  useGetSummary,
  useListTransactions,
} from "@workspace/api-client-react";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import { PiggyBank } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { PeriodFilter } from "./components/PeriodFilter";
import { SummaryCards } from "./components/SummaryCards";
import { TransactionForm } from "./components/TransactionForm";
import { TransactionList } from "./components/TransactionList";
import type { Period } from "./lib/period";

// recharts is ~400 kB: load it in a separate chunk so the list and form render first.
const ChartsPanel = lazy(() => import("./components/Charts"));

const chartsFallback = (
  <div className="grid gap-6 lg:grid-cols-2">
    <div className="h-[348px] animate-pulse rounded-2xl bg-white ring-1 ring-slate-200" />
    <div className="h-[348px] animate-pulse rounded-2xl bg-white ring-1 ring-slate-200" />
  </div>
);

/**
 * Called after a transaction is created or deleted, to bring the UI back in sync.
 * Three queries show derived data: the list, the summary and the monthly stats.
 * Their keys come from getListTransactionsQueryKey(params), getGetSummaryQueryKey(params)
 * and getGetMonthlyStatsQueryKey(params) — each is ["/api/<path>", params].
 */
function refreshAfterChange(queryClient: QueryClient) {
  // TODO(Denis): choose which queries to invalidate (see notes in chat).
  return queryClient.invalidateQueries();
}

export default function App() {
  const now = new Date();
  const [period, setPeriod] = useState<Period>({ year: now.getFullYear(), month: now.getMonth() + 1 });
  const queryClient = useQueryClient();

  const list = useListTransactions(period);
  const summary = useGetSummary(period);
  const monthly = useGetMonthlyStats({ year: period.year });

  const create = useCreateTransaction({ mutation: { onSuccess: () => refreshAfterChange(queryClient) } });
  const remove = useDeleteTransaction({ mutation: { onSuccess: () => refreshAfterChange(queryClient) } });

  const loadError = list.error ?? summary.error ?? monthly.error;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <PiggyBank className="h-6 w-6 text-indigo-600" />
            Gestione Spese
          </h1>
          <PeriodFilter value={period} onChange={setPeriod} />
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        {loadError && (
          <p role="alert" className="rounded-lg bg-rose-50 p-4 text-rose-700">
            Impossibile caricare i dati: {loadError.message}. Il server API è avviato?
          </p>
        )}

        <SummaryCards summary={summary.data} isLoading={summary.isPending} />

        <Suspense fallback={chartsFallback}>
          <ChartsPanel
            monthly={monthly.data}
            categories={summary.data?.uscitePerCategoria}
            year={period.year}
            selectedMonth={period.month}
            monthlyLoading={monthly.isPending}
            categoriesLoading={summary.isPending}
          />
        </Suspense>

        <div className="grid items-start gap-6 lg:grid-cols-[360px_1fr]">
          <TransactionForm onSubmit={(input) => create.mutateAsync({ data: input })} isPending={create.isPending} />
          <TransactionList
            transactions={list.data}
            isLoading={list.isPending}
            onDelete={(id) => remove.mutate({ id })}
            deletingId={remove.isPending ? remove.variables?.id : undefined}
          />
        </div>
      </main>
    </div>
  );
}
