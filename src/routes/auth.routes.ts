import { Router } from "express";
import { register, login } from "../controllers/auth.controller.js";
import { verifyEmail } from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { getMe } from "../controllers/user.controller.js";

import {
  forgotPassword,
  resetPasswordHandler,
} from "../controllers/auth.controller.js";
import {
  googleLogin,
  googleCallback,
  githubLogin,
  githubCallback,
} from "../controllers/auth.controller.js";

const router = Router();
router.post("/register", register);
router.post("/login", login);
router.get("/verify", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPasswordHandler);
router.get("/google", googleLogin);
router.get("/google/callback", googleCallback);
router.get("/github", githubLogin);
router.get("/github/callback", githubCallback);
router.get("/me", requireAuth, getMe);

export default router;
