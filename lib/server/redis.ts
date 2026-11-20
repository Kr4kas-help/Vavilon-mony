import { Redis } from '@upstash/redis';

let client: Redis | null = null;

// Vercel Storage (Upstash Redis) сам добавляет KV_REST_API_URL и KV_REST_API_TOKEN.
export function db(): Redis {
  if (!client) {
    const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) throw new Error('DB_NOT_CONFIGURED');
    client = new Redis({ url, token });
  }
  return client;
}
