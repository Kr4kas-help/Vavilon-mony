import { APP_URL, tgApi, webhookSecret } from '@/lib/server/bot';
import { j } from '@/lib/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Настраивает бота: вебхук, кнопку меню с Mini App и команды. Безопасно вызывать много раз.
export async function GET() {
  try {
    const webhook = await tgApi('setWebhook', {
      url: APP_URL + '/api/bot',
      secret_token: webhookSecret(),
      allowed_updates: ['message'],
      drop_pending_updates: true,
    });
    const menu = await tgApi('setChatMenuButton', {
      menu_button: { type: 'web_app', text: 'Открыть', web_app: { url: APP_URL } },
    });
    const commands = await tgApi('setMyCommands', {
      commands: [{ command: 'start', description: 'Открыть Money Wise' }],
    });
    return j({ webhook, menu, commands });
  } catch (e) {
    return j({ error: String((e as Error)?.message || e) }, 500);
  }
}
