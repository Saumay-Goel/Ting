import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../services/auth.service.js";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const token = header.slice(7);
  try {
    const { userId } = verifyToken(token);
    req.userId = userId;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
