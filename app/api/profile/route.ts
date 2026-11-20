import { db } from '@/lib/server/redis';
import { fail, j } from '@/lib/server/http';
import { userFromRequest } from '@/lib/server/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await userFromRequest(req);
    if (!user) return j({ error: 'Требуется вход.' }, 401);
    const profile = await db().get<Record<string, unknown>>('profile:' + user.id);
    return j({ profile: profile ?? null });
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
    await db().set('profile:' + user.id, p);
    return j({ ok: true });
  } catch (e) {
    return fail(e);
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await userFromRequest(req);
    if (!user) return j({ error: 'Требуется вход.' }, 401);
    await db().del('profile:' + user.id);
    return j({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
