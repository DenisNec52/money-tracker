import { Router } from "express";
import health from "./health";
import transactions from "./transactions";

const router = Router();
router.use(health);
router.use(transactions);

export default router;
