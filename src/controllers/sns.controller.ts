import { Request, Response } from "express";
import { sendTelegram } from "../services/telegram.service.js";
import { diagnose } from "../services/diagnosis.service.js";
import { fetchRecentLogs } from "../services/logs.service.js";
const TEST_ROLE_ARN = process.env.TEST_ROLE_ARN!;
const TEST_EXTERNAL_ID = process.env.TEST_EXTERNAL_ID!;

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
      const alarmInput = {
        alarmName: alarm.AlarmName,
        state: alarm.NewStateValue,
        reason: alarm.NewStateReason,
      };

      const logs = await fetchRecentLogs(
        "/aws/lambda/ting-test-fn",
        TEST_ROLE_ARN,
        TEST_EXTERNAL_ID,
        new Date(alarm.StateChangeTime || Date.now()),
      );

      const diagnosis = await diagnose(alarmInput, logs);

      const text =
        `🚨 ${diagnosis.summary}\n` +
        `Alarm: ${alarmInput.alarmName}\n` +
        `Severity: ${diagnosis.severity.toUpperCase()}\n\n` +
        `🔍 Likely cause:\n${diagnosis.cause}\n\n` +
        `🔧 Fix steps:\n` +
        diagnosis.steps.map((s, i) => `${i + 1}. ${s}`).join("\n");

      await sendTelegram(text);
    } catch (err) {
      console.error("Diagnosis/notification failed:", err);
      await sendTelegram(`🚨 AWS notification:\n${msg.Message}`);
    }

    return res.sendStatus(200);
  }

  return res.sendStatus(200);
}
