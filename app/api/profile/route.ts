import { sql } from '@/lib/server/db';
import { fail, j } from '@/lib/server/http';
import { userFromRequest } from '@/lib/server/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await userFromRequest(req);
    if (!user) return j({ error: 'Требуется вход.' }, 401);
    const s = await sql();
    const rows = (await s`SELECT data FROM profiles WHERE user_id = ${user.id} LIMIT 1`) as { data: unknown }[];
    return j({ profile: rows[0]?.data ?? null });
  } catch (e) {
    return fail(e);
  }
}

export async function PUT(req: Request) {
  try {
    const user = await userFromRequest(req);
    if (!user) return j({ error: 'Требуется вход.' }, 401);
    const text = await req.text();
    if (text.length > 200_000) return j({ error: 'Слишком большой объём данных.' }, 413);
    let body: { profile?: unknown } | null = null;
    try {
      body = JSON.parse(text);
    } catch {}
    const p = body?.profile;
    if (!p || typeof p !== 'object' || Array.isArray(p)) return j({ error: 'Некорректные данные.' }, 400);
    const s = await sql();
    await s`INSERT INTO profiles (user_id, data, updated)
      VALUES (${user.id}, ${JSON.stringify(p)}::jsonb, ${Date.now()}::bigint)
      ON CONFLICT (user_id) DO UPDATE SET data = EXCLUDED.data, updated = EXCLUDED.updated`;
    return j({ ok: true });
  } catch (e) {
    return fail(e);
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await userFromRequest(req);
    if (!user) return j({ error: 'Требуется вход.' }, 401);
    const s = await sql();
    await s`DELETE FROM profiles WHERE user_id = ${user.id}`;
    return j({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
