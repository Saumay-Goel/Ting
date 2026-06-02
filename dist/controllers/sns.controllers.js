import { sendTelegram } from "../services/telegram.services.js";
export async function handleSnsNotification(req, res) {
    const msg = req.body;
    if (msg.Type === "SubscriptionConfirmation") {
        await fetch(msg.SubscribeURL);
        console.log("SNS subscription confirmed");
        return res.sendStatus(200);
    }
    if (msg.Type === "Notification") {
        try {
            const alarm = JSON.parse(msg.Message);
            const text = `🚨 AWS Alarm: ${alarm.AlarmName}\n` +
                `State: ${alarm.NewStateValue}\n` +
                `Reason: ${alarm.NewStateReason}`;
            await sendTelegram(text);
        }
        catch {
            await sendTelegram(`🚨 AWS notification:\n${msg.Message}`);
        }
        return res.sendStatus(200);
    }
    return res.sendStatus(200);
}
