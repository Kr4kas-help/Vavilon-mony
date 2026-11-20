"use client";

import { useState } from "react";
import { useAuth } from "@/lib/store";
import { initData } from "@/lib/tg";
import { Ziggurat } from "./Art";

function Splash() {
  return (
    <div className="grid min-h-screen place-items-center">
      <div className="text-center">
        <Ziggurat className="mx-auto h-24 w-auto" />
        <p className="mt-3 font-serif text-xl text-[#F0C66A]">Money Wise</p>
      </div>
    </div>
  );
}

function AuthScreen() {
  const a = useAuth();
  const [mode, setMode] = useState<"login" | "register">("register");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inTg = !!initData();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    const err = await a.signIn(mode, login, password);
    if (err) {
      setError(err);
      setBusy(false);
    }
  };

  const viaTelegram = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    const err = await a.signInTelegram();
    if (err) {
      setError(err);
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center px-4 py-8">
      <div className="card w-full max-w-md p-6 sm:p-8">
        <Ziggurat className="mx-auto h-24 w-auto" />
        <h1 className="mt-2 text-center">Money Wise</h1>
        <p className="mt-1 text-center text-ink/70">Шаг за шагом — к финансовой свободе</p>

        <div className="mt-6 grid grid-cols-2 gap-2" role="group" aria-label="Вход или регистрация">
          <button
            type="button"
            className={"btn " + (mode === "register" ? "btn-primary" : "btn-ghost")}
            aria-pressed={mode === "register"}
            onClick={() => setMode("register")}
          >
            Регистрация
          </button>
          <button
            type="button"
            className={"btn " + (mode === "login" ? "btn-primary" : "btn-ghost")}
            aria-pressed={mode === "login"}
            onClick={() => setMode("login")}
          >
            Вход
          </button>
        </div>

        <form onSubmit={submit} className="mt-5 space-y-4">
          <label className="block">
            <span className="mb-1 block font-medium">Логин</span>
            <input
              className="field"
              value={login}
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              placeholder="Например, ivan_77"
              onChange={(e) => setLogin(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="mb-1 block font-medium">Пароль</span>
            <input
              className="field"
              type="password"
              value={password}
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              placeholder="Не короче 6 символов"
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {mode === "register" && (
            <p className="text-ink/70" style={{ fontSize: "var(--fs-small)" }}>
              По этому логину и паролю вы сможете войти с любого устройства и получить все свои данные.
              {inTg && " Аккаунт Telegram привяжется автоматически."}
            </p>
          )}
          {error && (
            <p className="text-rose" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="btn btn-primary w-full" disabled={busy} style={{ opacity: busy ? 0.6 : 1 }}>
            {busy ? "Подождите…" : mode === "register" ? "Создать аккаунт" : "Войти"}
          </button>
        </form>

        {inTg && (
          <button type="button" className="btn btn-ghost mt-3 w-full" disabled={busy} onClick={viaTelegram}>
            Войти через Telegram
          </button>
        )}

        <div className="mt-6 border-t border-[rgba(217,164,65,0.28)] pt-4 text-center">
          <button type="button" className="text-[#F0C66A] underline underline-offset-4" onClick={a.continueLocal}>
            Продолжить без аккаунта
          </button>
          <p className="mt-1 text-ink/60" style={{ fontSize: "var(--fs-small)" }}>
            Данные будут храниться только на этом устройстве.
          </p>
        </div>
        <p className="mt-4 text-center text-ink/50" style={{ fontSize: "var(--fs-small)" }}>
          Расчёты учебные и не являются финансовой консультацией.
        </p>
      </div>
    </div>
  );
}

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  if (status === "loading") return <Splash />;
  if (status === "guest") return <AuthScreen />;
  return <>{children}</>;
}
