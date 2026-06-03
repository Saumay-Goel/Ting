import { prisma } from "../utils/prisma.js";
import { Intent } from "./botIntent.service.js";
import { Prisma } from "@prisma/client";

export async function handleIntent(
  intent: Intent,
  userId: string,
): Promise<any> {
  switch (intent.type) {
    case "recent_alerts": {
      const where: any = { userId };
      if (intent.severity) where.severity = intent.severity.toLowerCase();
      const alerts = await prisma.alert.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: Math.min(intent.limit ?? 5, 10),
        select: {
          alarmName: true,
          severity: true,
          summary: true,
          createdAt: true,
        },
      });
      return { kind: "recent_alerts", alerts };
    }

    case "alert_detail": {
      const alerts = await prisma.alert.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          alarmName: true,
          severity: true,
          summary: true,
          cause: true,
          steps: true,
          createdAt: true,
        },
      });
      return { kind: "alert_detail", descriptor: intent.descriptor, alerts };
    }

    case "status": {
      const connection = await prisma.awsConnection.findFirst({
        where: { userId },
      });
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { telegramChatId: true, tier: true, emailVerified: true },
      });
      const recentCount = await prisma.alert.count({
        where: {
          userId,
          createdAt: { gte: new Date(Date.now() - 24 * 3600 * 1000) },
        },
      });
      return {
        kind: "status",
        awsConnected: !!connection?.roleArn,
        telegramLinked: !!user?.telegramChatId,
        tier: user?.tier,
        alertsLast24h: recentCount,
      };
    }

    case "stats": {
      const total = await prisma.alert.count({ where: { userId } });
      const bySeverity = await prisma.alert.groupBy({
        by: [Prisma.AlertScalarFieldEnum.severity],
        where: { userId },
        _count: true,
      });
      return { kind: "stats", total, bySeverity, timeframe: intent.timeframe };
    }

    case "help":
      return { kind: "help" };
    case "greeting":
      return { kind: "greeting" };

    case "unrelated":
    default:
      return { kind: "unrelated" };
  }
}
