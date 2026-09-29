import { Router } from "express";
import { evaluateVitals, listExecutions } from "../controllers/monitoring.controller.js";

const router = Router();

router.post("/evaluate", evaluateVitals);
router.get("/executions", listExecutions);

export default router;
