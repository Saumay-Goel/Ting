const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
export async function sendTelegram(text) {
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
