import { sql } from '@/lib/server/db';
import { fail, ip, j } from '@/lib/server/http';
import { checkPassword, limited, publicUser, rowToUser, signToken, verifyInitData } from '@/lib/server/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => null);
    const login = String(b?.login ?? '').trim().toLowerCase();
    const password = String(b?.password ?? '');
    if (!login || !password) return j({ error: 'Введите логин и пароль.' }, 400);
    if (await limited('login:' + ip(req) + ':' + login, 10, 600)) {
      return j({ error: 'Слишком много попыток входа. Подождите 10 минут.' }, 429);
    }

    const s = await sql();
    const rows = (await s`SELECT * FROM users WHERE login = ${login} LIMIT 1`) as Record<string, unknown>[];
    const user = rows[0] ? rowToUser(rows[0]) : null;
    if (!user || !user.salt || !user.hash || !checkPassword(password, user.salt, user.hash)) {
      return j({ error: 'Неверный логин или пароль.' }, 401);
    }

    // Вход внутри Telegram привязывает аккаунт Telegram, если он ещё свободен.
    const tg = typeof b?.initData === 'string' ? verifyInitData(b.initData) : null;
    if (tg && !user.tg) {
      const used = (await s`SELECT 1 FROM users WHERE tg = ${String(tg.id)} LIMIT 1`) as unknown[];
      if (used.length === 0) {
        await s`UPDATE users SET tg = ${String(tg.id)}, name = COALESCE(name, ${tg.name}) WHERE id = ${user.id}`;
        user.tg = tg.id;
        user.name = user.name ?? tg.name;
      }
    }
    return j({ token: signToken(user.id), user: publicUser(user) });
  } catch (e) {
    return fail(e);
  }
}
