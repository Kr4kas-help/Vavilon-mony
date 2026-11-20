import { neon } from '@neondatabase/serverless';

type Sql = ReturnType<typeof neon>;

let client: Sql | null = null;
let ready: Promise<void> | null = null;

function connection(): string {
  const url =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL_NON_POOLING;
  if (!url) throw new Error('DB_NOT_CONFIGURED');
  return url;
}

// Возвращает клиент Neon и один раз создаёт таблицы, если их ещё нет.
export async function sql(): Promise<Sql> {
  if (!client) client = neon(connection());
  const s = client;
  if (!ready) {
    ready = (async () => {
      await s`CREATE TABLE IF NOT EXISTS users (
        id text PRIMARY KEY,
        login text UNIQUE,
        salt text,
        hash text,
        tg text UNIQUE,
        name text,
        created bigint NOT NULL
      )`;
      await s`CREATE TABLE IF NOT EXISTS profiles (
        user_id text PRIMARY KEY,
        data jsonb NOT NULL,
        updated bigint NOT NULL
      )`;
      await s`CREATE TABLE IF NOT EXISTS rate_limits (
        key text PRIMARY KEY,
        n integer NOT NULL,
        expires bigint NOT NULL
      )`;
    })().catch((e) => {
      ready = null;
      throw e;
    });
  }
  await ready;
  return s;
}
