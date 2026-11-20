"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useProfile } from "@/lib/store";
import { buildPlan } from "@/lib/plan";
import { rub, totalIncome } from "@/lib/types";
import { quoteOfDay } from "@/lib/wisdom";
import { Ziggurat } from "./Art";

const STEPS = ["Понять ситуацию", "Навести порядок", "Закрыть долги", "Создать запас", "Начать копить"];

export default function Dashboard() {
  const { profile: p, ready } = useProfile();
  const plan = useMemo(() => buildPlan(p), [p]);
  const quote = quoteOfDay();
  if (!ready) return null;

  const owed = p.debts.reduce((s, d) => s + Math.max(0, d.balance), 0);
  const monthlyDebt = p.debts.reduce((s, d) => s + d.monthly, 0);
  const income = totalIncome(p);
  const started = p.ageGroup !== null;
  const done = Math.min(8, started ? p.step : 0);
  const pct = Math.round((done / 8) * 100);
  // Текущий этап пути: анкета → порядок → долги → запас → накопления.
  const stage = !started || p.step < 5 ? 0 : plan.ok ? (owed > 0 ? 2 : p.mandatory > 0 ? 3 : 4) : 1;
  const reservePct = plan.ok ? Math.round(plan.shares.find((s) => s.key === "reserve")?.pct ?? 0) : 0;

  return (
    <div className="space-y-5 lg:space-y-6">
      <section className="card relative overflow-hidden p-5 sm:p-7">
        <Ziggurat className="pointer-events-none absolute -right-6 -top-4 h-44 w-auto opacity-60 sm:h-56 lg:h-72" />
        <div className="relative max-w-xl">
          <h1>Добро пожаловать!</h1>
          <p className="mt-1 font-serif text-lg text-ink/70">Шаг за шагом — к финансовой свободе</p>
          <h2 className="mt-6">Из долгов — к мечте</h2>
        </div>

        <ol className="relative mt-5 grid grid-cols-5 gap-1 sm:gap-3" aria-label="Ваш путь">
          {STEPS.map((t, i) => (
            <li key={t} className="flex flex-col items-center text-center" aria-current={i === stage ? "step" : undefined}>
              <span
                className="grid h-10 w-10 place-items-center rounded-full border-2 text-sm font-semibold sm:h-14 sm:w-14 sm:text-base"
                style={{
                  borderColor: i <= stage ? "#E8B84F" : "rgba(217,164,65,0.35)",
                  background: i < stage ? "rgba(217,164,65,0.28)" : i === stage ? "rgba(217,164,65,0.12)" : "transparent",
                  color: i <= stage ? "#F6D98E" : "rgba(241,230,204,0.5)",
                  boxShadow: i === stage ? "0 0 18px rgba(232,184,79,0.45)" : "none",
                }}
              >
                {i < stage ? "✓" : i + 1}
              </span>
              <span className="mt-2 text-[0.7rem] leading-tight sm:text-sm">{t}</span>
            </li>
          ))}
        </ol>

        <div className="relative mt-6 max-w-md">
          <p className="font-serif text-xl">
            {started ? `${done} из 8 шагов анкеты пройдено` : "Начнём с небольшой анкеты"}
          </p>
          <div className="bar mt-2" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
            <i style={{ width: pct + "%" }} />
          </div>
          <Link href="/path" className="btn btn-primary mt-4">
            {started ? "Продолжить обучение →" : "Начать →"}
          </Link>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        <Link href="/rules" className="card flex flex-col p-5 lg:col-span-2">
          <span className="w-fit rounded-full border border-[rgba(217,164,65,0.4)] px-3 py-0.5 text-xs text-[#F0C66A]">Урок недели</span>
          <h2 className="mt-3">Контролируй свои расходы</h2>
          <p className="prose-line mt-2 text-ink/75">Узнай, как отличать нужды от желаний и тратить осознанно.</p>
          <span className="mt-3 text-sm text-ink/60">15 минут</span>
        </Link>

        <Link href="/review" className="card flex flex-col p-5">
          <h2>Практическое задание</h2>
          <p className="mt-2 text-ink/75">Запиши расходы за сегодня</p>
          <span className="btn btn-ghost mt-4 w-full">Перейти →</span>
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <Link href="/plan" className="card p-5">
          <h3 className="font-serif text-lg">Погашение долгов</h3>
          {owed > 0 ? (
            <>
              <p className="mt-2 font-serif text-4xl text-[#F6D98E]">{rub(owed)}</p>
              <p className="mt-1 text-ink/70">
                {plan.ok && plan.debtFreeIn !== null
                  ? `Закроем примерно за ${plan.debtFreeIn} мес.`
                  : `Платёж в месяц: ${rub(monthlyDebt)}`}
              </p>
            </>
          ) : (
            <p className="mt-2 text-ink/70">{started ? "Долгов нет. Отлично!" : "Добавьте долги в анкете, и план погашения появится здесь."}</p>
          )}
        </Link>

        <Link href="/plan" className="card p-5">
          <h3 className="font-serif text-lg">План бюджета на месяц</h3>
          {income > 0 ? (
            <>
              <p className="mt-2 font-serif text-4xl text-[#F6D98E]">{rub(income)}</p>
              <p className="mt-1 text-ink/70">Из них на обязательные расходы: {rub(p.mandatory)}</p>
            </>
          ) : (
            <p className="mt-2 text-ink/70">Укажите доход и расходы в анкете.</p>
          )}
        </Link>

        <Link href="/rules" className="card p-5">
          <h3 className="font-serif text-lg">Привычка сбережений</h3>
          <p className="mt-2 font-serif text-2xl text-[#F6D98E]">Первая десятая часть</p>
          <p className="mt-1 text-ink/70">
            {income > 0 ? `Отложите 10% дохода: ${rub(income * 0.1)}` : "Сохраните 10% от дохода"}
          </p>
          {plan.ok && (
            <div className="mt-3 flex items-center gap-3">
              <div className="bar flex-1">
                <i style={{ width: Math.min(100, reservePct * 10) + "%" }} />
              </div>
              <span className="text-sm">{reservePct}%</span>
            </div>
          )}
        </Link>
      </div>

      <section className="card relative overflow-hidden p-5 sm:p-6">
        <Ziggurat className="pointer-events-none absolute -right-4 -top-2 h-32 w-auto opacity-35 sm:h-40" glow={false} />
        <p className="relative font-serif text-lg text-[#F0C66A]">Золотое правило дня</p>
        <p className="relative mt-1 max-w-2xl font-serif text-xl italic">«{quote.text}»</p>
      </section>
    </div>
  );
}
