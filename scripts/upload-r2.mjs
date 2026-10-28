import {readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash,createHmac} from 'node:crypto';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const hash=b=>createHash('sha256').update(b).digest('hex');
const hmac=(k,s)=>createHmac('sha256',k).update(s).digest();
const encode=s=>encodeURIComponent(s).replace(/[!'()*]/g,c=>'%'+c.charCodeAt(0).toString(16).toUpperCase());
async function walk(dir){let out=[];for(const d of await readdir(dir,{withFileTypes:true})){const f=path.join(dir,d.name);if(d.isDirectory())out.push(...await walk(f));else if(d.isFile()&&/\.(webp|png|jpe?g|gif|svg|avif|mp4|webm|mov)$/i.test(f))out.push(f);}return out.sort();}
const types={webp:'image/webp',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',gif:'image/gif',svg:'image/svg+xml',avif:'image/avif',mp4:'video/mp4',webm:'video/webm',mov:'video/quicktime'};
async function main(){
 const files=[];
 for(const f of await walk(path.join(root,'assets'))){const body=await readFile(f),sha256=hash(body),local=path.relative(root,f).split(path.sep).join('/');files.push({local,bytes:body.length,sha256,key:`portfolio/${sha256}${path.extname(f).toLowerCase()}`});}
 if(!process.argv.includes('--upload')){console.log(JSON.stringify({files:files.length,bytes:files.reduce((n,f)=>n+f.bytes,0),message:'Plan only; originals untouched. Fill .env then run npm run r2:upload.'},null,2));return;}
 const env={};for(const line of (await readFile(path.join(root,'.env'),'utf8')).split(/\r?\n/)){const m=line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);if(m)env[m[1]]=m[2].replace(/^(['"])(.*)\1$/,'$2');}
 for(const key of ['R2_ACCOUNT_ID','R2_ACCESS_KEY_ID','R2_SECRET_ACCESS_KEY','R2_BUCKET','R2_PUBLIC_BASE_URL'])if(!env[key])throw Error(`Missing ${key} in local .env`);
 if(!/^[a-f0-9]{32}$/i.test(env.R2_ACCOUNT_ID))throw Error('Invalid account ID');
 const base=new URL(env.R2_PUBLIC_BASE_URL);if(base.protocol!=='https:'||base.username||base.password||base.search||base.hash)throw Error('Public base must be a public HTTPS URL without credentials/query/hash');
 const host=`${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
 async function request(method,file,body){
  const date=new Date().toISOString().replace(/[:-]|\.\d{3}/g,''),day=date.slice(0,8),scope=`${day}/auto/s3/aws4_request`;
  const uri='/'+[env.R2_BUCKET,...file.key.split('/')].map(encode).join('/');
  const headers={'host':host,'x-amz-content-sha256':hash(body||''),'x-amz-date':date};
  if(method==='PUT'){headers['content-type']=types[path.extname(file.local).slice(1)];headers['cache-control']='public, max-age=31536000, immutable';headers['if-none-match']='*';}
  const keys=Object.keys(headers).sort(),signed=keys.join(';');
  const canonical=[method,uri,'',keys.map(k=>`${k}:${headers[k]}\n`).join(''),signed,headers['x-amz-content-sha256']].join('\n');
  const signing=hmac(hmac(hmac(hmac('AWS4'+env.R2_SECRET_ACCESS_KEY,day),'auto'),'s3'),'aws4_request');
  const signature=hmac(signing,`AWS4-HMAC-SHA256\n${date}\n${scope}\n${hash(canonical)}`).toString('hex');
  headers.authorization=`AWS4-HMAC-SHA256 Credential=${env.R2_ACCESS_KEY_ID}/${scope}, SignedHeaders=${signed}, Signature=${signature}`;
  return fetch(`https://${host}${uri}`,{method,headers,body:body||undefined,signal:AbortSignal.timeout(180000)});
 }
 for(const [i,f] of files.entries()){
  const head=await request('HEAD',f);
  if(head.status===404){const result=await request('PUT',f,await readFile(path.join(root,f.local)));if(!result.ok&&result.status!==412)throw Error(`Upload HTTP ${result.status}: ${f.local}`);}
  else if(!head.ok)throw Error(`HEAD HTTP ${head.status}: ${f.local}`);
  else if(Number(head.headers.get('content-length'))!==f.bytes)throw Error(`Existing object size mismatch: ${f.local}`);
  f.url=base.href.replace(/\/$/,'')+'/'+f.key.split('/').map(encode).join('/');
  const publicCheck=await fetch(f.url,{method:'HEAD',signal:AbortSignal.timeout(30000)});if(!publicCheck.ok)throw Error(`Public URL unavailable HTTP ${publicCheck.status}: ${f.local}`);
  console.log(`${i+1}/${files.length} ready: ${f.local}`);
 }
 await writeFile(path.join(root,'deployment/r2-manifest.json'),JSON.stringify({version:1,files},null,2)+'\n');
 console.log('Saved deployment/r2-manifest.json (public URLs only).');
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
