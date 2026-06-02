import {
  CloudWatchLogsClient,
  FilterLogEventsCommand,
} from "@aws-sdk/client-cloudwatch-logs";

const client = new CloudWatchLogsClient({ region: process.env.AWS_REGION });

export async function fetchRecentLogs(
  logGroupName: string,
  aroundTime: Date = new Date(),
  windowMinutes = 15,
): Promise<string> {
  const end = aroundTime.getTime();
  const start = end - windowMinutes * 60 * 1000;

  try {
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
