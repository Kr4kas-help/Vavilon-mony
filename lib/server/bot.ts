import crypto from 'node:crypto';

export const APP_URL = (process.env.APP_URL || 'https://vavilon-mony.vercel.app').replace(/\/$/, '');

export function webhookSecret(): string {
  const s = process.env.SESSION_SECRET || '';
  return crypto.createHmac('sha256', s).update('tg-webhook').digest('hex');
}

export async function tgApi(method: string, body: Record<string, unknown>) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('NO_BOT_TOKEN');
  const r = await fetch('https://api.telegram.org/bot' + token + '/' + method, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  return (await r.json().catch(() => ({ ok: false }))) as { ok: boolean; description?: string; result?: unknown };
}

export const openButton = {
  inline_keyboard: [[{ text: '🏰 Открыть Money Wise', web_app: { url: APP_URL } }]],
};
