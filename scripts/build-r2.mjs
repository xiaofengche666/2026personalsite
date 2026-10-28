import {readFile,writeFile,readdir,mkdir,rm,copyFile} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..'),out=path.join(root,'dist');
const useR2=process.argv.includes('--r2');
const media=/\.(webp|png|jpe?g|gif|svg|avif|mp4|webm|mov)$/i;
function normalizeHTML(text){
 // Remove stale responsive choices: all widths must use the final local artwork.
 text=text.replace(/<img\b[^>]*>/gi,tag=>{
  let replacement;
  if(tag.includes('66278b003d703ccbcebcf4ae_footer-bg-image'))replacement='assets/images/66278b003d703ccbcebcf4ae_footer-bg-image-p-1600.jpg';
  if(tag.includes('66278b9a852c6f78b4c02ec7_footer-bg-image-front_big'))replacement='assets/images/66278b9a852c6f78b4c02ec7_footer-bg-image-front_big-p-1600.webp';
  if(replacement)return tag.replace(/\s+srcset=("[^"]*"|'[^']*')/gi,'').replace(/\bsrc=("[^"]*"|'[^']*')/i,`src="${replacement}"`);
  return tag;
 });
 // Old template social thumbnails/touch icon must not load unrelated artwork.
 text=text.replace(/https:\/\/cdn\.prod\.website-files\.com\/[^\s"'<>]+\.(?:jpg|png|webp)/g,'assets/images/project-01-cover.webp');
 return text;
}
async function main(){
 const manifest=useR2?JSON.parse(await readFile(path.join(root,'deployment/r2-manifest.json'),'utf8')):null;
 if(useR2&&!manifest.files?.length)throw Error('Upload manifest is empty');
 const rewrites=(text,file)=>{
  if(file.endsWith('.html'))text=normalizeHTML(text);
  if(!useR2)return text;
  // Single pass avoids replacing part of an already generated remote URL.
  const map=new Map();
  for(const f of manifest.files){
   if(!f.local.startsWith('assets/')||!/^https:\/\//.test(f.url))throw Error('Invalid manifest');
   const rel=path.relative(path.dirname(file),path.join(root,f.local)).split(path.sep).join('/');
   for(const v of [f.local,'/'+f.local,rel,'./'+rel])map.set(v,f.url);
  }
  const escape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const pattern=new RegExp([...map.keys()].sort((a,b)=>b.length-a.length).map(escape).join('|'),'g');
  return text.replace(pattern,v=>map.get(v));
 };
 await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
 async function copy(src,dst){await mkdir(dst,{recursive:true});for(const d of await readdir(src,{withFileTypes:true})){const a=path.join(src,d.name),b=path.join(dst,d.name);if(d.isDirectory())await copy(a,b);else if(d.isFile()&&d.name!=='.DS_Store'){
  if(/^(projects-data|project-detail)\.[a-f0-9]+\.js$/.test(d.name))continue;
  if(useR2&&media.test(a)&&!path.relative(root,a).split(path.sep).join('/').startsWith('assets/optimized/')){const local=path.relative(root,a).split(path.sep).join('/');if(!manifest.files.some(f=>f.local===local))throw Error(`Media missing from manifest: ${local}`);continue;}
  if(/\.(html|css|js|json)$/i.test(a))await writeFile(b,rewrites(await readFile(a,'utf8'),a));else await copyFile(a,b);
 }}}
 await copy(path.join(root,'assets'),path.join(out,'assets'));
 for(const name of ['index.html','project.html'])await writeFile(path.join(out,name),rewrites(await readFile(path.join(root,name),'utf8'),path.join(root,name)));
 const entryFiles={};
 for(const name of ['projects-data','project-detail']){
  const file=path.join(out,`assets/js/${name}.js`),body=await readFile(file);
  const digest=createHash('sha256').update(body).digest('hex').slice(0,12);
  const target=`assets/js/${name}.${digest}.js`;
  await writeFile(path.join(out,target),body);entryFiles[name]=target;
 }
 for(const name of ['index.html','project.html']){
  const file=path.join(out,name);let text=await readFile(file,'utf8');
  for(const [entry,target] of Object.entries(entryFiles))text=text.replace(new RegExp(`assets/js/${entry}(?:\\.[a-f0-9]+)?\\.js(?:\\?[^"']*)?`,'g'),target);
  const matches=[...text.matchAll(/(?:src|href)=["'](assets\/[^"'?]+\.(?:js|css))(?:\?[^"']*)?["']/g)];
  for(const match of matches){const body=await readFile(path.join(out,match[1]));const digest=createHash('sha256').update(body).digest('hex').slice(0,12);text=text.replace(match[0],match[0].replace(/(assets\/[^"']+)/,match[1]+'?v='+digest));}
  await writeFile(file,text);
 }
 await writeFile(path.join(out,'_headers'),'/\n  Cache-Control: no-cache\n/*.html\n  Cache-Control: no-cache\n/index\n  Cache-Control: no-cache\n/project\n  Cache-Control: no-cache\n/assets/js/*\n  Cache-Control: public, max-age=0, must-revalidate\n/assets/css/*\n  Cache-Control: public, max-age=0, must-revalidate\n/assets/optimized/*\n  Cache-Control: public, max-age=31536000, immutable\n');
 console.log(`Built dist/: ${useR2?'R2 media':'self-contained compressed media'}, source files unchanged.`);
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
