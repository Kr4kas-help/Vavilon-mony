import { tgApi, openButton, webhookSecret } from '@/lib/server/bot';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    if (req.headers.get('x-telegram-bot-api-secret-token') !== webhookSecret()) {
      return new Response('forbidden', { status: 403 });
    }
    const u = await req.json().catch(() => null);
    const m = u?.message;
    const chat = m?.chat?.id;
    if (chat && m?.chat?.type === 'private') {
      const name = m.from?.first_name ? ', ' + m.from.first_name : '';
      await tgApi('sendMessage', {
        chat_id: chat,
        text:
          'Добро пожаловать' + name + '! 👋\n\nMoney Wise поможет выбраться из долгов, собрать план и накопить на мечту. Нажмите кнопку ниже.',
        reply_markup: openButton,
      });
    }
  } catch {}
  return new Response('ok');
}
