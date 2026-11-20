import { fail, j } from '@/lib/server/http';
import { publicUser, userFromRequest } from '@/lib/server/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await userFromRequest(req);
    if (!user) return j({ error: 'Требуется вход.' }, 401);
    return j({ user: publicUser(user) });
  } catch (e) {
    return fail(e);
  }
}
