import {
  createTransactionBody,
  deleteTransactionParams,
  getMonthlyStatsQueryParams,
  getSummaryQueryParams,
  listTransactionsQueryParams,
} from "@workspace/api-zod";
import { db, transactions } from "@workspace/db";
import { and, desc, eq, gte, lt, sql, type SQL } from "drizzle-orm";
import { Router, type Response } from "express";
import type { z } from "zod";

const router = Router();

/** Parses `input` or sends a 400 and returns null. */
function validate<S extends z.ZodTypeAny>(schema: S, input: unknown, res: Response): z.infer<S> | null {
  const result = schema.safeParse(input);
  if (!result.success) {
    res.status(400).json({ error: "Dati non validi", details: result.error.flatten() });
    return null;
  }
  return result.data;
}

/** Date range for a month or a whole year: `from` inclusive, `to` exclusive. */
export function periodRange(year: number, month?: number): { from: string; to: string } {
  if (!month) return { from: `${year}-01-01`, to: `${year + 1}-01-01` };
  const pad = (n: number) => String(n).padStart(2, "0");
  const [nextYear, nextMonth] = month === 12 ? [year + 1, 1] : [year, month + 1];
  return { from: `${year}-${pad(month)}-01`, to: `${nextYear}-${pad(nextMonth)}-01` };
}

const inPeriod = (year: number, month?: number): SQL | undefined => {
  const { from, to } = periodRange(year, month);
  return and(gte(transactions.date, from), lt(transactions.date, to));
};

// float8 cast: pg returns numeric aggregates as strings, float8 as JS numbers.
const sumOf = (type: "entrata" | "uscita") =>
  sql<number>`coalesce(sum(${transactions.amount}) filter (where ${transactions.type} = ${type}), 0)::float8`;

const round2 = (n: number) => Math.round(n * 100) / 100;

router.get("/transactions", async (req, res) => {
  const q = validate(listTransactionsQueryParams, req.query, res);
  if (!q) return;

  const rows = await db
    .select()
    .from(transactions)
    .where(inPeriod(q.year, q.month))
    .orderBy(desc(transactions.date), desc(transactions.id));
  res.json(rows);
});

router.post("/transactions", async (req, res) => {
  const body = validate(createTransactionBody, req.body, res);
  if (!body) return;

  const [row] = await db
    .insert(transactions)
    .values({
      ...body,
      amount: round2(body.amount),
      category: body.category.trim(),
      description: body.description?.trim() ?? "",
    })
    .returning();
  res.status(201).json(row);
});

router.delete("/transactions/:id", async (req, res) => {
  const params = validate(deleteTransactionParams, req.params, res);
  if (!params) return;

  const [deleted] = await db.delete(transactions).where(eq(transactions.id, params.id)).returning({ id: transactions.id });
  if (!deleted) {
    res.status(404).json({ error: "Movimento non trovato" });
    return;
  }
  res.status(204).end();
});

router.get("/summary", async (req, res) => {
  const q = validate(getSummaryQueryParams, req.query, res);
  if (!q) return;
  const period = inPeriod(q.year, q.month);

  const [[totals], categories] = await Promise.all([
    db.select({ entrate: sumOf("entrata"), uscite: sumOf("uscita") }).from(transactions).where(period),
    db
      .select({ category: transactions.category, total: sql<number>`sum(${transactions.amount})::float8` })
      .from(transactions)
      .where(and(period, eq(transactions.type, "uscita")))
      .groupBy(transactions.category)
      .orderBy(desc(sql`sum(${transactions.amount})`)),
  ]);

  const entrate = totals?.entrate ?? 0;
  const uscite = totals?.uscite ?? 0;
  res.json({
    entrate: round2(entrate),
    uscite: round2(uscite),
    saldo: round2(entrate - uscite),
    uscitePerCategoria: categories.map((c) => ({ category: c.category, total: round2(c.total) })),
  });
});

router.get("/stats/monthly", async (req, res) => {
  const q = validate(getMonthlyStatsQueryParams, req.query, res);
  if (!q) return;

  const monthExpr = sql<number>`extract(month from ${transactions.date})::int`;
  const rows = await db
    .select({ month: monthExpr, entrate: sumOf("entrata"), uscite: sumOf("uscita") })
    .from(transactions)
    .where(inPeriod(q.year))
    .groupBy(monthExpr);

  // Always 12 entries so the bar chart has a stable x-axis.
  const byMonth = new Map(rows.map((r) => [r.month, r]));
  res.json(
    Array.from({ length: 12 }, (_, i) => {
      const r = byMonth.get(i + 1);
      return { month: i + 1, entrate: round2(r?.entrate ?? 0), uscite: round2(r?.uscite ?? 0) };
    }),
  );
});

export default router;
