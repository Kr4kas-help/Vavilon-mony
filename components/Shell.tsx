"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ZigLine } from "./Art";
import { useAuth } from "@/lib/store";
import { tap } from "@/lib/tg";

type IconName = "home" | "path" | "learn" | "practice" | "finance" | "goals" | "rules" | "settings" | "menu" | "close" | "calendar" | "chevron" | "user";

export function Icon({ name, size = 28 }: { name: IconName; size?: number }) {
  const p = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  } as const;
  switch (name) {
    case "home":
      return (
        <svg {...p}>
          <path d="M3 11.2L12 3l9 8.2" />
          <path d="M5.5 9.6V21h13V9.6" />
          <path d="M10 21v-6h4v6" />
        </svg>
      );
    case "path":
      return (
        <svg {...p}>
          <path d="M12 6.5v13.5" />
          <path d="M3 5h6a3 3 0 013 3v12a3 3 0 00-3-3H3V5z" />
          <path d="M21 5h-6a3 3 0 00-3 3v12a3 3 0 013-3h6V5z" />
          <path d="M5.5 9h3M5.5 12h3M15.5 9h3M15.5 12h3" strokeWidth="1.1" />
        </svg>
      );
    case "learn":
      return (
        <svg {...p}>
          <path d="M6 3.5l14 8.5-14 8.5v-17z" />
        </svg>
      );
    case "practice":
      return (
        <svg {...p}>
          <path d="M20.5 11v7.5a2 2 0 01-2 2h-13a2 2 0 01-2-2v-13a2 2 0 012-2H15" />
          <path d="M8.5 11.5l3.2 3.2L21 5" />
        </svg>
      );
    case "finance":
      return (
        <svg {...p}>
          <path d="M4 20.5v-6.5h3v6.5M10 20.5V8h3v12.5M16 20.5V4h3v16.5" />
          <path d="M3 20.5h17" />
        </svg>
      );
    case "goals":
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5.2" />
          <circle cx="12" cy="12" r="1.4" />
          <path d="M13 11l7.5-7.5M17.5 3.5h3v3" />
        </svg>
      );
    case "rules":
      return (
        <svg {...p}>
          <path d="M12 2.8l2.8 5.8 6.4.9-4.6 4.5 1.1 6.3L12 17.3l-5.7 3 1.1-6.3-4.6-4.5 6.4-.9L12 2.8z" />
        </svg>
      );
    case "settings":
      return (
        <svg {...p}>
          <path d="M9.7 3.4h4.6l.7 2.6 1.9 1.1 2.6-.8 2.3 4-2 1.8v2.2l2 1.8-2.3 4-2.6-.8-1.9 1.1-.7 2.6H9.7L9 19.4l-1.9-1.1-2.6.8-2.3-4 2-1.8v-2.2l-2-1.8 2.3-4 2.6.8L9 6l.7-2.6z" />
          <circle cx="12" cy="12" r="3.2" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...p}>
          <rect x="3.5" y="4.5" width="17" height="16" rx="2.2" />
          <path d="M3.5 9.5h17M8 2.5v4M16 2.5v4" />
          <path d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01M16 17h.01" strokeWidth="2" />
        </svg>
      );
    case "chevron":
      return (
        <svg {...p}>
          <path d="M6 9.5l6 6 6-6" />
        </svg>
      );
    case "user":
      return (
        <svg {...p} fill="currentColor" stroke="none">
          <circle cx="12" cy="8.2" r="4.4" />
          <path d="M3.5 21c0-4.7 3.8-7.6 8.5-7.6s8.5 2.9 8.5 7.6z" />
        </svg>
      );
    case "menu":
      return (
        <svg {...p}>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      );
    default:
      return (
        <svg {...p}>
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      );
  }
}

type Item = { href: string; label: string; icon: IconName };

const NAV: Item[] = [
  { href: "/", label: "Главная", icon: "home" },
  { href: "/path", label: "Мой путь", icon: "path" },
  { href: "/learn", label: "Обучение", icon: "learn" },
  { href: "/practice", label: "Практика", icon: "practice" },
  { href: "/plan", label: "Мои финансы", icon: "finance" },
  { href: "/goals", label: "Цели", icon: "goals" },
  { href: "/rules", label: "Золотые правила", icon: "rules" },
  { href: "/settings", label: "Настройки", icon: "settings" },
];

const BOTTOM: Item[] = [
  { href: "/", label: "Главная", icon: "home" },
  { href: "/learn", label: "Обучение", icon: "learn" },
  { href: "/goals", label: "Цели", icon: "goals" },
  { href: "/plan", label: "Финансы", icon: "finance" },
  { href: "/settings", label: "Настройки", icon: "settings" },
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname() || "/";
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [path]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Разбор трат считается практикой.
  const eff = path === "/review" ? "/practice" : path;
  const isActive = (href: string) => (href === "/" ? eff === "/" : eff === href || eff.startsWith(href + "/"));

  const m = new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric" }).format(new Date()).replace(/\s*г\.?$/, "");
  const month = m.charAt(0).toUpperCase() + m.slice(1);
  const who = user?.name || user?.login || "Гость";

  return (
    <>
      <aside className="side" aria-label="Меню">
        <Link href="/" className="brand">
          <ZigLine className="brand-mark" />
          <span className="brand-name">Money Wise</span>
        </Link>
        <nav className="side-nav" aria-label="Разделы">
          {NAV.map((i) => (
            <Link key={i.href} href={i.href} className="navlink" aria-current={isActive(i.href) ? "page" : undefined} onClick={tap}>
              <Icon name={i.icon} />
              <span>{i.label}</span>
            </Link>
          ))}
        </nav>
        <div className="side-foot">
          <svg width="10" height="16" viewBox="0 0 10 16" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden>
            <path d="M5 15V2M2 5l3-3.2L8 5" />
          </svg>
          <div className="orn" aria-hidden>
            <i />
            <b />
            <i />
          </div>
          <p>Путь к богатству начинается с контроля над своими деньгами.</p>
        </div>
      </aside>

      <div className="app-body">
        <header className="mobtop">
          <Link href="/" className="flex items-center gap-2">
            <ZigLine className="h-7 w-auto text-[#E9AE61]" />
            <span className="font-serif text-xl text-[#EDB468]">Money Wise</span>
          </Link>
          <button type="button" aria-label="Открыть меню" className="grid h-11 w-11 place-items-center rounded-xl text-[#EDB468]" onClick={() => setOpen(true)}>
            <Icon name="menu" size={24} />
          </button>
        </header>

        <main className="app-main">
          <div className="deskbar">
            <span className="month">
              <Icon name="calendar" size={24} />
              <span>{month}</span>
              <Icon name="chevron" size={16} />
            </span>
            <Link href="/settings" className="avatar" aria-label={"Профиль: " + who} title={who}>
              <Icon name="user" size={30} />
            </Link>
          </div>
          {children}
        </main>
      </div>

      {open && (
        <div className="drawer-back" onClick={() => setOpen(false)}>
          <div className="drawer" role="dialog" aria-modal="true" aria-label="Меню" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <span className="font-serif text-xl text-[#EDB468]">Money Wise</span>
              <button type="button" aria-label="Закрыть меню" className="grid h-11 w-11 place-items-center rounded-xl text-[#EDB468]" onClick={() => setOpen(false)}>
                <Icon name="close" size={24} />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {NAV.map((i) => (
                <Link key={i.href} href={i.href} className="navlink" aria-current={isActive(i.href) ? "page" : undefined} onClick={tap}>
                  <Icon name={i.icon} />
                  <span>{i.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      <nav className="bottomnav" aria-label="Основная навигация">
        {BOTTOM.map((i) => (
          <Link key={i.href} href={i.href} className="bnav" aria-current={isActive(i.href) ? "page" : undefined} onClick={tap}>
            <Icon name={i.icon} size={24} />
            <span>{i.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
