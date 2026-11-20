"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useProfile } from "@/lib/store";
import { buildPlan } from "@/lib/plan";
import { rub, totalIncome } from "@/lib/types";
import { quoteOfDay } from "@/lib/wisdom";
import { IMG } from "@/lib/dash-img";

const STEPS = ["Понять ситуацию", "Навести порядок", "Закрыть долги", "Создать запас", "Начать копить"];
const LESSONS_TOTAL = 7;

// Пока у пользователя нет своих данных, показываем значения из макета.
const DEMO = { lessons: 3, debtPct: 60, owed: 24000, budget: 35000, mandatory: 28000, savePct: 10 };

const ico = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

function StepIcon({ i }: { i: number }) {
  const p = { width: 34, height: 34, viewBox: "0 0 24 24", ...ico } as const;
  if (i === 0)
    return (
      <svg {...p}>
        <path d="M12 6.2v13M3 5.2h5.6A3.4 3.4 0 0112 8.6v10.6a3.4 3.4 0 00-3.4-3.4H3V5.2zM21 5.2h-5.6A3.4 3.4 0 0012 8.6v10.6a3.4 3.4 0 013.4-3.4H21V5.2z" />
        <path d="M5.2 8.6h3M5.2 11.4h3M15.8 8.6h3M15.8 11.4h3" strokeWidth="1" />
      </svg>
    );
  if (i === 1)
    return (
      <svg {...p}>
        <path d="M12 4v16M7 20h10M4 7.5h16" />
        <path d="M7 7.5l-3.4 7a3.4 3.4 0 006.8 0L7 7.5zM17 7.5l-3.4 7a3.4 3.4 0 006.8 0L17 7.5z" />
        <circle cx="12" cy="4" r="0.9" fill="currentColor" />
      </svg>
    );
  if (i === 2)
    return (
      <svg {...p}>
        <ellipse cx="12" cy="6.5" rx="6.5" ry="2.6" />
        <path d="M5.5 6.5v3.4c0 1.4 2.9 2.6 6.5 2.6s6.5-1.2 6.5-2.6V6.5M5.5 9.9v3.4c0 1.4 2.9 2.6 6.5 2.6s6.5-1.2 6.5-2.6V9.9M5.5 13.3v3.4c0 1.4 2.9 2.6 6.5 2.6s6.5-1.2 6.5-2.6v-3.4" />
      </svg>
    );
  if (i === 3)
    return (
      <svg {...p}>
        <path d="M12 3l7.2 2.8v5.6c0 4.6-3 7.6-7.2 9.6-4.2-2-7.2-5-7.2-9.6V5.8L12 3z" />
        <path d="M8.8 12l2.3 2.3 4.2-4.4" />
      </svg>
    );
  return (
    <svg {...p}>
      <path d="M7.5 3.5h9v5.3a4.5 4.5 0 01-9 0V3.5z" />
      <path d="M7.5 5.5H4.2v2.1a3.3 3.3 0 003.3 3.3M16.5 5.5h3.3v2.1a3.3 3.3 0 01-3.3 3.3M12 13.3v3.4M8.4 20.5h7.2M9.8 16.7h4.4v3.8H9.8z" />
    </svg>
  );
}

function StatIcon({ kind }: { kind: "debt" | "calendar" | "piggy" }) {
  const p = { width: 24, height: 24, viewBox: "0 0 24 24", ...ico } as const;
  if (kind === "debt")
    return (
      <svg {...p}>
        <path d="M4 20.5v-5.5h3.2v5.5M10.4 20.5V10h3.2v10.5M16.8 20.5V5h3.2v15.5M3 20.5h18" />
      </svg>
    );
  if (kind === "calendar")
    return (
      <svg {...p}>
        <rect x="3.5" y="4.5" width="17" height="16" rx="2.2" />
        <path d="M3.5 9.5h17M8 2.5v4M16 2.5v4" />
        <path d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01" strokeWidth="2" />
      </svg>
    );
  return (
    <svg {...p}>
      <path d="M4.6 12.5c0-3.6 3.2-6.2 7-6.2h3.2c.9-1.1 2-1.6 3.4-1.6l-.4 2.4c1 .8 1.6 1.7 1.8 2.8h1.4v3.1h-1.5c-.4 1-1.1 1.8-2 2.4v2.8h-3v-1.4h-3.6v1.4h-3v-2.9c-1.3-.9-2.3-2.2-2.3-3.7z" />
      <path d="M2.4 9.2c0 1.1.9 1.9 2 1.9M15.6 10.2h.01" strokeWidth="1.8" />
      <path d="M9.4 4.2h3.4" strokeWidth="1.2" />
    </svg>
  );
}

function Arrow({ className = "round-go" }: { className?: string }) {
  return (
    <span className={className} aria-hidden>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M13 5.8l6.2 6.2-6.2 6.2" />
      </svg>
    </span>
  );
}

export default function Dashboard() {
  const { profile: p, ready } = useProfile();
  const plan = useMemo(() => buildPlan(p), [p]);
  const quote = quoteOfDay();
  if (!ready) return null;

  const started = p.ageGroup !== null;
  const owed = p.debts.reduce((s, d) => s + Math.max(0, d.balance), 0);
  const income = totalIncome(p);
  const hasData = started && (owed > 0 || income > 0);

  const done = started ? Math.min(LESSONS_TOTAL, p.step) : DEMO.lessons;
  const pct = Math.round((done / LESSONS_TOTAL) * 100);
  const stage = !started ? 1 : p.step < 5 ? Math.min(4, Math.max(0, Math.floor(p.step / 2))) : plan.ok ? (owed > 0 ? 2 : p.mandatory > 0 ? 3 : 4) : 1;

  const debtOwed = hasData ? owed : DEMO.owed;
  const debtPct = hasData ? (owed > 0 ? Math.min(100, Math.round((p.debts.reduce((s, d) => s + d.monthly, 0) / owed) * 100)) : 100) : DEMO.debtPct;
  const budget = hasData ? income : DEMO.budget;
  const mandatory = hasData ? p.mandatory : DEMO.mandatory;
  const reservePct = hasData && plan.ok ? Math.round(plan.shares.find((s) => s.key === "reserve")?.pct ?? 0) : DEMO.savePct;

  return (
    <div className="dash">
      <div className="dash-art" style={{ backgroundImage: `url(${IMG.hero})` }} aria-hidden />

      <section className="hero">
        <h1 className="hero-title">Добро пожаловать!</h1>
        <p className="hero-sub">Шаг за шагом — к финансовой свободе</p>
        <h2 className="hero-h2">Из долгов — к мечте</h2>

        <ol className="steps" aria-label="Ваш путь">
          {STEPS.map((t, i) => {
            const state = i < stage ? "done" : i === stage ? "now" : "next";
            return (
              <li key={t} className="step" data-state={state} data-i={i} aria-current={i === stage ? "step" : undefined}>
                <span className="step-dot">
                  <StepIcon i={i} />
                  {state === "done" && (
                    <b className="step-badge">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                    </b>
                  )}
                  {state === "now" && (
                    <b className="step-badge step-badge-now">
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9.5l6 6 6-6" /></svg>
                    </b>
                  )}
                </span>
                <span className="step-label">{t}</span>
              </li>
            );
          })}
        </ol>

        <div className="progress">
          <p className="progress-t">
            {done} из {LESSONS_TOTAL} уроков
            <br />
            <span>пройдено</span>
          </p>
          <div className="trk" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
            <i style={{ width: pct + "%" }} />
          </div>
          <Link href="/path" className="pill-btn">
            Продолжить обучение
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M9 4.5l7.5 7.5L9 19.5" /></svg>
          </Link>
        </div>
      </section>

      <div className="row2">
        <Link href="/learn" className="card lesson">
          <div className="lesson-img" style={{ backgroundImage: `url(${IMG.lesson})` }} aria-hidden />
          <div className="lesson-body">
            <span className="tag">Урок недели</span>
            <h2>Контролируй свои расходы</h2>
            <p>
              Узнай, как отличать нужды от желаний
              <br />и тратить осознанно.
            </p>
            <span className="dur">
              <svg width="18" height="18" viewBox="0 0 24 24" {...ico}><circle cx="12" cy="12" r="9.2" /><path d="M12 6.8V12l3.2 2.2" /></svg>
              15 минут
            </span>
          </div>
          <Arrow className="round-go go-abs" />
        </Link>

        <Link href="/review" className="card task">
          <svg className="task-ico" width="46" height="52" viewBox="0 0 46 52" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="4" y="8" width="38" height="40" rx="5" />
            <path d="M14 3v9M32 3v9M13 24h20M13 32h20M13 40h12" />
          </svg>
          <h3>Практическое задание</h3>
          <p>
            Запиши расходы
            <br />
            за сегодня
          </p>
          <span className="ghost-btn">
            Перейти
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </span>
        </Link>
      </div>

      <div className="row3">
        <Link href="/plan" className="card stat stat1">
          <h3><StatIcon kind="debt" /> Погашение долгов</h3>
          <p className="big">{debtPct}%</p>
          <p className="sub">Осталось выплатить: {rub(debtOwed)}</p>
          <div className="trk trk-lg"><i style={{ width: debtPct + "%" }} /></div>
        </Link>

        <Link href="/plan" className="card stat stat2">
          <h3><StatIcon kind="calendar" /> План бюджета на месяц</h3>
          <p className="big big-s">{rub(budget)}</p>
          <p className="sub">
            Из них на обязательные
            <br />
            расходы: {rub(mandatory)}
          </p>
          <Arrow className="round-go go-abs" />
        </Link>

        <Link href="/rules" className="card stat stat3">
          <h3><StatIcon kind="piggy" /> Привычка сбережений</h3>
          <p className="mid">Первая десятая часть</p>
          <p className="sub">{income > 0 && hasData ? `Сохраните 10% от дохода: ${rub(income * 0.1)}` : "Сохраните 10% от дохода"}</p>
          <div className="save-row">
            <div className="trk trk-lg"><i style={{ width: Math.min(100, reservePct * 1.7) + "%" }} /></div>
            <span>{reservePct}%</span>
          </div>
        </Link>
      </div>

      <section className="card quote">
        <div className="quote-img" style={{ backgroundImage: `url(${IMG.quote})` }} aria-hidden />
        <svg className="quote-ico" width="56" height="48" viewBox="0 0 56 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M28 12v32M3 6h17a8 8 0 018 8v30a8 8 0 00-8-8H3V6zM53 6H36a8 8 0 00-8 8v30a8 8 0 018-8h17V6z" />
          <path d="M8 14h13M8 21h13M8 28h13M35 14h13M35 21h13M35 28h13" strokeWidth="1.2" />
        </svg>
        <span className="quote-sep" aria-hidden />
        <div className="quote-text">
          <h3>Золотое правило дня</h3>
          <p>«{quote.text}»</p>
        </div>
      </section>
    </div>
  );
}
