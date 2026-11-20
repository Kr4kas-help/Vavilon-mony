# Money Wise — Telegram Mini App

Из долгов — к мечте. Адаптивное мини-приложение (телефон, планшет, ПК) на Next.js 14.

## Переменные окружения

См. `.env.example`. Нужны для работы входа и сохранения данных:

- `KV_REST_API_URL`, `KV_REST_API_TOKEN` — база Upstash Redis (подключается через Vercel Storage)
- `SESSION_SECRET` — длинная случайная строка для подписи входа
- `TELEGRAM_BOT_TOKEN` — токен бота из @BotFather (вход через Telegram)

## Запуск

```
npm install
npm run dev
```
