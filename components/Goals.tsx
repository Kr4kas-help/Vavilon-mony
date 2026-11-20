"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useProfile } from "@/lib/store";
import { analyzeWishes } from "@/lib/plan";
import WishReview from "./WishReview";

export default function Goals() {
  const { profile: p, update, ready } = useProfile();
  const verdicts = useMemo(() => analyzeWishes(p), [p]);
  if (!ready) return null;

  return (
    <div className="space-y-6">
      <h1>Цели</h1>
      {verdicts.length > 0 ? (
        <WishReview verdicts={verdicts} />
      ) : (
        <p className="prose-line text-ink/75">
          Пока целей нет. Добавьте хотелки и мечты, и мы посчитаем, когда они исполнятся и стоит ли их оставлять.
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <Link href="/path" className="btn btn-primary" onClick={() => update({ step: 7 })}>
          {verdicts.length > 0 ? "Изменить желания" : "Добавить желания"}
        </Link>
        <Link href="/plan" className="btn btn-ghost">
          Открыть план
        </Link>
      </div>
    </div>
  );
}
