import crypto from 'node:crypto';
import { sql } from '@/lib/server/db';
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

    const s = await sql();
    const id = crypto.randomUUID();
    const { salt, hash } = hashPassword(password);
    const user: User = { id, login, salt, hash, created: Date.now() };

    // Если регистрация идёт внутри Telegram, привязываем аккаунт Telegram.
    const tg = typeof b?.initData === 'string' ? verifyInitData(b.initData) : null;
    if (tg) {
      const used = (await s`SELECT 1 FROM users WHERE tg = ${String(tg.id)} LIMIT 1`) as unknown[];
      if (used.length === 0) {
        user.tg = tg.id;
        user.name = tg.name;
      }
    }

    const rows = (await s`
      INSERT INTO users (id, login, salt, hash, tg, name, created)
      VALUES (${id}, ${login}, ${salt}, ${hash}, ${user.tg ? String(user.tg) : null}, ${user.name ?? null}, ${user.created}::bigint)
      ON CONFLICT (login) DO NOTHING
      RETURNING id`) as unknown[];
    if (rows.length === 0) return j({ error: 'Такой логин уже занят.' }, 409);

    return j({ token: signToken(id), user: publicUser(user) });
  } catch (e) {
    return fail(e);
  }
}
