import { Request, Response } from "express";
import { createTelegramLinkCode } from "../services/telegram.service.js";

const BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME!;

export async function getTelegramLink(req: Request, res: Response) {
  const code = await createTelegramLinkCode(req.userId!);
  const link = `https://t.me/${BOT_USERNAME}?start=${code}`;
  return res.json({ link });
}
