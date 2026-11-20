"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useProfile } from "@/lib/store";
import { buildPlan } from "@/lib/plan";
import { rub, totalIncome } from "@/lib/types";
import { quoteOfDay } from "@/lib/wisdom";
import { IMG } from "@/lib/images";

const STEPS = ["Понять ситуацию", "Навести порядок", "Закрыть долги", "Создать запас", "Начать копить"];

const fadeLeft = "linear-gradient(to right, transparent 0%, #000 55%)";

const ico = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

function StepIcon({ i }: { i: number }) {
  const p = { width: 26, height: 26, viewBox: "0 0 24 24", ...ico } as const;
  if (i === 0) return <svg {...p}><path d="M12 6v13M3 5h6a3 3 0 013 3v11a3 3 0 00-3-3H3V5zM21 5h-6a3 3 0 00-3 3v11a3 3 0 013-3h6V5z" /></svg>;
  if (i === 1) return <svg {...p}><path d="M12 4v16M6 20h12M4 8h16M7 8l-3 7a3 3 0 006 0L7 8zM17 8l-3 7a3 3 0 006 0l-3-7z" /></svg>;
  if (i === 2) return <svg {...p}><ellipse cx="12" cy="7" rx="7" ry="3" /><path d="M5 7v5c0 1.7 3.1 3 7 3s7-1.3 7-3V7M5 12v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5" /></svg>;
  if (i === 3) return <svg {...p}><path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3zM9 12l2 2 4-4" /></svg>;
  return <svg {...p}><path d="M8 4h8v5a4 4 0 01-8 0V4zM8 6H5v2a3 3 0 003 3M16 6h3v2a3 3 0 01-3 3M12 13v4M8 20h8M10 17h4" /></svg>;
}

function StatIcon({ kind }: { kind: "debt" | "calendar" | "piggy" }) {
  const p = { width: 22, height: 22, viewBox: "0 0 24 24", ...ico } as const;
  if (kind === "debt") return <svg {...p}><path d="M5 20V10M12 20V4M19 20v-7" /></svg>;
  if (kind === "calendar") return <svg {...p}><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M4 10h16M9 3v4M15 3v4" /></svg>;
  return <svg {...p}><path d="M5 12a7 6 0 0114 0c0 2-1 3.4-2.5 4.4V19h-3v-1.5h-3V19h-3v-2.6C6 15.4 5 14 5 12zM19 11h2M9 9.5h.01" /></svg>;
}

function Arrow({ className = "round-go" }: { className?: string }) {
  return (
    <span className={className} aria-hidden>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
    </span>
  );
}

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
  const stage = !started || p.step < 5 ? 0 : plan.ok ? (owed > 0 ? 2 : p.mandatory > 0 ? 3 : 4) : 1;
  const reservePct = plan.ok ? Math.round(plan.shares.find((s) => s.key === "reserve")?.pct ?? 0) : 0;
  const debtPct = owed > 0 && monthlyDebt > 0 ? Math.min(100, Math.round((monthlyDebt / (owed + monthlyDebt)) * 100)) : owed > 0 ? 0 : 100;

  return (
    <div className="space-y-5 lg:space-y-6">
      <section className="hero">
        <div className="hero-img" style={{ backgroundImage: `url(${IMG.hero})`, WebkitMaskImage: fadeLeft, maskImage: fadeLeft }} aria-hidden />
        <div className="hero-shade" aria-hidden />

        <div className="relative">
          <h1 className="hero-title">Добро пожаловать!</h1>
          <p className="mt-1 font-serif text-lg text-ink/60">Шаг за шагом — к финансовой свободе</p>
          <h2 className="mt-6 sm:mt-8">Из долгов — к мечте</h2>
        </div>

        <div className="relative mt-5 grid gap-6 lg:grid-cols-[1fr_16rem] lg:items-center">
          <ol className="steps" aria-label="Ваш путь">
            {STEPS.map((t, i) => (
              <li key={t} className="step" data-state={i < stage ? "done" : i === stage ? "now" : "next"} aria-current={i === stage ? "step" : undefined}>
                <span className="step-dot">
                  <StepIcon i={i} />
                  {i < stage && <b className="step-tick">✓</b>}
                </span>
                <span className="step-label">{t}</span>
              </li>
            ))}
          </ol>

          <div className="lg:border-l lg:border-[var(--line)] lg:pl-6">
            <p className="font-serif text-xl leading-tight">{started ? `${done} из 8 уроков` : "Начнём с небольшой анкеты"}</p>
            {started && <p className="font-serif text-lg leading-tight text-ink/80">пройдено</p>}
            <div className="bar mt-2" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
              <i style={{ width: pct + "%" }} />
            </div>
            <Link href="/path" className="btn btn-primary mt-4 w-full sm:w-auto lg:w-full">
              {started ? "Продолжить обучение →" : "Начать →"}
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.7fr_1fr]">
        <Link href="/learn" className="card lesson">
          <div className="lesson-img" style={{ backgroundImage: `url(${IMG.lesson})` }} aria-hidden />
          <div className="flex flex-1 flex-col justify-center p-5">
            <span className="w-fit rounded-full border border-[rgba(217,164,65,0.45)] px-3 py-0.5 text-xs text-[#F0C66A]">Урок недели</span>
            <h2 className="mt-3">Контролируй свои расходы</h2>
            <p className="prose-line mt-2 text-ink/75">Узнай, как отличать нужды от желаний и тратить осознанно.</p>
            <span className="mt-3 flex items-center gap-2 text-sm text-ink/60">
              <svg width="18" height="18" viewBox="0 0 24 24" {...ico}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
              15 минут
            </span>
          </div>
          <Arrow className="round-go lesson-go" />
        </Link>

        <Link href="/review" className="card flex flex-col p-5">
          <div className="flex items-start gap-4">
            <svg width="40" height="40" viewBox="0 0 24 24" stroke="#E8B84F" fill="none" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M9 4h6v3H9zM7 5.5H5v15h14v-15h-2M8 12h8M8 16h5" /></svg>
            <div>
              <h2>Практическое задание</h2>
              <p className="mt-2 text-ink/75">Запиши расходы<br />за сегодня</p>
            </div>
          </div>
          <span className="btn btn-ghost mt-auto w-full">Перейти →</span>
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <Link href="/plan" className="card stat p-5">
          <h3 className="stat-h"><span aria-hidden><StatIcon kind="debt" /></span> Погашение долгов</h3>
          {owed > 0 ? (
            <>
              <p className="mt-2 font-serif text-4xl text-[#F6D98E]">{debtPct}%</p>
              <p className="mt-1 text-ink/70">Осталось выплатить: {rub(owed)}</p>
              <div className="bar mt-3"><i style={{ width: debtPct + "%" }} /></div>
            </>
          ) : (
            <p className="mt-2 text-ink/70">{started ? "Долгов нет. Отлично!" : "Добавьте долги в анкете, и план погашения появится здесь."}</p>
          )}
        </Link>

        <Link href="/plan" className="card stat p-5">
          <h3 className="stat-h"><span aria-hidden><StatIcon kind="calendar" /></span> План бюджета на месяц</h3>
          {income > 0 ? (
            <>
              <p className="mt-2 font-serif text-4xl text-[#F6D98E]">{rub(income)}</p>
              <p className="mt-1 max-w-[12rem] text-ink/70">Из них на обязательные расходы: {rub(p.mandatory)}</p>
            </>
          ) : (
            <p className="mt-2 text-ink/70">Укажите доход и расходы в анкете.</p>
          )}
          <Arrow className="round-go stat-go" />
        </Link>

        <Link href="/rules" className="card stat p-5">
          <h3 className="stat-h"><span aria-hidden><StatIcon kind="piggy" /></span> Привычка сбережений</h3>
          <p className="mt-2 font-serif text-2xl text-[#F6D98E]">Первая десятая часть</p>
          <p className="mt-1 text-ink/70">{income > 0 ? `Отложите 10% дохода: ${rub(income * 0.1)}` : "Сохраните 10% от дохода"}</p>
          <div className="mt-3 flex items-center gap-3">
            <div className="bar flex-1">
              <i style={{ width: Math.min(100, plan.ok ? reservePct * 10 : 10) + "%" }} />
            </div>
            <span className="text-sm">{plan.ok ? reservePct : 10}%</span>
          </div>
        </Link>
      </div>

      <section className="card quote">
        <div className="quote-img" style={{ backgroundImage: `url(${IMG.temple})`, WebkitMaskImage: fadeLeft, maskImage: fadeLeft }} aria-hidden />
        <div className="relative flex items-center gap-5 p-5 sm:p-6">
          <svg className="hidden shrink-0 sm:block" width="46" height="46" viewBox="0 0 24 24" stroke="#E8B84F" fill="none" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 6v13M3 5h6a3 3 0 013 3v11a3 3 0 00-3-3H3V5zM21 5h-6a3 3 0 00-3 3v11a3 3 0 013-3h6V5z" /></svg>
          <span className="hidden h-12 w-px bg-[var(--line)] sm:block" aria-hidden />
          <div className="max-w-2xl">
            <p className="font-serif text-lg text-[#F0C66A]">Золотое правило дня</p>
            <p className="mt-1 text-base">«{quote.text}»</p>
          </div>
        </div>
      </section>
    </div>
  );
}
