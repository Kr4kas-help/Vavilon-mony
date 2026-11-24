import { rub, totalIncome, type Profile } from './types';

export type Row = {
  month: number; debts: number; reserve: number; wishes: number; growth: number;
  debtLeft: number; wishSaved: number; reserveTotal: number; growthTotal: number;
};
export type Share = { key: string; label: string; rub: number; pct: number };
export type WishResult = { id: string; name: string; cost: number; wanted: number | null; reachedIn: number | null };
export type Plan = { ok: boolean; free: number; shares: Share[]; rows: Row[]; wishes: WishResult[]; debtFreeIn: number | null; tips: string[] };

const GROWTH_YEAR = 0.08;

export function months(n: number): string {
  const y = Math.floor(n / 12), m = n % 12;
  const yy = y % 10 === 1 && y % 100 !== 11 ? 'год' : [2, 3, 4].includes(y % 10) && ![12, 13, 14].includes(y % 100) ? 'года' : 'лет';
  const out: string[] = [];
  if (y) out.push(y + ' ' + yy);
  if (m || !y) out.push(m + ' мес.');
  return out.join(' ');
}

export function buildPlan(p: Profile): Plan {
  const income = totalIncome(p);
  const allocation = { mandatory: 50, debt: 35, reserve: 10, wishes: 5, growth: 0, ...(p.allocation || {}) };
  const q: Profile = { ...p, income, allocation };
  const tips: string[] = [];
  const minDebt = q.debts.reduce((s, d) => s + d.monthly, 0);
  const free = income - q.mandatory - minDebt;
  const fail: Plan = { ok: false, free, shares: [], rows: [], wishes: [], debtFreeIn: null, tips };
  if (income <= 0) { tips.push('Укажите доход фиксированной суммой в месяц: без неё план не посчитать.'); return fail; }
  if (free <= 0) {
    tips.push('Обязательные расходы и платежи по долгам занимают весь доход. Это не провал, это сигнал, с чего начать.');
    tips.push('Проверьте, нет ли в обязательных расходах лишнего: подписки, тарифы, дорогие продукты.');
    tips.push('Если платежи по кредитам непосильны, обратитесь в банк за реструктуризацией или кредитными каникулами.');
    if (p.wishes.length) tips.push('Все хотелки лучше отложить: пока нет свободных денег, они только увеличат долги.');
    return fail;
  }

  const hasDebt = q.debts.some((d) => d.balance > 0);
  const grow = q.goals.includes('grow');
  const wl = q.wishes.filter((x) => x.cost > 0).sort((a, b) => (a.months ?? 9999) - (b.months ?? 9999));
  const results: WishResult[] = wl.map((x) => ({ id: x.id, name: x.name, cost: x.cost, wanted: x.months, reachedIn: null }));
  const rows: Row[] = [];
  let shares: Share[] = [], pool = 0, wi = 0, resT = 0, grT = 0;
  let debtFreeIn: number | null = hasDebt ? null : 0;
  const limit = !hasDebt && wl.length === 0 ? 12 : 360;

  for (let m = 1; m <= limit; m++) {
    let minPaid = 0;
    for (const d of q.debts) {
      if (d.balance <= 0) continue;
      d.balance += (d.balance * d.rate) / 1200;
      const x = Math.min(d.monthly, d.balance);
      d.balance -= x;
      minPaid += x;
    }
    const money = Math.max(0, income - q.mandatory - minPaid);
    const debtOn = q.debts.some((d) => d.balance > 0.5);
    const raw = {
      debt: debtOn ? Math.max(0, allocation.debt) : 0,
      reserve: Math.max(0, allocation.reserve),
      wishes: wi < wl.length ? Math.max(0, allocation.wishes) : 0,
      growth: grow ? Math.max(0, allocation.growth) : 0,
    };
    const sum = raw.debt + raw.reserve + raw.wishes + raw.growth;
    const w = sum > 0 ? raw : { ...raw, reserve: 100 };
    const denom = sum > 0 ? sum : 100;
    let minDebtPart = (money * w.debt) / denom;
    let aRes = (money * w.reserve) / denom;
    const aWish = (money * w.wishes) / denom;
    const aGr = (money * w.growth) / denom;

    let left = minDebtPart;
    for (const d of q.debts.filter((x) => x.balance > 0.5).sort((a, b) => b.rate - a.rate)) {
      const x = Math.min(left, d.balance);
      d.balance -= x;
      left -= x;
    }
    minDebtPart -= left;
    aRes += left;

    pool += aWish;
    while (wi < wl.length && pool >= wl[wi].cost) {
      pool -= wl[wi].cost;
      results[wi].reachedIn = m;
      wi++;
    }
    resT += aRes;
    grT = grT * (1 + GROWTH_YEAR / 12) + aGr;
    const debtLeft = q.debts.reduce((s, d) => s + Math.max(0, d.balance), 0);
    if (hasDebt && debtFreeIn === null && debtLeft <= 0.5) debtFreeIn = m;
    rows.push({ month: m, debts: minPaid + minDebtPart, reserve: aRes, wishes: aWish, growth: aGr, debtLeft, wishSaved: pool, reserveTotal: resT, growthTotal: grT });

    if (m === 1) {
      const pc = (v: number) => (v / income) * 100;
      shares = [
        { key: 'mandatory', label: 'Обязательные расходы', rub: q.mandatory, pct: pc(q.mandatory) },
        { key: 'debtMin', label: 'Платежи по долгам', rub: minPaid, pct: pc(minPaid) },
        { key: 'debtExtra', label: 'Досрочно в долги', rub: minDebtPart, pct: pc(minDebtPart) },
        { key: 'reserve', label: 'Неприкосновенная подушка', rub: aRes, pct: pc(aRes) },
        { key: 'wishes', label: 'Хотелки и мечты', rub: aWish, pct: pc(aWish) },
        { key: 'growth', label: 'Рост (сложный процент)', rub: aGr, pct: pc(aGr) },
      ].filter((s) => s.rub > 0.5);
    }
    if (limit === 360 && debtLeft <= 0.5 && wi >= wl.length) break;
  }

  if (hasDebt && debtFreeIn !== null) tips.push('Все долги закроются примерно через ' + months(debtFreeIn) + '. После этого доля долгов автоматически перейдёт в накопления и цели.');
  if (hasDebt && debtFreeIn === null) tips.push('При таких платежах долги почти не уменьшаются из-за процентов. Обратитесь в банк, чтобы снизить ставку или рефинансировать кредит.');
  const late = results.filter((r) => r.reachedIn === null || (r.wanted !== null && r.reachedIn > r.wanted));
  for (const r of late) {
    const when = r.reachedIn === null ? 'не удаётся накопить за 30 лет' : 'получится через ' + months(r.reachedIn) + ' вместо ' + months(r.wanted as number);
    tips.push('«' + r.name + '» (' + rub(r.cost) + '): ' + when + '.' + (hasDebt ? ' Пока есть долги, деньги идут сначала на них.' : ''));
  }
  if (late.length) {
    const big = [...late].sort((a, b) => b.cost - a.cost)[0];
    tips.push('Чтобы успеть быстрее, уберите из плана «' + big.name + '» или перенесите её на потом: у хотелок нет срочности.');
  }
  if (shares.length && (shares.find((s) => s.key === 'reserve')?.pct ?? 0) < 10) tips.push('Золотое правило: откладывать хотя бы десятую часть дохода. Подушка остаётся неприкосновенной.');
  return { ok: true, free, shares, rows, wishes: results, debtFreeIn, tips };
}

export type Verdict = { id: string; name: string; cost: number; kind: 'keep' | 'postpone' | 'drop'; title: string; reason: string };
export function analyzeWishes(p: Profile): Verdict[] {
  const list = p.wishes.filter((w) => w.cost > 0);
  const minDebt = p.debts.reduce((s, d) => s + d.monthly, 0);
  const free = totalIncome(p) - p.mandatory - minDebt;
  const base = free > 0 ? buildPlan(p) : null;
  return list.map((w) => {
    const name = w.name || 'Без названия', head = { id: w.id, name, cost: w.cost };
    if (!base || !base.ok) return { ...head, kind: 'postpone' as const, title: 'Отложить', reason: 'Сейчас свободных денег нет, а «' + name + '» (' + rub(w.cost) + ') не срочная.' };
    const without = buildPlan({ ...p, wishes: p.wishes.filter((x) => x.id !== w.id) });
    const mine = base.wishes.find((x) => x.id === w.id), r = mine ? mine.reachedIn : null, wanted = mine ? mine.wanted : null;
    const late = r === null || (wanted !== null && r > wanted);
    if (r === null) return { ...head, kind: 'drop' as const, title: 'Лишняя, уберите', reason: 'Накопить на «' + name + '» (' + rub(w.cost) + ') не получится за 30 лет при текущих данных.' };
    if (base.debtFreeIn === null && without.debtFreeIn !== null) return { ...head, kind: 'drop' as const, title: 'Лишняя сейчас', reason: 'Без «' + name + '» долги закрылись бы примерно через ' + months(without.debtFreeIn as number) + ', а с ней они не закрываются вовсе.' };
    if (late) return { ...head, kind: 'postpone' as const, title: 'Отложить или сдвинуть срок', reason: 'Успеть к сроку не получится: накопим через ' + months(r) + (wanted !== null ? ' вместо ' + months(wanted) : '') + '.' };
    return { ...head, kind: 'keep' as const, title: 'Можно оставить', reason: 'Укладывается' + (wanted !== null ? ' в желаемый срок' : '') + ': накопим через ' + months(r) + '.' };
  });
}
