import {
  CloudWatchLogsClient,
  FilterLogEventsCommand,
} from "@aws-sdk/client-cloudwatch-logs";
import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";

const region = process.env.AWS_REGION;

// STS client uses your backend's base creds (ting-logreader) from env
const sts = new STSClient({ region });

// Assume the given role and return a CloudWatch Logs client scoped to it.
async function getLogsClientForRole(
  roleArn: string,
  externalId: string,
): Promise<CloudWatchLogsClient> {
  const assumed = await sts.send(
    new AssumeRoleCommand({
      RoleArn: roleArn,
      RoleSessionName: "ting-log-session",
      ExternalId: externalId,
      DurationSeconds: 900, // 15 min — plenty for a fetch
    }),
  );

  const creds = assumed.Credentials;
  if (!creds) throw new Error("AssumeRole returned no credentials");

  // New client using the TEMPORARY credentials from the assumed role
  return new CloudWatchLogsClient({
    region,
    credentials: {
      accessKeyId: creds.AccessKeyId!,
      secretAccessKey: creds.SecretAccessKey!,
      sessionToken: creds.SessionToken!,
    },
  });
}

export async function fetchRecentLogs(
  logGroupName: string,
  roleArn: string,
  externalId: string,
  aroundTime: Date = new Date(),
  windowMinutes = 15,
): Promise<string> {
  const end = aroundTime.getTime();
  const start = end - windowMinutes * 60 * 1000;

  try {
    const client = await getLogsClientForRole(roleArn, externalId);

    const res = await client.send(
      new FilterLogEventsCommand({
        logGroupName,
        startTime: start,
        endTime: end,
        limit: 50,
      }),
    );

    const events = res.events ?? [];
    if (events.length === 0) return "";

    return events
      .map((e) => e.message?.trim())
      .filter(Boolean)
      .join("\n");
  } catch (err) {
    console.error("Log fetch failed:", err);
    return "";
  }
}
