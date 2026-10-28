const projects=window.portfolioProjects.slice(0,4);const id=new URLSearchParams(location.search).get('project')||'1';const index=Math.max(0,projects.findIndex(p=>p.id===id));const project=projects[index];const next=projects[(index+1)%projects.length];document.title=project.title+' — Fraser Li';for(const key of ['title','subtitle','category','year'])document.getElementById('case-'+key).textContent=project[key];if(!project.detailImages||!project.detailImages.length)document.getElementById('case-cover').src=project.image;document.getElementById('case-count').textContent=String(index+1).padStart(2,'0')+' / '+String(projects.length).padStart(2,'0');document.getElementById('case-next').href='project.html?project='+next.id;document.getElementById('case-next-title').textContent=next.title;
sessionStorage.setItem('portfolio-work-index',String(index));

const previous=projects[(index-1+projects.length)%projects.length];
document.getElementById('case-prev-arrow').href='project.html?project='+previous.id;
document.getElementById('case-next-arrow').href='project.html?project='+next.id;
document.querySelector('.case-back').addEventListener('click',function(){sessionStorage.setItem('portfolio-work-index',String(index));});

const analysisLink=document.getElementById('case-analysis-link');if(analysisLink)analysisLink.href=project.analysisUrl||'https://www.google.com/';
const scopeElement=document.getElementById('case-scope');if(scopeElement&&project.scope)scopeElement.textContent=project.scope;
let caseLang=new URLSearchParams(location.search).get('lang');
if(caseLang!=='en'&&caseLang!=='zh'){try{caseLang=localStorage.getItem('portfolio-language-chosen')==='true'&&localStorage.getItem('portfolio-language')==='en'?'en':'zh';}catch(e){caseLang='zh';}}
document.documentElement.lang=caseLang==='zh'?'zh-CN':'en';
for(const link of document.querySelectorAll('.case-back,#case-prev-arrow,#case-next-arrow,#case-next')){const url=new URL(link.href,location.href);url.searchParams.set('lang',caseLang);if(url.pathname.endsWith('project.html'))url.searchParams.set('v','detail-four-projects-20261028');link.href=url.href;}
if(caseLang==='zh'){
 const translations={"CoinTR world cup & VIP":"CoinTR 世界杯 & VIP","VIEW DESIGN ANALYSIS":"查看设计分析","CLICK TO VIEW ↗":"点击跳转 ↗","MEXC Download Page Optimization (Based on Data Analysis)":"MEXC 下载页优化（基于数据分析）","AIGC generates design material images and videos":"AIGC 生成设计素材图片与视频","← ALL WORK": "← 全部作品", "ROLE": "职责", "Product Designer": "产品设计师", "SCOPE": "设计范围", "Research · UX · UI": "调研 · 体验 · 界面", "YEAR": "年份", "STATUS": "状态", "Template / Placeholder": "模板 / 占位内容", "01 / OVERVIEW": "01 / 项目概述", "A meaningful problem.": "发现真实问题", "A considered solution.": "设计有效方案", "This is a placeholder case study. The final project story, research insights, design decisions and visuals will be added here.": "这里是案例占位内容，后续将补充真实项目背景、研究洞察、设计决策及视觉稿", "The challenge": "设计挑战", "Describe the user problem, business context and constraints that shaped this project.": "在此介绍用户问题、业务背景及项目约束", "The approach": "设计方法", "Explain your role, the team, and how research informed the design direction.": "介绍你的职责、团队协作，以及研究如何指导设计方向", "PROJECT VISUAL / PLACEHOLDER": "项目视觉 / 占位内容", "YOUR NEXT": "打造下一个", "GREAT EXPERIENCE.": "出色体验", "Replace this area with a product screen, prototype or project image.": "此处将替换为产品界面、原型或项目图片", "02 / DESIGN PROCESS": "02 / 设计过程", "From insight": "从洞察出发", " to interaction.": "落地交互体验", "to interaction.": "落地交互体验", "Use this section to explain the key decisions behind the experience. Add research findings, user flows, wireframes and iterations.": "在此讲述体验背后的关键决策，并展示调研结论、用户流程、线框图和迭代过程", "Understand": "理解", "User needs, context and opportunities.": "理解用户需求、使用场景与设计机会", "Explore": "探索", "Flows, concepts and early prototypes.": "探索流程、设计概念与早期原型", "Refine": "打磨", "Visual systems and interaction details.": "完善视觉体系与交互细节", "DESKTOP EXPERIENCE": "桌面端体验", "MOBILE EXPERIENCE": "移动端体验", "03 / REFLECTION": "03 / 设计复盘", "Designed for impact.": "以设计创造价值", "Add verified outcomes and lessons learned here. No results or performance metrics are claimed in this template.": "此处将补充经过验证的成果与经验总结，当前模板不包含实际绩效数据", "NEXT PROJECT ↗": "下一个项目 ↗", "BACK TO TOP ↑": "返回顶部 ↑", "Designing a clearer digital experience": "设计更清晰的数字体验", "PRODUCT DESIGN / UIUX": "产品设计 / 用户体验", "FRASER.LI 2024–2026 PORTFOLIO": "FRASER.LI 2024–2026 作品集"};
 const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);const nodes=[];let node;
 while(node=walker.nextNode())if(!node.parentElement.closest('script,style,svg'))nodes.push(node);
 for(const node of nodes){const key=node.textContent.trim();if(translations[key])node.textContent=translations[key];else if(/^PROJECT \d+$/.test(key))node.textContent=key.replace('PROJECT','项目');}
 document.title='项目 '+String(index+1).padStart(2,'0')+' — Fraser Li';
 document.getElementById('case-prev-arrow').setAttribute('aria-label','上一个项目');document.getElementById('case-next-arrow').setAttribute('aria-label','下一个项目');
}

function mediaRetryURL(src, attempt) {
 const url=new URL(src,location.href);url.searchParams.set('retry',String(attempt)+'-'+Date.now());return url.href;
}
function mediaRetryButton(parent, retry) {
 const button=document.createElement('button');button.className='case-media-retry';button.type='button';
 button.textContent=caseLang==='zh'?'资源加载失败，点击重试':'Loading failed — tap to retry';
 button.addEventListener('click',function(){button.remove();retry();});parent.appendChild(button);return button;
}
if(project.detailImages&&project.detailImages.length){
 document.documentElement.classList.add('has-project-artwork');
 const main=document.querySelector('main');
 for(const element of main.querySelectorAll('.case-cover,.case-section,.case-canvas,.case-duo'))element.remove();
 const gallery=document.createElement('section');gallery.className='case-artwork-gallery';gallery.setAttribute('aria-label',caseLang==='zh'?'项目设计展示':'Project design presentation');
 project.detailImages.forEach(function(src,i){
  const picture=document.createElement('picture'),image=document.createElement('img');
  const variant=project.detailResponsive&&project.detailResponsive[i];
  const size=project.detailImageSizes&&project.detailImageSizes[i];
  let mobileSource=null,attempt=0,retryButton=null;
  if(size){image.width=size.width;image.height=size.height;}
  if(variant){mobileSource=document.createElement('source');mobileSource.media='(max-width:767px)';mobileSource.srcset=variant.mobile;picture.appendChild(mobileSource);}
  const displaySrc=variant?variant.desktop:src;
  image.alt=project.subtitle+' — '+(i+1);image.loading=i===0?'eager':'lazy';image.fetchPriority=i===0?'high':'low';image.decoding='async';
  function retry(){attempt++;if(mobileSource)mobileSource.srcset=mediaRetryURL(variant.mobile,attempt);image.src=mediaRetryURL(displaySrc,attempt);}
  image.addEventListener('load',function(){if(retryButton){retryButton.remove();retryButton=null;}});
  image.addEventListener('error',function(){if(attempt<2)setTimeout(retry,800*(attempt+1));else if(!retryButton)retryButton=mediaRetryButton(picture,function(){retryButton=null;retry();});});
  image.src=displaySrc;picture.appendChild(image);gallery.appendChild(picture);
 });
 main.insertBefore(gallery,document.getElementById('case-next'));
}

const displayVideos=project.detailDisplayVideos||project.detailVideos;
if(displayVideos&&displayVideos.length){
 const videos=document.createElement('section');videos.className='case-video-gallery';
 videos.setAttribute('aria-label',caseLang==='zh'?'项目动态展示':'Project motion showcase');
 const observer=window.IntersectionObserver?new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){entry.target.src=entry.target.dataset.src;entry.target.preload='metadata';observer.unobserve(entry.target);}});},{rootMargin:'400px'}):null;
 displayVideos.forEach(function(src,i){
  const wrapper=document.createElement('div'),video=document.createElement('video');
  let attempts=0,button=null;
  video.controls=true;video.playsInline=true;video.preload='none';video.dataset.src=src;
  video.width=1920;video.height=1080;video.setAttribute('aria-label',(caseLang==='zh'?'项目视频 ':'Project video ')+(i+1));
  function retry(){attempts++;video.src=mediaRetryURL(src,attempts);video.load();}
  video.addEventListener('error',function(){if(attempts<2)setTimeout(retry,1000*(attempts+1));else if(!button)button=mediaRetryButton(wrapper,function(){button=null;retry();});});
  video.addEventListener('loadedmetadata',function(){if(button){button.remove();button=null;}});
  wrapper.appendChild(video);videos.appendChild(wrapper);
  if(observer)observer.observe(video);else video.src=src;
 });
 document.querySelector('main').insertBefore(videos,document.getElementById('case-next'));
}

if(project.hideAnalysis){const analysis=document.getElementById("case-analysis-link");if(analysis)analysis.closest(".case-meta > div").remove();}
