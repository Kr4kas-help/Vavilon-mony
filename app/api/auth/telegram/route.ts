import crypto from 'node:crypto';
import { sql } from '@/lib/server/db';
import { fail, j } from '@/lib/server/http';
import { publicUser, rowToUser, signToken, verifyInitData, type User } from '@/lib/server/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => null);
    const tg = typeof b?.initData === 'string' ? verifyInitData(b.initData) : null;
    if (!tg) return j({ error: 'Не удалось подтвердить вход через Telegram.' }, 401);

    const s = await sql();
    const rows = (await s`SELECT * FROM users WHERE tg = ${String(tg.id)} LIMIT 1`) as Record<string, unknown>[];
    let user: User;
    if (rows[0]) {
      user = rowToUser(rows[0]);
    } else {
      user = { id: crypto.randomUUID(), login: null, tg: tg.id, name: tg.name, created: Date.now() };
      await s`INSERT INTO users (id, login, tg, name, created)
        VALUES (${user.id}, NULL, ${String(tg.id)}, ${tg.name}, ${user.created}::bigint)
        ON CONFLICT (tg) DO NOTHING`;
      const again = (await s`SELECT * FROM users WHERE tg = ${String(tg.id)} LIMIT 1`) as Record<string, unknown>[];
      if (again[0]) user = rowToUser(again[0]);
    }
    return j({ token: signToken(user.id), user: publicUser(user) });
  } catch (e) {
    return fail(e);
  }
}
