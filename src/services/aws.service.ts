import { prisma } from "../utils/prisma.js";
import { generateToken } from "../utils/tokens.js";

export async function createAwsConnectionLink(userId: string) {
  const externalId = `ting-${generateToken().slice(0, 12)}`;

  const connection = await prisma.awsConnection.create({
    data: {
      userId,
      externalId,
      roleArn: "",
    },
  });

  const templateUrl = process.env.TEMPLATE_URL!;
  const tingAccountId = process.env.TING_ACCOUNT_ID!;

  const launchUrl =
    `https://console.aws.amazon.com/cloudformation/home?region=us-east-1#/stacks/create/review` +
    `?templateURL=${encodeURIComponent(templateUrl)}` +
    `&stackName=ting-connection` +
    `&param_TingAccountId=${tingAccountId}` +
    `&param_ExternalId=${externalId}`;

  return { connectionId: connection.id, externalId, launchUrl };
}

export async function saveRoleArn(
  connectionId: string,
  userId: string,
  roleArn: string,
) {
  const connection = await prisma.awsConnection.findFirst({
    where: { id: connectionId, userId },
  });
  if (!connection) throw new Error("Connection not found");

  return prisma.awsConnection.update({
    where: { id: connectionId },
    data: { roleArn },
  });
}
