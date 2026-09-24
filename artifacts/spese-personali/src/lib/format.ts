const euro = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" });

export const formatEuro = (value: number) => euro.format(value);

export const MONTHS = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
] as const;

export const monthShort = (month: number) => MONTHS[month - 1]?.slice(0, 3) ?? "";

/** "2026-09-02" -> "02/09/2026" without timezone shifts (no Date parsing). */
export const formatDate = (iso: string) => iso.split("-").reverse().join("/");

/** Today's date as YYYY-MM-DD in local time. */
export const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
