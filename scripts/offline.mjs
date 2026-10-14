import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const assets=(await readdir('dist/assets')).map(name=>'./assets/'+name);
const shell=['./','./index.html','./favicon.svg',...assets];
const version=createHash('sha256').update(await readFile('dist/index.html')).digest('hex').slice(0,12);
let sw=await readFile('public/sw.js','utf8');
sw=sw.replace("'fincelerate-shell-v1'",JSON.stringify('fincelerate-shell-'+version)).replace("['./','./index.html','./favicon.svg']",JSON.stringify(shell));
await writeFile('dist/sw.js',sw);
console.log(`Offline shell: ${shell.length} assets, version ${version}`);
