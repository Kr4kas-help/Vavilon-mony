import { rules } from "@/lib/wisdom";

export default function Page() {
  return (
    <div className="space-y-5">
      <h1>Золотые правила денег</h1>
      <p className="prose-line text-ink/75">Семь простых правил из вечной книги о Вавилоне, пересказанные своими словами.</p>
      <ol className="space-y-4">
        {rules.map((r, i) => (
          <li key={r.title} className="card p-5">
            <p className="text-sm text-[#F0C66A]">Правило {i + 1}</p>
            <h2 className="mt-1">{r.title}</h2>
            <p className="prose-line mt-2">{r.text}</p>
            <p className="prose-line mt-2 text-ink/70">{r.tip}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
