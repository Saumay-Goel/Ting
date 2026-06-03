import { Router } from "express";
import { handleSnsNotification } from "../controllers/sns.controller.js";

const router = Router();

router.post("/", handleSnsNotification);

export default router;
