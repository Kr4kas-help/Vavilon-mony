import crypto from 'node:crypto';
import { db } from '@/lib/server/redis';
import { fail, ip, j } from '@/lib/server/http';
import { hashPassword, limited, publicUser, signToken, verifyInitData, type User } from '@/lib/server/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => null);
    const login = String(b?.login ?? '').trim().toLowerCase();
    const password = String(b?.password ?? '');
    if (!/^[a-z0-9_.-]{3,32}$/.test(login)) return j({ error: 'Логин: 3–32 символа, латиница, цифры и _ . -' }, 400);
    if (password.length < 6 || password.length > 100) return j({ error: 'Пароль должен быть не короче 6 символов.' }, 400);
    if (await limited('reg:' + ip(req), 20, 3600)) return j({ error: 'Слишком много попыток. Попробуйте позже.' }, 429);

    const id = crypto.randomUUID();
    const taken = await db().set('login:' + login, id, { nx: true });
    if (!taken) return j({ error: 'Такой логин уже занят.' }, 409);

    const { salt, hash } = hashPassword(password);
    const user: User = { id, login, salt, hash, created: Date.now() };

    // Если регистрация идёт внутри Telegram, привязываем аккаунт Telegram.
    const tg = typeof b?.initData === 'string' ? verifyInitData(b.initData) : null;
    if (tg && !(await db().get('tg:' + tg.id))) {
      user.tg = tg.id;
      user.name = tg.name;
      await db().set('tg:' + tg.id, id);
    }
    await db().set('user:' + id, user);
    return j({ token: signToken(id), user: publicUser(user) });
  } catch (e) {
    return fail(e);
  }
}
