import crypto from 'node:crypto';
import { db } from '@/lib/server/redis';
import { fail, j } from '@/lib/server/http';
import { publicUser, signToken, verifyInitData, type User } from '@/lib/server/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => null);
    const tg = typeof b?.initData === 'string' ? verifyInitData(b.initData) : null;
    if (!tg) return j({ error: 'Не удалось подтвердить вход через Telegram.' }, 401);

    let id = await db().get<string>('tg:' + tg.id);
    let user = id ? await db().get<User>('user:' + id) : null;
    if (!user) {
      id = crypto.randomUUID();
      user = { id, login: null, tg: tg.id, name: tg.name, created: Date.now() };
      await db().set('tg:' + tg.id, id);
      await db().set('user:' + id, user);
    }
    return j({ token: signToken(user.id), user: publicUser(user) });
  } catch (e) {
    return fail(e);
  }
}
