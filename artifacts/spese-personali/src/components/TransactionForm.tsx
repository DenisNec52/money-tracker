import type { TransactionInput, TransactionType } from "@workspace/api-client-react";
import clsx from "clsx";
import { Loader2, Plus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { CATEGORIES } from "../lib/categories";
import { todayIso } from "../lib/format";

const inputCls =
  "w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500";

export function TransactionForm({ onSubmit, isPending }: {
  onSubmit: (input: TransactionInput) => Promise<unknown>;
  isPending: boolean;
}) {
  const [type, setType] = useState<TransactionType>("uscita");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CATEGORIES.uscita[0]);
  const [date, setDate] = useState(todayIso);
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const changeType = (next: TransactionType) => {
    setType(next);
    setCategory(CATEGORIES[next][0]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const value = Number(amount.replace(",", "."));
    if (!Number.isFinite(value) || value <= 0) {
      setError("Inserisci un importo valido");
      return;
    }
    setError(null);
    try {
      await onSubmit({ type, amount: value, category, date, description: description.trim() || undefined });
      setAmount("");
      setDescription("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-lg font-semibold text-slate-900">Nuovo movimento</h2>

      <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1" role="radiogroup" aria-label="Tipo">
        {(["uscita", "entrata"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={type === t}
            onClick={() => changeType(t)}
            className={clsx(
              "rounded-md py-2 text-sm font-medium capitalize transition",
              type === t ? (t === "uscita" ? "bg-rose-600 text-white" : "bg-emerald-600 text-white") : "text-slate-600",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <label className="block text-sm text-slate-700">
        Importo (€)
        <input
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0.01"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={clsx(inputCls, "mt-1")}
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm text-slate-700">
          Categoria
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={clsx(inputCls, "mt-1")}>
            {CATEGORIES[type].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-slate-700">
          Data
          <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className={clsx(inputCls, "mt-1")} />
        </label>
      </div>

      <label className="block text-sm text-slate-700">
        Descrizione <span className="text-slate-400">(facoltativa)</span>
        <input
          type="text"
          maxLength={200}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={clsx(inputCls, "mt-1")}
        />
      </label>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        Aggiungi
      </button>
    </form>
  );
}
