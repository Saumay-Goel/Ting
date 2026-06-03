import { prisma } from "../utils/prisma.js";
import { generateToken } from "../utils/tokens.js";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID!;

export async function sendTelegram(text: string): Promise<void> {
  const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Telegram error: ${res.status} ${err}`);
  }
}
export async function createTelegramLinkCode(userId: string) {
  const code = generateToken().slice(0, 16);
  await prisma.user.update({
    where: { id: userId },
    data: { telegramLinkCode: code },
  });
  return code;
}

export async function linkTelegramChat(code: string, chatId: string) {
  const user = await prisma.user.findUnique({
    where: { telegramLinkCode: code },
  });
  if (!user) return null;

  await prisma.user.update({
    where: { id: user.id },
    data: { telegramChatId: chatId, telegramLinkCode: null }, // consume the code
  });
  return user;
}

export async function sendTelegramTo(
  chatId: string,
  text: string,
): Promise<void> {
  const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  if (!res.ok) console.error("Telegram send failed:", await res.text());
}

export async function sendTyping(chatId: string): Promise<void> {
  const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendChatAction`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, action: "typing" }),
  }).catch(() => {});
}
