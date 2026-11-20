// Тонкая обёртка над Telegram WebApp. Вне Telegram всё работает как обычный сайт: функции просто ничего не делают.

type TgWebApp = {
  initData: string;
  ready: () => void;
  expand: () => void;
  setHeaderColor?: (c: string) => void;
  setBackgroundColor?: (c: string) => void;
  disableVerticalSwipes?: () => void;
  HapticFeedback?: { impactOccurred: (s: string) => void };
};

function app(): TgWebApp | null {
  if (typeof window === "undefined") return null;
  const w = (window as unknown as { Telegram?: { WebApp?: TgWebApp } }).Telegram?.WebApp;
  return w ?? null;
}

// Подписанные данные от Telegram. Пустая строка, если приложение открыто не внутри Telegram.
export function initData(): string {
  return app()?.initData || "";
}

export function initTelegram(): void {
  const w = app();
  if (!w || !w.initData) return;
  try {
    w.ready();
    w.expand();
    w.setHeaderColor?.("#120D08");
    w.setBackgroundColor?.("#120D08");
    w.disableVerticalSwipes?.();
  } catch {
    // Старые версии Telegram могут не поддерживать часть методов.
  }
}

export function tap(): void {
  try {
    app()?.HapticFeedback?.impactOccurred("light");
  } catch {}
}
