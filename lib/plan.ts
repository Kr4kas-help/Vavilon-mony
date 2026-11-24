import { rub, totalIncome, type Profile } from './types';

export type Row={month:number;debts:number;reserve:number;wishes:number;growth:number;debtLeft:number;wishSaved:number;reserveTotal:number;growthTotal:number};
export type Share={key:string;label:string;rub:number;pct:number};
export type WishResult={id:string;name:string;cost:number;wanted:number|null;reachedIn:number|null};
export type Plan={ok:boolean;free:number;shares:Share[];rows:Row[];wishes:WishResult[];debtFreeIn:number|null;tips:string[]};
const GROWTH_YEAR=0.08;
export function months(n:number){const y=Math.floor(n/12),m=n%12;const yy=y%10===1&&y%100!==11?'год':[2,3,4].includes(y%10)&&![12,13,14].includes(y%100)?'года':'лет';const o:string[]=[];if(y)o.push(y+' '+yy);if(m||!y)o.push(m+' мес.');return o.join(' ');}
export function buildPlan(p:Profile):Plan {
 const a=p.allocation||{mandatory:50,debt:35,reserve:10,wishes:5,growth:0};
 const allocation={debt:a.debt,reserve:a.reserve,wishes:a.wishes,growth:a.growth};
 const income=totalIncome(p), q:Profile={...p,income,allocation};
 const tips:string[]=[], minDebt=q.debts.reduce((s,d)=>s+d.monthly,0), free=income-q.mandatory-minDebt;
 const fail:Plan={ok:false,free,shares:[],rows:[],wishes:[],debtFreeIn:null,tips};
 if(income<=0){tips.push('Укажите доход фиксированной суммой в месяц: без неё план не посчитать.');return fail;}
 if(free<=0){tips.push('Обязательные расходы и платежи по долгам занимают весь доход. Это сигнал, с чего начать.');return fail;}
 const hasDebt=q.debts.some(d=>d.balance>0), grow=q.goals.includes('grow');
 const wl=q.wishes.filter(x=>x.cost>0).sort((x,y)=>(x.months??9999)-(y.months??9999));
 const results:WishResult[]=wl.map(x=>({id:x.id,name:x.name,cost:x.cost,wanted:x.months,reachedIn:null}));
 const rows:Row[]=[], shares:Share[]=[];let pool=0,wi=0,resT=0,grT=0;let debtFreeIn:number|null=hasDebt?null:0;
 const limit=!hasDebt&&wl.length===0?12:360;
 for(let m=1;m<=limit;m++){
  let minPaid=0;
  for(const d of q.debts){if(d.balance<=0)continue;d.balance+=(d.balance*d.rate)/1200;const x=Math.min(d.monthly,d.balance);d.balance-=x;minPaid+=x;}
  const money=Math.max(0,income-q.mandatory-minPaid),debtOn=q.debts.some(d=>d.balance>0.5);
  const raw={debt:debtOn?Math.max(0,allocation.debt):0,reserve:Math.max(0,allocation.reserve),wishes:wi<wl.length?Math.max(0,allocation.wishes):0,growth:grow?Math.max(0,allocation.growth):0};
  const sum=raw.debt+raw.reserve+raw.wishes+raw.growth, w=sum>0?raw:{debt:0,reserve:100,wishes:0,growth:0}, denom=sum>0?sum:100;
  let debtPart=money*w.debt/denom,aRes=money*w.reserve/denom;const aWish=money*w.wishes/denom,aGr=money*w.growth/denom;
  let left=debtPart;for(const d of q.debts.filter(x=>x.balance>0.5).sort((x,y)=>y.rate-x.rate)){const x=Math.min(left,d.balance);d.balance-=x;left-=x;}debtPart-=left;aRes+=left;
  pool+=aWish;while(wi<wl.length&&pool>=wl[wi].cost){pool-=wl[wi].cost;results[wi].reachedIn=m;wi++;}
  resT+=aRes;grT=grT*(1+GROWTH_YEAR/12)+aGr;const debtLeft=q.debts.reduce((s,d)=>s+Math.max(0,d.balance),0);if(hasDebt&&debtFreeIn===null&&debtLeft<=0.5)debtFreeIn=m;
  rows.push({month:m,debts:minPaid+debtPart,reserve:aRes,wishes:aWish,growth:aGr,debtLeft,wishSaved:pool,reserveTotal:resT,growthTotal:grT});
  if(m===1){const pc=(v:number)=>v/income*100;shares.push({key:'mandatory',label:'Обязательные расходы',rub:q.mandatory,pct:pc(q.mandatory)},{key:'debtMin',label:'Платежи по долгам',rub:minPaid,pct:pc(minPaid)},{key:'debtExtra',label:'Досрочно в долги',rub:debtPart,pct:pc(debtPart)},{key:'reserve',label:'Неприкосновенная подушка',rub:aRes,pct:pc(aRes)},{key:'wishes',label:'Хотелки и мечты',rub:aWish,pct:pc(aWish)},{key:'growth',label:'Рост (сложный процент)',rub:aGr,pct:pc(aGr)});}
  if(limit===360&&debtLeft<=0.5&&wi>=wl.length)break;
 }
 const late=results.filter(r=>r.reachedIn===null||(r.wanted!==null&&r.reachedIn>r.wanted));
 if(hasDebt&&debtFreeIn!==null)tips.push('Все долги закроются примерно через '+months(debtFreeIn)+'. После этого доля долгов автоматически перейдёт в накопления и цели.');
 for(const r of late){const when=r.reachedIn===null?'не удаётся накопить за 30 лет':'получится через '+months(r.reachedIn)+' вместо '+months(r.wanted as number);tips.push('«'+r.name+'» ('+rub(r.cost)+'): '+when+'.');}
 if(shares.length&&(shares.find(s=>s.key==='reserve')?.pct??0)<10)tips.push('Подушка остаётся неприкосновенной.');
 return {ok:true,free,shares:shares.filter(s=>s.rub>0.5),rows,wishes:results,debtFreeIn,tips};
}
export type Verdict={id:string;name:string;cost:number;kind:'keep'|'postpone'|'drop';title:string;reason:string};
export function analyzeWishes(p:Profile):Verdict[]{return p.wishes.filter(w=>w.cost>0).map(w=>{const base=buildPlan(p),mine=base.wishes.find(x=>x.id===w.id),name=w.name||'Без названия';if(!mine||mine.reachedIn===null)return{id:w.id,name,cost:w.cost,kind:'drop' as const,title:'Лишняя, уберите',reason:'Накопить за 30 лет не получится.'};if(mine.wanted!==null&&mine.reachedIn>mine.wanted)return{id:w.id,name,cost:w.cost,kind:'postpone' as const,title:'Отложить или сдвинуть срок',reason:'Накопим позже желаемого срока.'};return{id:w.id,name,cost:w.cost,kind:'keep' as const,title:'Можно оставить',reason:'Цель укладывается в рассчитанный срок.'});});}
