import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { getTelegramLink } from "../controllers/telegram.controller.js";
import { telegramWebhook } from "../controllers/telegramWebhook.controller.js";

const router = Router();

router.get("/link", requireAuth, getTelegramLink);
router.post("/webhook", telegramWebhook);

export default router;
