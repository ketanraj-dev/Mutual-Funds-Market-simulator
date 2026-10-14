import { beforeEach, describe, expect, it, vi } from 'vitest';
import { advance, finish, generateScenario, newGame, result, trade } from './engine';
import { defaults, hashPin, KEY, load, safeUrl, save } from './storage';
const data=new Map<string,string>();
beforeEach(()=>{data.clear();vi.stubGlobal('localStorage',{getItem:(k:string)=>data.get(k)??null,setItem:(k:string,v:string)=>data.set(k,v)});});
describe('persistence and event settings',()=>{
 it('recovers an active round with fixed market history',()=>{const g=trade(advance(newGame('Player',generateScenario('saved'),'tournament','one')),'DURGA','buy',4);save({...defaults(),game:g});expect(load().game).toEqual(g);expect(Object.isFrozen(load().game!.scenario.prices.DURGA)).toBe(true);});
 it('keeps results when the next visitor starts',()=>{let g=newGame('First',generateScenario('event'),'tournament','one');for(let i=0;i<4;i++)g=advance(g);g=finish(g,123);const stored=save({...defaults(),game:g,results:[result(g)]});save({...stored,game:newGame('Second',g.scenario,'tournament','two')});expect(load().results).toHaveLength(1);expect(load().game!.cash).toBe(10000000);});
 it('rejects stale cross-tab writes instead of overwriting a round',()=>{const first=defaults();save(first);expect(()=>save(first)).toThrow(/another tab/);});
 it('leaves corrupt data untouched',()=>{data.set(KEY,'bad-json');expect(()=>load()).toThrow();expect(data.get(KEY)).toBe('bad-json');});
 it('does not pretend a failed write was saved',()=>{vi.stubGlobal('localStorage',{getItem:()=>null,setItem:()=>{throw Error('quota exceeded');}});expect(()=>save(defaults())).toThrow(/quota/);});
 it('only permits web destinations without embedded credentials',()=>{expect(safeUrl('https://example.org/path')).toBe(true);expect(safeUrl('javascript:alert(1)')).toBe(false);expect(safeUrl('https://a:b@example.org')).toBe(false);expect(safeUrl('invalid')).toBe(false);});
 it('hashes the PIN with a per-installation salt',async()=>{const hash=await hashPin('123456','salt-one');expect(hash).toHaveLength(64);expect(hash).not.toContain('123456');expect(await hashPin('123456','salt-two')).not.toBe(hash);});
});
