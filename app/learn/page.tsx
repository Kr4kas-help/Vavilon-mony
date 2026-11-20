import Link from "next/link";

export default function Page() {
  return (
    <div className="space-y-5">
      <h1>Обучение</h1>
      <div className="card p-6">
        <p className="font-serif text-xl">Уроки скоро появятся</p>
        <p className="prose-line mt-2 text-ink/75">
          Здесь будут короткие уроки по мотивам книги «Самый богатый человек в Вавилоне». Пока можно прочитать золотые
          правила денег.
        </p>
        <Link href="/rules" className="btn btn-gold mt-4">
          Золотые правила
        </Link>
      </div>
    </div>
  );
}
