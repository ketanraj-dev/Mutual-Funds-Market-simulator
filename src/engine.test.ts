import { describe, expect, it } from 'vitest';
import { advance, CAPITAL, finish, generateScenario, newGame, quote, rankings, result, revealed, FUNDS, trade, valuation } from './engine';
const scenario=generateScenario('test-market');
const game=()=>newGame('Test player',scenario,'tournament','test-id');
describe('locked daily mutual fund NAVs',()=>{
 it('has eight distinct series of exactly five days and one NAV per day',()=>{expect(Object.keys(scenario.prices)).toHaveLength(8);for(const s of FUNDS){const p=scenario.prices[s.symbol];expect(p).toHaveLength(5);expect(p[0].price).toBe(s.start);for(let d=1;d<=5;d++)expect(p.filter(t=>t.day===d)).toHaveLength(1);expect(p.every(t=>Number.isSafeInteger(t.price)&&t.price>0)).toBe(true);}expect(new Set(Object.values(scenario.prices).map(p=>JSON.stringify(p))).size).toBe(8);});
 it('repeats by seed and varies with a different seed',()=>{expect(generateScenario('test-market')).toEqual(scenario);expect(generateScenario('different')).not.toEqual(scenario);});
 it('is deeply frozen and independent of trades',()=>{const before=JSON.stringify(scenario);let g=trade(game(),'DURGA','buy',1);g=trade(g,'DURGA','sell',1);expect(g.scenario).toBe(scenario);expect(()=>{scenario.prices.DURGA[0].price=1;}).toThrow();expect(JSON.stringify(scenario)).toBe(before);});
 it('reveals only current and past days without changing history',()=>{const g=game(),past=revealed(g,'KALI');expect(past).toHaveLength(1);const next=advance(g);expect(revealed(next,'KALI')).toHaveLength(2);expect(revealed(next,'KALI').slice(0,1)).toEqual(past);expect(g.day).toBe(1);});
 it('keeps low-risk movement quieter across many seeds',()=>{let low=0,high=0;for(let n=0;n<25;n++){const s=generateScenario(String(n));for(let i=1;i<5;i++){low+=Math.abs(Math.log(s.prices.ANNAP[i].price/s.prices.ANNAP[i-1].price));high+=Math.abs(Math.log(s.prices.KALI[i].price/s.prices.KALI[i-1].price));}}expect(high).toBeGreaterThan(low*2);});
});
describe('precision-safe trading',()=>{
 it('starts with exactly one lakh',()=>{expect(game().cash).toBe(CAPITAL);expect(valuation(game()).total).toBe(CAPITAL);});
 it('debits and credits cash at the displayed quote',()=>{const g=game(),p=quote(g,'DURGA');const bought=trade(g,'DURGA','buy',10);expect(bought.cash).toBe(CAPITAL-p*10);expect(bought.holdings.DURGA).toBe(10);expect(valuation(bought).total).toBe(CAPITAL);const sold=trade(bought,'DURGA','sell',4);expect(sold.cash).toBe(CAPITAL-p*6);expect(sold.holdings.DURGA).toBe(6);expect(sold.costs.DURGA).toBe(p*6);});
 it('rejects insufficient cash, overselling and invalid quantities',()=>{expect(()=>trade(game(),'DURGA','buy',999999)).toThrow(/cash/);expect(()=>trade(game(),'DURGA','sell',1)).toThrow(/own/);for(const q of [0,-1,1.5,NaN,Infinity,Number.MAX_SAFE_INTEGER+1])expect(()=>trade(game(),'DURGA','buy',q)).toThrow();});
 it('revalues holdings at new daily prices',()=>{const bought=trade(game(),'KALI','buy',10),next=advance(bought);expect(valuation(next).total).toBe(bought.cash+quote(next,'KALI')*10);expect(next.cash).toBe(bought.cash);});
 it('tracks realized and unrealized gains with partial sales',()=>{let g=trade(game(),'SARAS','buy',13);g=advance(g);g=trade(g,'SARAS','buy',7);g=advance(g);g=trade(g,'SARAS','sell',11);const v=valuation(g);expect(v.realized+v.unrealized).toBe(v.profit);g=trade(g,'SARAS','sell',9);expect(g.costs.SARAS).toBe(0);expect(valuation(g).unrealized).toBe(0);expect(valuation(g).realized).toBe(valuation(g).profit);});
 it('cannot manufacture profits from same-day trading',()=>{let g=game();for(let i=0;i<4;i++)g=advance(g);const value=valuation(g).total;g=trade(g,'ANNAP','buy',100);g=trade(g,'ANNAP','sell',100);expect(valuation(g).total).toBe(value);});
});
describe('progression and results',()=>{
 it('only advances explicitly and finishes on day five',()=>{let g=game();expect(()=>finish(g)).toThrow();for(let d=2;d<=5;d++){g=advance(g);expect(g.day).toBe(d);}expect(()=>advance(g)).toThrow();g=finish(g,1000);expect(g.finishedAt).toBe(1000);expect(()=>trade(g,'DURGA','buy',1)).toThrow();expect(finish(g,2000).finishedAt).toBe(1000);expect(result(g).value).toBe(CAPITAL);});
 it('values unliquidated positions at completion',()=>{let g=trade(game(),'PARVATI','buy',10);for(let i=0;i<4;i++)g=advance(g);expect(result(finish(g)).value).toBe(g.cash+quote(g,'PARVATI')*10);});
 it('sorts by value, cash, completion and isolates scenarios',()=>{const base={name:'A',scenarioId:scenario.id,value:CAPITAL,cash:100,completedAt:1000,returnPct:0};const rs=[{...base,id:'late',completedAt:2000},{...base,id:'early'},{...base,id:'cash',cash:200},{...base,id:'value',value:CAPITAL+1},{...base,id:'other',scenarioId:'other',value:999999999}];expect(rankings(rs,scenario.id).map(r=>r.id)).toEqual(['value','cash','early','late']);expect(rs[0].id).toBe('late');});
 it('restores exact data through JSON persistence',()=>{const g=trade(advance(game()),'KALI','buy',10);const restored=JSON.parse(JSON.stringify(g));expect(valuation(restored)).toEqual(valuation(g));expect(restored.scenario).toEqual(g.scenario);});
});

 describe('mutual fund holdings',()=>{
  it('tracks units, remaining invested amount and current NAV after redemption',()=>{let g=trade(game(),'DURGA','buy',100);expect(g.holdings.DURGA).toBe(100);expect(g.costs.DURGA).toBe(500000);g=advance(g);const nav=quote(g,'DURGA');g=trade(g,'DURGA','sell',40);expect(g.holdings.DURGA).toBe(60);expect(g.costs.DURGA).toBe(300000);expect(valuation(g).invested).toBe(nav*60);expect(g.cash).toBe(CAPITAL-500000+nav*40);});
  it('clears a fund from owned holdings after full redemption',()=>{let g=trade(game(),'PARVATI','buy',20);g=trade(g,'PARVATI','sell',20);expect(g.holdings.PARVATI).toBe(0);expect(g.costs.PARVATI).toBe(0);expect(valuation(g).invested).toBe(0);});
  it('keeps the mutual fund board separate from equity scenarios',()=>{expect(scenario.id).toBe('mutual-fund-v2:test-market');expect(rankings([{id:'old',name:'Equity player',scenarioId:'market-v1:test-market',value:CAPITAL,cash:CAPITAL,completedAt:1,returnPct:0}],scenario.id)).toEqual([]);});
 });
