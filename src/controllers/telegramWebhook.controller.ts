import { Request, Response } from "express";
import {
  linkTelegramChat,
  sendTelegramTo,
} from "../services/telegram.service.js";

export async function telegramWebhook(req: Request, res: Response) {
  try {
    const update = req.body;
    const message = update.message;
    if (!message || !message.text) return res.sendStatus(200);

    const chatId = String(message.chat.id);
    const text = message.text.trim();

    if (text.startsWith("/start")) {
      const parts = text.split(" ");
      const code = parts[1];

      if (code) {
        const user = await linkTelegramChat(code, chatId);
        if (user) {
          await sendTelegramTo(
            chatId,
            `✅ Linked! Your account (${user.email}) will now receive alerts here.`,
          );
        } else {
          await sendTelegramTo(
            chatId,
            "❌ Invalid or expired link code. Generate a new one from the dashboard.",
          );
        }
      } else {
        await sendTelegramTo(
          chatId,
          "👋 Welcome to Ting! Connect your account from the dashboard to link this chat.",
        );
      }
    }

    return res.sendStatus(200);
  } catch (err) {
    console.error("Telegram webhook error:", err);
    return res.sendStatus(200);
  }
}
