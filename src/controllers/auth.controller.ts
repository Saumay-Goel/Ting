import { Request, Response } from "express";
import { sendVerificationEmail } from "../services/email.service.js";
import { verifyEmailToken } from "../services/auth.service.js";
import { sendWelcomeEmail } from "../services/email.service.js";
import {
  createPasswordReset,
  resetPassword,
} from "../services/auth.service.js";
import {
  getGoogleAuthUrl,
  getGoogleProfile,
  getGithubAuthUrl,
  getGithubProfile,
} from "../services/oauth.service.js";
import { findOrCreateOAuthUser } from "../services/auth.service.js";
import { sendPasswordResetEmail } from "../services/email.service.js";

import {
  registerUser,
  loginUser,
  signToken,
} from "../services/auth.service.js";

export async function register(req: Request, res: Response) {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }
    const user = await registerUser(email, password, name);

    if (user.verifyToken) {
      await sendVerificationEmail(user.email, user.verifyToken);
    }
    const token = signToken(user.id);
    return res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }
    const user = await loginUser(email, password);
    const token = signToken(user.id);
    return res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err: any) {
    return res.status(401).json({ error: err.message });
  }
}

export async function verifyEmail(req: Request, res: Response) {
  try {
    const token = req.query.token as string;
    if (!token) return res.status(400).send("Missing token");

    const user = await verifyEmailToken(token);
    await sendWelcomeEmail(user.email, user.name ?? undefined);

    return res.send("Email verified! You can now log in.");
  } catch (err: any) {
    return res.status(400).send(err.message);
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const result = await createPasswordReset(email);
    if (result) {
      await sendPasswordResetEmail(result.user.email, result.resetToken);
    }
    return res.json({
      message: "If that email exists, a reset link was sent.",
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}

export async function resetPasswordHandler(req: Request, res: Response) {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: "Token and new password required" });
    }
    await resetPassword(token, password);
    return res.json({
      message: "Password reset successful. You can now log in.",
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}

export function googleLogin(_req: Request, res: Response) {
  res.redirect(getGoogleAuthUrl());
}
export function githubLogin(_req: Request, res: Response) {
  res.redirect(getGithubAuthUrl());
}

export async function googleCallback(req: Request, res: Response) {
  try {
    const code = req.query.code as string;
    if (!code) return res.status(400).send("Missing code");
    const profile = await getGoogleProfile(code);
    const user = await findOrCreateOAuthUser({
      provider: "google",
      ...profile,
    });
    const token = signToken(user.id);
    return res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err: any) {
    return res.status(400).send(`Google auth failed: ${err.message}`);
  }
}

export async function githubCallback(req: Request, res: Response) {
  try {
    const code = req.query.code as string;
    if (!code) return res.status(400).send("Missing code");
    const profile = await getGithubProfile(code);
    const user = await findOrCreateOAuthUser({
      provider: "github",
      ...profile,
    });
    const token = signToken(user.id);
    return res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err: any) {
    return res.status(400).send(`GitHub auth failed: ${err.message}`);
  }
}
