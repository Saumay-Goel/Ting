import crypto from "node:crypto";

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function expiryFromNow(hours: number): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}
