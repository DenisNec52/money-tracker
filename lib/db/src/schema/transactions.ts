import { date, index, numeric, pgEnum, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const transactionType = pgEnum("transaction_type", ["entrata", "uscita"]);

export const transactions = pgTable(
  "transactions",
  {
    id: serial("id").primaryKey(),
    type: transactionType("type").notNull(),
    // numeric keeps exact cents in Postgres (SUM included); mode "number" maps it to a JS number.
    amount: numeric("amount", { precision: 12, scale: 2, mode: "number" }).notNull(),
    category: text("category").notNull(),
    description: text("description").notNull().default(""),
    date: date("date", { mode: "string" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("transactions_date_idx").on(t.date)],
);

export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true });
export const selectTransactionSchema = createSelectSchema(transactions);

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
