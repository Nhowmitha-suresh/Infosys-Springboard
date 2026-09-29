import { Router } from "express";
import {
  listRules,
  getRule,
  createRule,
  updateRule,
  deleteRule,
} from "../controllers/rules.controller.js";

const router = Router();

router.get("/", listRules);
router.get("/:id", getRule);
router.post("/", createRule);
router.patch("/:id", updateRule);
router.delete("/:id", deleteRule);

export default router;
