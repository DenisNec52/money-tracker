// Replaces ALL transactions with a deterministic demo dataset for the current year (up to today).
import { db, pool, transactions, type NewTransaction } from "@workspace/db";

const year = new Date().getFullYear();
const lastMonth = new Date().getMonth() + 1;
const iso = (m: number, d: number) => `${year}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

// Small deterministic variation so months differ but reruns give the same data.
const vary = (base: number, m: number, k: number) => Math.round(base * (1 + (((m * 7 + k * 3) % 11) - 5) / 50) * 100) / 100;

const rows: NewTransaction[] = [];
for (let m = 1; m <= lastMonth; m++) {
  rows.push(
    { type: "entrata", amount: 1850, category: "Stipendio", description: "Stipendio mensile", date: iso(m, 1) },
    { type: "uscita", amount: 650, category: "Affitto", date: iso(m, 3) },
    { type: "uscita", amount: vary(95, m, 1), category: "Bollette", description: "Luce e gas", date: iso(m, 12) },
    { type: "uscita", amount: vary(320, m, 2), category: "Spesa", description: "Supermercato", date: iso(m, 15) },
    { type: "uscita", amount: vary(60, m, 3), category: "Trasporti", description: "Carburante", date: iso(m, 18) },
    { type: "uscita", amount: 12.99, category: "Abbonamenti", description: "Streaming", date: iso(m, 20) },
    { type: "uscita", amount: vary(80, m, 4), category: "Svago", date: iso(m, 25) },
  );
  if (m % 3 === 0) rows.push({ type: "entrata", amount: vary(400, m, 5), category: "Freelance", description: "Sito web cliente", date: iso(m, 22) });
}

await db.delete(transactions);
await db.insert(transactions).values(rows);
console.log(`Seed completato: ${rows.length} movimenti per il ${year}.`);
await pool.end();
