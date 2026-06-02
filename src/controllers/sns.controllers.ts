import { Request, Response } from "express";
import { sendTelegram } from "../services/telegram.services.js";
import { diagnose } from "../services/diagnosis.services.js";

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

      const diagnosis = await diagnose(alarmInput);

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
