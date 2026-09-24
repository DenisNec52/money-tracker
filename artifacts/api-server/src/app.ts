import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import router from "./routes";

export const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:5173" }));
app.use(express.json({ limit: "100kb" }));
app.use("/api", router);

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Endpoint non trovato" });
});

// Express 5 forwards rejected async handlers here.
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({ error: "JSON non valido" });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Errore interno del server" });
};
app.use(errorHandler);
