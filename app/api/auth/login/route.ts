import { db } from '@/lib/server/redis';
import { fail, ip, j } from '@/lib/server/http';
import { checkPassword, limited, publicUser, signToken, verifyInitData, type User } from '@/lib/server/auth';

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

    const id = await db().get<string>('login:' + login);
    const user = id ? await db().get<User>('user:' + id) : null;
    if (!user || !user.salt || !user.hash || !checkPassword(password, user.salt, user.hash)) {
      return j({ error: 'Неверный логин или пароль.' }, 401);
    }

    // Вход внутри Telegram привязывает аккаунт Telegram, если он ещё свободен.
    const tg = typeof b?.initData === 'string' ? verifyInitData(b.initData) : null;
    if (tg && !user.tg && !(await db().get('tg:' + tg.id))) {
      user.tg = tg.id;
      user.name = user.name ?? tg.name;
      await db().set('tg:' + tg.id, user.id);
      await db().set('user:' + user.id, user);
    }
    return j({ token: signToken(user.id), user: publicUser(user) });
  } catch (e) {
    return fail(e);
  }
}
