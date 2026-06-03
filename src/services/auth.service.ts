import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateToken, expiryFromNow } from "../utils/tokens.js";
import { prisma } from "../utils/prisma.js";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function registerUser(
  email: string,
  password: string,
  name?: string,
) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("Email already registered");

  const passwordHash = await bcrypt.hash(password, 12);
  const verifyToken = generateToken();

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      verifyToken,
      verifyTokenExpiry: expiryFromNow(24),
    },
  });
  return user;
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) throw new Error("Invalid credentials");

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new Error("Invalid credentials");

  return user;
}

export function signToken(userId: string) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { userId: string } {
  return jwt.verify(token, JWT_SECRET) as { userId: string };
}

export async function verifyEmailToken(token: string) {
  const user = await prisma.user.findUnique({ where: { verifyToken: token } });
  if (!user) throw new Error("Invalid verification token");
  if (user.verifyTokenExpiry && user.verifyTokenExpiry < new Date()) {
    throw new Error("Verification token expired");
  }

  return prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, verifyToken: null, verifyTokenExpiry: null },
  });
}

export async function createPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  const resetToken = generateToken();
  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken, resetTokenExpiry: expiryFromNow(1) }, // 1h expiry
  });
  return { user, resetToken };
}

export async function resetPassword(token: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { resetToken: token } });
  if (!user) throw new Error("Invalid reset token");
  if (user.resetTokenExpiry && user.resetTokenExpiry < new Date()) {
    throw new Error("Reset token expired");
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  return prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, resetToken: null, resetTokenExpiry: null },
  });
}

export async function findOrCreateOAuthUser(params: {
  provider: "google" | "github";
  providerId: string;
  email: string;
  name?: string;
}) {
  const { provider, providerId, email, name } = params;

  let user;
  if (provider === "google") {
    user = await prisma.user.findUnique({ where: { googleId: providerId } });
  } else {
    user = await prisma.user.findUnique({ where: { githubId: providerId } });
  }

  if (user) return user;

  user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    if (provider === "google") {
      return prisma.user.update({
        where: { id: user.id },
        data: { googleId: providerId, emailVerified: true },
      });
    }

    return prisma.user.update({
      where: { id: user.id },
      data: { githubId: providerId, emailVerified: true },
    });
  }

  if (provider === "google") {
    return prisma.user.create({
      data: {
        email,
        name,
        googleId: providerId,
        emailVerified: true,
      },
    });
  }

  return prisma.user.create({
    data: {
      email,
      name,
      githubId: providerId,
      emailVerified: true,
    },
  });
}
