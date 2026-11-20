"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Ziggurat } from "./Art";
import { useAuth } from "@/lib/store";
import { tap } from "@/lib/tg";

type IconName = "home" | "path" | "learn" | "practice" | "finance" | "goals" | "rules" | "settings" | "menu" | "close";

function Icon({ name }: { name: IconName }) {
  const p = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  } as const;
  switch (name) {
    case "home":
      return (
        <svg {...p}>
          <path d="M3 11l9-8 9 8M5 10v10h14V10" />
        </svg>
      );
    case "path":
      return (
        <svg {...p}>
          <path d="M12 6v14M4 5h6a2 2 0 012 2v13a2 2 0 00-2-2H4V5zM20 5h-6a2 2 0 00-2 2v13a2 2 0 012-2h6V5z" />
        </svg>
      );
    case "learn":
      return (
        <svg {...p}>
          <path d="M7 4l13 8-13 8V4z" />
        </svg>
      );
    case "practice":
      return (
        <svg {...p}>
          <path d="M4 4h16v16H4zM8 12l3 3 5-6" />
        </svg>
      );
    case "finance":
      return (
        <svg {...p}>
          <path d="M5 20V10M12 20V4M19 20v-7" />
        </svg>
      );
    case "goals":
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1.2" />
        </svg>
      );
    case "rules":
      return (
        <svg {...p}>
          <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z" />
        </svg>
      );
    case "settings":
      return (
        <svg {...p}>
          <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
          <circle cx="16" cy="7" r="2" />
          <circle cx="8" cy="17" r="2" />
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

  const m = new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric" }).format(new Date());
  const month = m.charAt(0).toUpperCase() + m.slice(1);
  const who = user?.name || user?.login || "Гость";
  const initial = who.trim().charAt(0).toUpperCase();

  return (
    <>
      <aside className="side" aria-label="Меню">
        <Link href="/" className="flex flex-col items-center gap-1 px-2">
          <Ziggurat className="h-14 w-auto" glow={false} />
          <span className="font-serif text-2xl text-[#F0C66A]">Money Wise</span>
        </Link>
        <nav className="mt-6 flex flex-col gap-1" aria-label="Разделы">
          {NAV.map((i) => (
            <Link key={i.href} href={i.href} className="navlink" aria-current={isActive(i.href) ? "page" : undefined} onClick={tap}>
              <Icon name={i.icon} />
              <span>{i.label}</span>
            </Link>
          ))}
        </nav>
        <p className="mt-auto pt-6 text-center font-serif text-sm italic text-ink/60">
          Путь к богатству начинается с контроля над своими деньгами.
        </p>
      </aside>

      <div className="app-body">
        <header className="mobtop">
          <Link href="/" className="flex items-center gap-2">
            <Ziggurat className="h-9 w-auto" glow={false} />
            <span className="font-serif text-lg text-[#F0C66A]">Money Wise</span>
          </Link>
          <button type="button" aria-label="Открыть меню" className="grid h-11 w-11 place-items-center rounded-xl text-[#F0C66A]" onClick={() => setOpen(true)}>
            <Icon name="menu" />
          </button>
        </header>

        <div className="deskbar">
          <span>{month}</span>
          <Link href="/settings" className="avatar" aria-label={"Профиль: " + who} title={who}>
            {initial}
          </Link>
        </div>

        <main className="app-main mx-auto w-full max-w-5xl px-4 pt-5 sm:px-6 lg:px-10 lg:pt-8">{children}</main>
      </div>

      {open && (
        <div className="drawer-back" onClick={() => setOpen(false)}>
          <div className="drawer" role="dialog" aria-modal="true" aria-label="Меню" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <span className="font-serif text-xl text-[#F0C66A]">Money Wise</span>
              <button type="button" aria-label="Закрыть меню" className="grid h-11 w-11 place-items-center rounded-xl text-[#F0C66A]" onClick={() => setOpen(false)}>
                <Icon name="close" />
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
            <Icon name={i.icon} />
            <span>{i.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
