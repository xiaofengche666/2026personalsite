import {readFile} from 'node:fs/promises';
const manifest=JSON.parse(await readFile(new URL('../deployment/r2-manifest.json',import.meta.url),'utf8'));
let failed=0;
for(const file of manifest.files){
 try{
  const response=await fetch(file.url,{method:'HEAD',headers:{Origin:'http://localhost:4186'},signal:AbortSignal.timeout(20000)});
  if(!response.ok)throw Error(`HTTP ${response.status}`);
  const size=response.headers.get('content-length');
  if(size!==null&&Number(size)!==file.bytes)throw Error(`Size mismatch: ${size} / ${file.bytes}`);
  if(!response.headers.get('access-control-allow-origin'))console.log('CORS not configured:',file.local);
  console.log('OK',file.local);
 }catch(error){failed++;console.log('FAIL',file.local,error.message);}
}
console.log(`${manifest.files.length-failed}/${manifest.files.length} resources accessible`);
process.exitCode=failed?1:0;
