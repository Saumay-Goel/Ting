import { Request, Response } from "express";
import { prisma } from "../utils/prisma.js";
import {
  linkTelegramChat,
  sendTelegramTo,
} from "../services/telegram.service.js";
import { classifyIntent } from "../services/botIntent.service.js";
import { handleIntent } from "../services/botQuery.service.js";
import { phraseReply } from "../services/botIntent.service.js";

export async function telegramWebhook(req: Request, res: Response) {
  try {
    const message = req.body?.message;
    if (!message?.text) return res.sendStatus(200);

    const chatId = String(message.chat.id);
    const text = message.text.trim();

    if (text.startsWith("/start")) {
      const code = text.split(" ")[1];
      if (code) {
        const user = await linkTelegramChat(code, chatId);
        await sendTelegramTo(
          chatId,
          user
            ? `✅ Linked! Your account (${user.email}) will receive alerts here.`
            : "❌ Invalid or expired link code. Generate a new one from the dashboard.",
        );
      } else {
        await sendTelegramTo(
          chatId,
          "👋 Welcome to Ting! Link your account from the dashboard to get started.",
        );
      }
      return res.sendStatus(200);
    }

    const user = await prisma.user.findUnique({
      where: { telegramChatId: chatId },
    });
    if (!user) {
      await sendTelegramTo(
        chatId,
        "Please link your account first from the Ting dashboard, then I can help.",
      );
      return res.sendStatus(200);
    }

    const intent = await classifyIntent(text);
    const data = await handleIntent(intent, user.id);
    const reply = await phraseReply(data);
    await sendTelegramTo(chatId, reply);

    return res.sendStatus(200);
  } catch (err) {
    console.error("Telegram webhook error:", err);
    return res.sendStatus(200);
  }
}
