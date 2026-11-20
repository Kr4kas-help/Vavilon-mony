"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { emptyProfile, type Profile } from "./types";
import { initData, initTelegram } from "./tg";

const TOKEN = "mw:token";
const MODE = "mw:mode";
const LOCAL = "mw:local:v1";

export type PublicUser = { id: string; login: string | null; name: string | null; tg: boolean };
export type Status = "loading" | "guest" | "user" | "local";
export type SaveState = "idle" | "saving" | "saved" | "error";

type ApiData = { error?: string; token?: string; user?: PublicUser; profile?: unknown };
type ApiResult = { ok: boolean; status: number; data: ApiData };

async function call(
  path: string,
  o: { method?: string; token?: string | null; body?: unknown } = {},
): Promise<ApiResult> {
  const headers: Record<string, string> = {};
  if (o.body !== undefined) headers["Content-Type"] = "application/json";
  if (o.token) headers.Authorization = "Bearer " + o.token;
  try {
    const r = await fetch(path, {
      method: o.method ?? (o.body !== undefined ? "POST" : "GET"),
      headers,
      body: o.body !== undefined ? JSON.stringify(o.body) : undefined,
      cache: "no-store",
    });
    const data = (await r.json().catch(() => ({}))) as ApiData;
    return { ok: r.ok, status: r.status, data };
  } catch {
    return { ok: false, status: 0, data: { error: "Нет соединения с сервером." } };
  }
}

// Старые данные хранили одну проблему строкой: переносим в список. Новые поля берутся из emptyProfile.
function normalize(raw: unknown): Profile {
  const saved: Record<string, unknown> = raw && typeof raw === "object" ? { ...(raw as Record<string, unknown>) } : {};
  if (!Array.isArray(saved.problems)) saved.problems = saved.problem ? [saved.problem] : [];
  delete saved.problem;
  return { ...emptyProfile, ...(saved as Partial<Profile>) };
}

const hasData = (p: Profile) => p.ageGroup !== null || p.income > 0 || p.step > 0;

type ProfileCtx = {
  profile: Profile;
  update: (patch: Partial<Profile>) => void;
  reset: () => void;
  ready: boolean;
};

type AuthCtx = {
  status: Status;
  user: PublicUser | null;
  saveState: SaveState;
  signIn: (mode: "login" | "register", login: string, password: string) => Promise<string | null>;
  signInTelegram: () => Promise<string | null>;
  continueLocal: () => void;
  toAuth: () => void;
  logout: () => void;
};

const PCtx = createContext<ProfileCtx | null>(null);
const ACtx = createContext<AuthCtx | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [status, setStatus] = useState<Status>("loading");
  const [user, setUser] = useState<PublicUser | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const tokenRef = useRef<string | null>(null);
  const loadedRef = useRef(false);
  const profileRef = useRef<Profile>(emptyProfile);
  profileRef.current = profile;

  // Вход в аккаунт: загружаем сохранённый профиль. Если на сервере его ещё нет, а в памяти есть
  // анкета (например, заполнена без аккаунта), переносим её в аккаунт.
  const enterUser = useCallback(async (token: string, u: PublicUser): Promise<boolean> => {
    const r = await call("/api/profile", { token });
    if (!r.ok) return false;
    tokenRef.current = token;
    try {
      localStorage.setItem(TOKEN, token);
      localStorage.removeItem(MODE);
    } catch {}
    if (r.data.profile) {
      setProfile(normalize(r.data.profile));
    } else if (hasData(profileRef.current)) {
      void call("/api/profile", { method: "PUT", token, body: { profile: profileRef.current } });
    }
    setUser(u);
    loadedRef.current = true;
    setStatus("user");
    return true;
  }, []);

  const loadLocal = useCallback(() => {
    try {
      localStorage.setItem(MODE, "local");
      const raw = localStorage.getItem(LOCAL);
      if (raw) setProfile(normalize(JSON.parse(raw)));
    } catch {}
    loadedRef.current = true;
    setUser(null);
    setStatus("local");
  }, []);

  // Старт: сохранённый вход → вход через Telegram → локальный режим → экран входа.
  useEffect(() => {
    initTelegram();
    (async () => {
      let stored: string | null = null;
      try {
        stored = localStorage.getItem(TOKEN);
      } catch {}
      if (stored) {
        const me = await call("/api/me", { token: stored });
        if (me.ok && me.data.user && (await enterUser(stored, me.data.user))) return;
        if (me.status === 401) {
          try {
            localStorage.removeItem(TOKEN);
          } catch {}
        }
      }
      const idata = initData();
      if (idata) {
        const r = await call("/api/auth/telegram", { body: { initData: idata } });
        if (r.ok && r.data.token && r.data.user && (await enterUser(r.data.token, r.data.user))) return;
      }
      let mode: string | null = null;
      try {
        mode = localStorage.getItem(MODE);
      } catch {}
      if (mode === "local") {
        loadLocal();
        return;
      }
      setStatus("guest");
    })();
  }, [enterUser, loadLocal]);

  // Сохранение: в аккаунт с задержкой, в локальном режиме сразу.
  useEffect(() => {
    if (!loadedRef.current) return;
    if (status === "local") {
      try {
        localStorage.setItem(LOCAL, JSON.stringify(profile));
      } catch {}
      return;
    }
    if (status !== "user" || !tokenRef.current) return;
    setSaveState("saving");
    const t = setTimeout(async () => {
      const r = await call("/api/profile", { method: "PUT", token: tokenRef.current, body: { profile } });
      setSaveState(r.ok ? "saved" : "error");
    }, 700);
    return () => clearTimeout(t);
  }, [profile, status]);

  // Приложение сворачивают или закрывают: досылаем несохранённое, не дожидаясь задержки.
  useEffect(() => {
    const flush = () => {
      if (document.visibilityState !== "hidden" || status !== "user" || !tokenRef.current) return;
      fetch("/api/profile", {
        method: "PUT",
        keepalive: true,
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + tokenRef.current },
        body: JSON.stringify({ profile: profileRef.current }),
      }).catch(() => {});
    };
    document.addEventListener("visibilitychange", flush);
    return () => document.removeEventListener("visibilitychange", flush);
  }, [status]);

  // Крупный режим для пожилых: один атрибут меняет все размеры через CSS-переменные.
  useEffect(() => {
    document.documentElement.dataset.size = profile.largeText ? "large" : "normal";
  }, [profile.largeText]);

  const finish = useCallback(
    async (r: ApiResult): Promise<string | null> => {
      if (!r.ok || !r.data.token || !r.data.user) return r.data.error || "Не удалось выполнить вход.";
      const ok = await enterUser(r.data.token, r.data.user);
      return ok ? null : "Не удалось загрузить ваши данные. Попробуйте ещё раз.";
    },
    [enterUser],
  );

  const signIn = useCallback(
    async (mode: "login" | "register", login: string, password: string) =>
      finish(await call("/api/auth/" + mode, { body: { login, password, initData: initData() || undefined } })),
    [finish],
  );

  const signInTelegram = useCallback(async () => {
    const idata = initData();
    if (!idata) return "Откройте приложение внутри Telegram.";
    return finish(await call("/api/auth/telegram", { body: { initData: idata } }));
  }, [finish]);

  // Выход: данные в памяти очищаются, на сервере остаются.
  const logout = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN);
      localStorage.removeItem(MODE);
    } catch {}
    tokenRef.current = null;
    loadedRef.current = false;
    setUser(null);
    setProfile(emptyProfile);
    setSaveState("idle");
    setStatus("guest");
  }, []);

  // Из локального режима к экрану входа: анкета остаётся в памяти и перейдёт в новый аккаунт.
  const toAuth = useCallback(() => {
    loadedRef.current = false;
    setStatus("guest");
  }, []);

  const update = useCallback((patch: Partial<Profile>) => {
    setProfile((p) => ({ ...p, ...patch }));
  }, []);

  const reset = useCallback(() => setProfile(emptyProfile), []);

  const ready = status === "user" || status === "local";

  return (
    <ACtx.Provider
      value={{ status, user, saveState, signIn, signInTelegram, continueLocal: loadLocal, toAuth, logout }}
    >
      <PCtx.Provider value={{ profile, update, reset, ready }}>{children}</PCtx.Provider>
    </ACtx.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(PCtx);
  if (!ctx) throw new Error("useProfile нужно вызывать внутри ProfileProvider");
  return ctx;
}

export function useAuth() {
  const ctx = useContext(ACtx);
  if (!ctx) throw new Error("useAuth нужно вызывать внутри ProfileProvider");
  return ctx;
}
