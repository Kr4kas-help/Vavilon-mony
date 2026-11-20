export function j(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

export function fail(e: unknown): Response {
  const m = e instanceof Error ? e.message : '';
  if (m === 'DB_NOT_CONFIGURED') return j({ error: 'База данных ещё не подключена. Обратитесь к владельцу приложения.' }, 503);
  if (m === 'NO_SECRET') return j({ error: 'Сервер не настроен: нет SESSION_SECRET.' }, 503);
  console.error(e);
  return j({ error: 'Ошибка сервера, попробуйте ещё раз.' }, 500);
}

export const ip = (req: Request) => (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
