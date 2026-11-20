import crypto from 'node:crypto';
import { db } from './redis';

export type User = {
  id: string;
  login: string | null;
  salt?: string;
  hash?: string;
  tg?: number;
  name?: string;
  created: number;
};

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) throw new Error('NO_SECRET');
  return s;
}

const b64 = (b: Buffer) => b.toString('base64url');

export function signToken(uid: string, days = 60): string {
  const body = b64(Buffer.from(JSON.stringify({ u: uid, e: Date.now() + days * 86400000 })));
  const sig = b64(crypto.createHmac('sha256', secret()).update(body).digest());
  return body + '.' + sig;
}

export function readToken(token: string | null): string | null {
  if (!token) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const good = crypto.createHmac('sha256', secret()).update(body).digest();
  const given = Buffer.from(sig, 'base64url');
  if (given.length !== good.length || !crypto.timingSafeEqual(given, good)) return null;
  try {
    const d = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (typeof d.u !== 'string' || typeof d.e !== 'number' || d.e < Date.now()) return null;
    return d.u;
  } catch {
    return null;
  }
}

export function hashPassword(password: string, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, hash };
}

export function checkPassword(password: string, salt: string, hash: string): boolean {
  const h = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return h.length === expected.length && crypto.timingSafeEqual(h, expected);
}

export async function userFromRequest(req: Request): Promise<User | null> {
  const h = req.headers.get('authorization') || '';
  const uid = readToken(h.startsWith('Bearer ') ? h.slice(7) : null);
  if (!uid) return null;
  return (await db().get<User>('user:' + uid)) ?? null;
}

export function publicUser(u: User) {
  return { id: u.id, login: u.login, name: u.name ?? null, tg: !!u.tg };
}

// Проверка подписи данных Telegram Mini App (https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app)
export function verifyInitData(initData: string): { id: number; name: string } | null {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !initData) return null;
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;
  params.delete('hash');
  const check = Array.from(params.entries())
    .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
    .map(([k, v]) => k + '=' + v)
    .join('\n');
  const key = crypto.createHmac('sha256', 'WebAppData').update(token).digest();
  const calc = crypto.createHmac('sha256', key).update(check).digest();
  const given = Buffer.from(hash, 'hex');
  if (given.length !== calc.length || !crypto.timingSafeEqual(given, calc)) return null;
  const age = Date.now() / 1000 - Number(params.get('auth_date') || 0);
  if (!(age < 86400)) return null;
  try {
    const u = JSON.parse(params.get('user') || 'null');
    if (!u || typeof u.id !== 'number') return null;
    const name = [u.first_name, u.last_name].filter(Boolean).join(' ') || u.username || 'Друг';
    return { id: u.id, name: String(name).slice(0, 60) };
  } catch {
    return null;
  }
}

// Ограничение числа попыток: true, если лимит превышен.
export async function limited(key: string, max: number, seconds: number): Promise<boolean> {
  const k = 'rl:' + key;
  const n = await db().incr(k);
  if (n === 1) await db().expire(k, seconds);
  return n > max;
}
