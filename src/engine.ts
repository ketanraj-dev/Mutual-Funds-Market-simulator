export const CAPITAL = 10_000_000; // All money is integer paise.
export const DAYS = 5;
export const POINTS = 1; // Mutual funds have one simulated NAV per day.
export const SCENARIO_VERSION = 'mutual-fund-v2';
export const FUNDS = [
  {symbol:'DURGA',name:'Durga Flexi Cap Fund',sector:'Flexi Cap Equity',start:5000,risk:'High',vol:.018,drift:.0003,color:'#6e72d9',icon:'cpu',description:'A fictional diversified equity fund investing across large, mid and small companies.'},
  {symbol:'LAKSHMI',name:'Lakshmi Short Duration Fund',sector:'Debt',start:2500,risk:'Low',vol:.002,drift:.0001,color:'#b48b45',icon:'landmark',description:'A fictional debt fund holding shorter-duration bonds. Interest-rate and credit risks remain.'},
  {symbol:'SARAS',name:'Saraswati Index Fund',sector:'Broad-market Equity',start:10000,risk:'High',vol:.012,drift:.0002,color:'#4388be',icon:'code',description:'A fictional index fund following a diversified basket of large-company equities.'},
  {symbol:'KALI',name:'Kali Small Cap Fund',sector:'Small Cap Equity',start:3500,risk:'Very High',vol:.029,drift:0,color:'#ce8541',icon:'zap',description:'A fictional equity fund investing in smaller businesses with larger potential NAV swings.'},
  {symbol:'PARVATI',name:'Parvati Conservative Hybrid Fund',sector:'Hybrid',start:2000,risk:'Medium',vol:.006,drift:.0001,color:'#459e91',icon:'heart',description:'A fictional mix of predominantly debt and a smaller equity allocation.'},
  {symbol:'SHAKTI',name:'Shakti Mid Cap Fund',sector:'Mid Cap Equity',start:4000,risk:'Very High',vol:.022,drift:.0002,color:'#b3698d',icon:'car',description:'A fictional diversified portfolio of medium-sized companies, with higher equity risk.'},
  {symbol:'ANNAP',name:'Annapurna Liquid Fund',sector:'Liquid / Debt',start:1000,risk:'Low',vol:.0008,drift:.0001,color:'#70a05c',icon:'wheat',description:'A fictional fund holding short-maturity money-market instruments. Low risk does not mean risk-free.'},
  {symbol:'MAHISHA',name:'Mahishasura Sectoral Fund',sector:'Metals & Infrastructure Equity',start:3000,risk:'Very High',vol:.031,drift:-.0001,color:'#7c8797',icon:'factory',description:'A fictional concentrated equity fund exposed to the metals and infrastructure cycle.'},
] as const;
export type Symbol = typeof FUNDS[number]['symbol'];
export type Point = {index:number;day:number;time:string;price:number};
export type News = {symbol:Symbol;tone:'positive'|'negative'|'neutral';text:string};
export type Scenario = {id:string;seed:string;prices:Record<Symbol,Point[]>;news:News[][]};
export type Trade = {id:string;day:number;symbol:Symbol;side:'buy'|'sell';quantity:number;price:number;realized:number};
export type Game = {id:string;name:string;scenario:Scenario;mode:'tournament'|'practice';day:number;cash:number;holdings:Record<Symbol,number>;costs:Record<Symbol,number>;trades:Trade[];finishedAt:number|null};
export type Result = {id:string;name:string;scenarioId:string;value:number;cash:number;completedAt:number;returnPct:number};
export function seeded(seed:string) {
  let h=2166136261;
  for(const ch of seed) h=Math.imul(h ^ ch.charCodeAt(0),16777619);
  return () => { h += 0x6D2B79F5; let t=h; t=Math.imul(t ^ t>>>15,t|1);t^=t+Math.imul(t ^ t>>>7,t|61);return ((t ^ t>>>14)>>>0)/4294967296; };
}
function freeze<T>(value:T):T { if(value && typeof value==='object'){Object.freeze(value);Object.values(value).forEach(v=>{if(v && typeof v==='object' && !Object.isFrozen(v))freeze(v);});}return value; }
export function generateScenario(seed:string):Scenario {
  const random=seeded(seed);
  const normal=()=>Math.sqrt(-2*Math.log(Math.max(random(),.000001)))*Math.cos(2*Math.PI*random());
  const sentiment=Array.from({length:DAYS},()=>normal()*.0015);
  const news:News[][]=[];
  const shocks:Partial<Record<Symbol,number>>[]=[];
  for(let d=0;d<DAYS;d++){
    const indexes=[Math.floor(random()*8)];indexes.push((indexes[0]+1+Math.floor(random()*7))%8);
    shocks[d]={};news[d]=indexes.map(index=>{
      const s=FUNDS[index]; const draw=d===0?.9:random(); const tone=draw<.4?'positive':draw<.8?'negative':'neutral';
      shocks[d][s.symbol]=(tone==='positive'?1:tone==='negative'?-1:0)*s.vol*(2+random()*3);
      const text=tone==='positive'?`${s.name}: its underlying portfolio benefits from improving market conditions.`:tone==='negative'?`${s.name}: pressure on its underlying assets weighs on today’s NAV.`:`${s.name}: no major portfolio development in today’s simulated fund update.`;
      return {symbol:s.symbol,tone,text};
    });
  }
  const prices={} as Scenario['prices'];
  for(const s of FUNDS){
    let price:number=s.start;const history:Point[]=[];
    for(let d=0;d<DAYS;d++){
      const regime=random()<.28?.3:1;const drift=s.drift+(random()-.5)*.0015;
      for(let p=0;p<POINTS;p++){
        if(d!==0 || p!==0){
          const shock=p===0?(shocks[d][s.symbol]??0):0;
          const jump=random()<.035?normal()*s.vol*2.5:0;
          const meanReversion=Math.log(s.start/price)*.002;
          const change=Math.max(-.12,Math.min(.12,drift+sentiment[d]*Math.min(1,s.vol/.01)+normal()*s.vol*regime+shock+jump+meanReversion));
          price=Math.max(Math.round(s.start*.2),Math.min(s.start*4,Math.round(price*Math.exp(change))));
        }
        history.push({index:d,day:d+1,time:'Daily NAV',price});
      }
    }
    prices[s.symbol]=history;
  }
  return freeze({id:`${SCENARIO_VERSION}:${seed}`,seed,prices,news});
}
export const emptyPositions=()=>Object.fromEntries(FUNDS.map(s=>[s.symbol,0])) as Record<Symbol,number>;
export function newGame(name:string,scenario:Scenario,mode:Game['mode'],id:string=crypto.randomUUID()):Game {
  if(!name.trim() || name.trim().length>32)throw Error('Enter a name between 1 and 32 characters.');
  return {id,name:name.trim(),scenario,mode,day:1,cash:CAPITAL,holdings:emptyPositions(),costs:emptyPositions(),trades:[],finishedAt:null};
}
export const quote=(g:Game,s:Symbol)=>g.scenario.prices[s][g.day*POINTS-1].price;
export const revealed=(g:Game,s:Symbol)=>g.scenario.prices[s].slice(0,g.day*POINTS);
export function valuation(g:Game){
  const invested=FUNDS.reduce((sum,s)=>sum+g.holdings[s.symbol]*quote(g,s.symbol),0);
  const cost=Object.values(g.costs).reduce((a,b)=>a+b,0);
  const total=g.cash+invested;const profit=total-CAPITAL;
  const realized=g.trades.reduce((sum,t)=>sum+t.realized,0);
  return {invested,total,profit,percent:profit/CAPITAL*100,realized,unrealized:invested-cost};
}
export function trade(g:Game,symbol:Symbol,side:'buy'|'sell',quantity:number):Game {
  if(g.finishedAt!==null)throw Error('This challenge is complete. Start a new round.');
  if(!FUNDS.some(s=>s.symbol===symbol))throw Error('Unknown fund.');
  if(side!=='buy' && side!=='sell')throw Error('Unknown order type.');
  if(!Number.isSafeInteger(quantity)||quantity<=0)throw Error('Enter a positive whole number of fund units.');
  const price=quote(g,symbol),amount=price*quantity;
  if(!Number.isSafeInteger(amount))throw Error('Quantity is too large.');
  if(side==='buy' && amount>g.cash)throw Error('Not enough available cash for this order.');
  if(side==='sell' && quantity>g.holdings[symbol])throw Error('You cannot redeem more fund units than you own.');
  const removedCost=side==='sell'?Math.round(g.costs[symbol]*quantity/g.holdings[symbol]):0;
  return {...g,cash:g.cash+(side==='buy'?-amount:amount),holdings:{...g.holdings,[symbol]:g.holdings[symbol]+(side==='buy'?quantity:-quantity)},costs:{...g.costs,[symbol]:g.costs[symbol]+(side==='buy'?amount:-removedCost)},trades:[...g.trades,{id:`${g.id}-${g.trades.length}`,symbol,side,quantity,price,day:g.day,realized:side==='sell'?amount-removedCost:0}]};
}
export function advance(g:Game):Game { if(g.finishedAt!==null||g.day>=DAYS)throw Error('You are already on the final investing day.');return {...g,day:g.day+1}; }
export function finish(g:Game,time=Date.now()):Game {if(g.day!==DAYS)throw Error('Complete all five days first.');return {...g,finishedAt:g.finishedAt??time};}
export function result(g:Game):Result {if(g.finishedAt===null)throw Error('Finish this challenge first.');return {id:g.id,name:g.name,scenarioId:g.scenario.id,value:valuation(g).total,cash:g.cash,completedAt:g.finishedAt,returnPct:valuation(g).percent};}
export function rankings(results:Result[],scenarioId:string){return results.filter(r=>r.scenarioId===scenarioId).sort((a,b)=>b.value-a.value||b.cash-a.cash||a.completedAt-b.completedAt||a.id.localeCompare(b.id));}
export function title(percent:number){return percent>=20?'Market Maharaja':percent>=10?'Investment Champion':percent>=3?'Smart Investor':percent>=0?'Market Explorer':'Future Market Pro';}
export function insight(g:Game){const symbols=new Set(g.trades.filter(t=>t.side==='buy').map(t=>t.symbol));return symbols.size>=4?'You explored several fund categories. Different funds can hold overlapping assets. Diversification can help spread risk, though it cannot prevent every loss.':symbols.size===0?'You stayed in cash. It preserves your virtual capital here, but real-world cash also faces inflation.':g.trades.length>12?'Frequent mutual fund redemptions can involve exit loads and taxes in real investing. This game omits them.':'Short-term markets are unpredictable. A longer horizon and diversification can help you manage uncertainty.';}
