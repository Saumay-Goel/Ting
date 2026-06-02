import express from "express";
import dotenv from "dotenv";
dotenv.config();
const app = express();
app.use(express.json());
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
async function sendTelegram(text) {
    const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: CHAT_ID, text }),
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Telegram error: ${res.status} ${err}`);
    }
}
app.get("/", (_req, res) => {
    res.send("Server is running");
});
app.get("/test", async (_req, res) => {
    try {
        await sendTelegram("Hello from your backend! The pipeline works.");
        res.send("Message sent — check Telegram.");
    }
    catch (err) {
        console.error(err);
        res.status(500).send("Failed to send. Check server logs.");
    }
});
const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, "0.0.0.0", () => console.log(`Listening on port ${PORT}`));
