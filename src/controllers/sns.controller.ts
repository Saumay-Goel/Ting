import { Request, Response } from "express";
import { sendTelegramTo } from "../services/telegram.service.js";
import { diagnose } from "../services/diagnosis.service.js";
import { fetchRecentLogs, inferLogGroup } from "../services/logs.service.js";
import { getConnectionByAccountId } from "../services/aws.service.js";
import { saveAlert } from "../services/alert.service.js";

export async function handleSnsNotification(req: Request, res: Response) {
  const msg = req.body;

  if (msg.Type === "SubscriptionConfirmation") {
    await fetch(msg.SubscribeURL);
    console.log("SNS subscription confirmed");
    return res.sendStatus(200);
  }

  if (msg.Type === "Notification") {
    try {
      const alarm = JSON.parse(msg.Message);
      const accountId = alarm.AWSAccountId;

      const connection = await getConnectionByAccountId(accountId);
      if (!connection || !connection.roleArn) {
        console.warn(`No connection found for account ${accountId}`);
        return res.sendStatus(200);
      }

      const user = connection.user;

      const alarmInput = {
        alarmName: alarm.AlarmName,
        state: alarm.NewStateValue,
        reason: alarm.NewStateReason,
      };

      // Infer the log group; fetch logs only if we can determine one
      const logGroup = inferLogGroup(alarm);
      let logs = "";
      if (logGroup) {
        logs = await fetchRecentLogs(
          logGroup,
          connection.roleArn,
          connection.externalId,
          new Date(alarm.StateChangeTime || Date.now()),
        );
      }

      const diagnosis = await diagnose(alarmInput, logs);
      await saveAlert({
        userId: user.id,
        alarmName: alarmInput.alarmName,
        state: alarmInput.state,
        reason: alarmInput.reason,
        awsAccountId: accountId,
        region: alarm.Region,
        logsSnippet: logs ? logs.slice(0, 5000) : undefined, // cap stored log size
        diagnosis,
      });

      const text =
        `🚨 ${diagnosis.summary}\n` +
        `Alarm: ${alarmInput.alarmName}\n` +
        `Severity: ${diagnosis.severity.toUpperCase()}\n\n` +
        `🔍 Likely cause:\n${diagnosis.cause}\n\n` +
        `🔧 Fix steps:\n` +
        diagnosis.steps.map((s, i) => `${i + 1}. ${s}`).join("\n");

      if (user.telegramChatId) {
        await sendTelegramTo(user.telegramChatId, text);
      } else {
        console.warn(`User ${user.id} has no linked Telegram chat`);
      }
    } catch (err) {
      console.error("Notification handling failed:", err);
    }
    return res.sendStatus(200);
  }

  return res.sendStatus(200);
}
