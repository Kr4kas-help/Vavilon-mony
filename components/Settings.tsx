"use client";

import Link from "next/link";
import { useAuth, useProfile } from "@/lib/store";

export default function Settings() {
  const { profile: p, update, reset, ready } = useProfile();
  const a = useAuth();
  if (!ready) return null;
  const who = a.user?.name || a.user?.login || "Гость";
  const save = a.status !== "user" ? "Данные хранятся только на этом устройстве" : a.saveState === "saving" ? "Сохраняем…" : a.saveState === "error" ? "Не удалось сохранить. Проверьте связь." : "Всё сохранено в вашем аккаунте";
  const allocation = p.allocation || { mandatory: 50, debt: 35, reserve: 10, wishes: 5, growth: 0 };

  return (
    <div className="space-y-6">
      <h1>Настройки</h1>
      <section className="card p-5"><h2>Аккаунт</h2><p className="mt-2"><strong>{who}</strong>{a.user?.tg && <span className="ml-2 text-ink/60">· привязан Telegram</span>}</p><p className="mt-1 text-ink/70" aria-live="polite">{save}</p><div className="mt-4 flex flex-wrap gap-3">{a.status === "user" ? <button type="button" className="btn btn-ghost" onClick={a.logout}>Выйти</button> : <button type="button" className="btn btn-primary" onClick={a.toAuth}>Войти или создать аккаунт</button>}</div></section>
      <section className="card p-5">
        <h2>Внешний вид</h2><p className="prose-line mt-2 text-ink/75">Крупный шрифт и большие кнопки — удобнее читать и нажимать.</p>
        <button type="button" className={"btn mt-4 " + (p.largeText ? "btn-primary" : "btn-ghost")} aria-pressed={p.largeText} onClick={() => update({ largeText: !p.largeText })}>{p.largeText ? "Крупный шрифт включён" : "Включить крупный шрифт"}</button>
      </section>
      <section className="card p-5">
        <h2>Доли бюджета</h2><p className="prose-line mt-2 text-ink/75">Проценты считаются от всего дохода. Подушка неприкосновенна и не используется для желаний.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {([["mandatory", "Жизнь"], ["debt", "Долги"], ["reserve", "Подушка"], ["wishes", "Желания"], ["growth", "Рост"]] as const).map(([key, label]) => (
            <label key={key} className="block"><span className="mb-1 block font-medium">{label}, %</span><input className="field" type="number" min="0" max="100" value={allocation[key]} onChange={(e) => update({ allocation: { ...allocation, [key]: Math.max(0, Math.min(100, Number(e.target.value) || 0)) } })} /></label>
          ))}
        </div>
        <p className="mt-3 text-ink/70">Сумма процентов: {Object.values(allocation).reduce((a, b) => a + b, 0)}%.</p>
      </section>
      <section className="card p-5"><h2>Мои данные</h2><div className="mt-4 flex flex-wrap gap-3"><Link href="/path" className="btn btn-ghost">Изменить ответы анкеты</Link><button type="button" className="btn btn-ghost" onClick={() => { if (window.confirm("Удалить все введённые данные и начать заново?")) reset(); }}>Удалить данные и начать заново</button></div></section>
      <p className="text-ink/50" style={{ fontSize: "var(--fs-small)" }}>Расчёты учебные и не являются финансовой консультацией. Номера счетов и карт приложение не запрашивает.</p>
    </div>
  );
}
