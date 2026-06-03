import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import {
  getAwsConnectLink,
  submitRoleArn,
} from "../controllers/aws.controller.js";

const router = Router();
router.get("/connect", requireAuth, getAwsConnectLink);
router.post("/role-arn", requireAuth, submitRoleArn);

export default router;
