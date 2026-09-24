# Gestione Spese Personali

App full-stack per gestire entrate e uscite personali: grafici mensili, uscite per categoria, riepilogo del periodo e filtro per mese/anno. UI in italiano.

**Stack:** pnpm monorepo · TypeScript · Express 5 · PostgreSQL + Drizzle ORM · Zod · OpenAPI 3.1 + Orval · React 19 · React Query · Tailwind CSS v4 · Recharts

## Avvio rapido

Requisiti: Node 22+, pnpm, Docker.

```bash
cp .env.example .env
pnpm install
pnpm db:up       # Postgres in Docker sulla porta 5433
pnpm db:push     # crea le tabelle dallo schema Drizzle
pnpm db:seed     # (facoltativo) dati demo per l'anno corrente
pnpm dev         # API su :3001, frontend su http://localhost:5173
```

## Architettura

```
lib/api-spec/          openapi.yaml = unica fonte del contratto API
  └─ pnpm codegen ──►  lib/api-zod/          schemi Zod (validazione lato server)
                   └►  lib/api-client-react/ hook React Query tipizzati (frontend)
lib/db/                schema Drizzle + connessione Postgres
artifacts/api-server/  Express 5, route in src/routes/, bundle esbuild
artifacts/spese-personali/  React + Vite
scripts/               seed del database
```

Per cambiare un endpoint si modifica `openapi.yaml` e si lancia `pnpm codegen`: server e client restano allineati e `pnpm typecheck` segnala ogni punto da aggiornare.

## API

| Metodo | Percorso | Descrizione |
| --- | --- | --- |
| GET | `/api/transactions?year&month` | movimenti del periodo |
| POST | `/api/transactions` | nuovo movimento |
| DELETE | `/api/transactions/:id` | elimina movimento |
| GET | `/api/summary?year&month` | entrate, uscite, saldo, uscite per categoria |
| GET | `/api/stats/monthly?year` | entrate/uscite per ognuno dei 12 mesi |

`month` è facoltativo: se manca vale l'intero anno.

## Scelte tecniche

- **Importi `numeric(12,2)`** in Postgres: somme esatte al centesimo, niente errori di virgola mobile sui totali.
- **Periodi con fine esclusiva** (`date >= primo del mese AND date < primo del mese successivo`): nessun caso limite su mesi da 28-31 giorni, usa l'indice su `date`.
- **Errori HTTP → `ApiError`**: il fetcher del client lancia sulle risposte non 2xx, così React Query le gestisce come errori tipizzati.
- **Grafici caricati in lazy**: recharts (~400 kB) è in un chunk separato, lista e form compaiono subito.

## Deploy

**API + database su Render** (`render.yaml`): Dashboard Render → *New* → *Blueprint* → seleziona il repo. Crea Postgres e il web service `spese-api`; lo schema viene applicato a fine build (`pnpm db:push`).

**Frontend su Vercel** (`vercel.json`): *Add New Project* → importa il repo lasciando la **root del repo** come Root Directory. Le chiamate `/api/*` sono inoltrate a Render da una rewrite: stesso dominio, niente CORS, niente variabili d'ambiente lato client.

> Se Render assegna un URL diverso da `spese-api.onrender.com`, aggiornalo nella rewrite di `vercel.json`.
> Limiti del piano free Render: il servizio si sospende dopo 15 minuti di inattività (la prima richiesta impiega circa 30-50 s) e il Postgres free scade dopo 30 giorni. Alternativa gratuita per il DB: Neon (basta impostare `DATABASE_URL`).

## Script

`pnpm build` · `pnpm typecheck` · `pnpm codegen` · `pnpm db:push` · `pnpm db:seed`

---
Ricostruito dal progetto originale Replit (config e specifiche in `_replit_originale/`).
