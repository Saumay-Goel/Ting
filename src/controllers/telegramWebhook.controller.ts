import { Request, Response } from "express";
import { prisma } from "../utils/prisma.js";
import { sendTyping } from "../services/telegram.service.js";
import {
  linkTelegramChat,
  sendTelegramTo,
} from "../services/telegram.service.js";
import { classifyIntent } from "../services/botIntent.service.js";
import { handleIntent } from "../services/botQuery.service.js";
import { phraseReply } from "../services/botIntent.service.js";

export async function telegramWebhook(req: Request, res: Response) {
  const message = req.body?.message;
  const chatId = message?.chat?.id ? String(message.chat.id) : null;

  try {
    if (!message?.text) return res.sendStatus(200);
    if (!chatId) return res.sendStatus(200);

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
        "Please link your account first from the Ting dashboard.",
      );
      return res.sendStatus(200);
    }

    await sendTyping(chatId);
    const intent = await classifyIntent(text);
    const data = await handleIntent(intent, user.id);

    let reply: string;
    if (data.kind === "greeting") {
      reply =
        "Hi! I'm Ting. Ask me about alerts, incidents, system status, or stats.";
    } else if (data.kind === "unrelated") {
      reply =
        "I can help with AWS alerts, incidents, status, and stats. What would you like to check?";
    } else if (data.kind === "help") {
      reply =
        "I can show alerts, incident details, system status, and stats. Just ask!";
    } else {
      await sendTelegramTo(chatId, "🔍 Looking into that…");
      reply = await phraseReply(data);
    }

    await sendTelegramTo(chatId, reply);
    return res.sendStatus(200);
  } catch (err) {
    console.error("Telegram webhook error:", err);
    if (chatId) {
      await sendTelegramTo(
        chatId,
        "⚠️ Something went wrong on my end. Please try again in a moment.",
      ).catch(() => {});
    }
    return res.sendStatus(200);
  }
}
