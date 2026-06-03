import { prisma } from "../utils/prisma.js";

export async function saveAlert(params: {
  userId: string;
  alarmName: string;
  state: string;
  reason?: string;
  awsAccountId?: string;
  region?: string;
  logsSnippet?: string;
  diagnosis: {
    summary: string;
    severity: string;
    cause: string;
    steps: string[];
  };
}) {
  return prisma.alert.create({
    data: {
      userId: params.userId,
      alarmName: params.alarmName,
      state: params.state,
      reason: params.reason,
      awsAccountId: params.awsAccountId,
      region: params.region,
      logsSnippet: params.logsSnippet,
      summary: params.diagnosis.summary,
      severity: params.diagnosis.severity,
      cause: params.diagnosis.cause,
      steps: params.diagnosis.steps,
    },
  });
}
