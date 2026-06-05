import { Router } from "express";
import { listAlerts } from "../controllers/user.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/alerts", requireAuth, listAlerts);

export default router;
