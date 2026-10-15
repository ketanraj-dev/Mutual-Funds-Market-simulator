import { generateScenario, FUNDS, type Game, type Result } from './engine';
export const KEY='fincelerate-mutual-funds-v2';
export const LEGACY_KEY='fincelerate-v1';
export type Settings={seed:string;tournament:boolean;ctaUrl:string;showQr:boolean;pinHash:string;salt:string};
export type Store={version:1;revision:number;settings:Settings;game:Game|null;results:Result[]};
export const defaults=():Store=>({version:1,revision:0,settings:{seed:'MAHOTSAV-2026',tournament:true,ctaUrl:'',showQr:false,pinHash:'',salt:''},game:null,results:[]});
export function load():Store{
  const raw=localStorage.getItem(KEY);if(!raw){
    const fresh=defaults();
    // Preserve the previous equity edition untouched; carry forward host settings only.
    const legacy=localStorage.getItem(LEGACY_KEY);
    if(legacy){try{const settings=JSON.parse(legacy).settings;if(typeof settings?.seed==='string' && typeof settings.pinHash==='string' && typeof settings.salt==='string' && typeof settings.tournament==='boolean' && typeof settings.ctaUrl==='string' && typeof settings.showQr==='boolean')fresh.settings={...fresh.settings,...settings};}catch{/* The equity backup remains untouched. */}}
    return fresh;
  }
  const s=JSON.parse(raw) as Store;
  if(s.version!==1 || !Number.isInteger(s.revision)||!Array.isArray(s.results)||typeof s.settings?.seed!=='string')throw Error('Saved data could not be read. Ask the event host to recover or export this browser’s data.');
  if(s.game){
    const g=s.game;if(!Number.isInteger(g.day)||g.day<1||g.day>5||!Number.isSafeInteger(g.cash)||g.cash<0||!Array.isArray(g.trades)||typeof g.scenario?.seed!=='string'||FUNDS.some(st=>!Number.isSafeInteger(g.holdings?.[st.symbol])||g.holdings[st.symbol]<0||!Number.isSafeInteger(g.costs?.[st.symbol])||g.costs[st.symbol]<0))throw Error('Saved game is invalid. Please ask the event host for help.');
    g.scenario=generateScenario(g.scenario.seed);
  }
  return s;
}
export function save(s:Store){const existing=localStorage.getItem(KEY);if(existing && JSON.parse(existing).revision!==s.revision)throw Error('This game changed in another tab. Reload before investing.');const next={...s,revision:s.revision+1};localStorage.setItem(KEY,JSON.stringify(next));return next;}
export async function hashPin(pin:string,salt:string){const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(`${salt}:${pin}`));return Array.from(new Uint8Array(digest),n=>n.toString(16).padStart(2,'0')).join('');}
export function safeUrl(url:string){try{const parsed=new URL(url);return ['https:','http:'].includes(parsed.protocol)&&!parsed.username&&!parsed.password;}catch{return false;}}
