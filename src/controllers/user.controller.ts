import { Request, Response } from "express";
import { prisma } from "../utils/prisma.js";

export async function getMe(req: Request, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.userId! },
    select: {
      id: true,
      email: true,
      name: true,
      tier: true,
      emailVerified: true,
      telegramChatId: true,
      awsConnections: { select: { id: true, roleArn: true }, take: 1 },
    },
  });
  return res.json({ user });
}

export async function listAlerts(req: Request, res: Response) {
  const alerts = await prisma.alert.findMany({
    where: { userId: req.userId! },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return res.json({ alerts });
}
