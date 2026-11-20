import Link from "next/link";

export default function Page() {
  return (
    <div className="space-y-5">
      <h1>Практика</h1>
      <div className="card p-6">
        <h2>Разбор трат</h2>
        <p className="prose-line mt-2 text-ink/75">
          Вставьте историю операций или запишите траты за сегодня: отметьте необходимое и получите золотое правило именно для вас.
        </p>
        <Link href="/review" className="btn btn-primary mt-4">
          Записать расходы
        </Link>
      </div>
    </div>
  );
}
