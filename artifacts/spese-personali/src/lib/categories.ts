import type { TransactionType } from "@workspace/api-client-react";

export const CATEGORIES: Record<TransactionType, string[]> = {
  entrata: ["Stipendio", "Freelance", "Rimborsi", "Regali", "Altro"],
  uscita: ["Affitto", "Bollette", "Spesa", "Trasporti", "Salute", "Svago", "Abbonamenti", "Abbigliamento", "Altro"],
};

// Stable palette for the pie chart, cycled by index.
export const CHART_COLORS = ["#6366f1", "#f43f5e", "#f59e0b", "#10b981", "#0ea5e9", "#a855f7", "#ec4899", "#84cc16", "#64748b"];
