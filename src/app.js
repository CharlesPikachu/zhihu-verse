const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const rand=(a=0,b=1)=>a+Math.random()*(b-a);
const hashString=(s='')=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
const seeded=(seed)=>()=>((seed=Math.imul(seed^seed>>>15,1|seed),seed^=seed+Math.imul(seed^seed>>>7,61|seed),((seed^seed>>>14)>>>0)/4294967296));
const cleanText=(s='')=>String(s??'').replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
const pick=(o,...keys)=>{for(const k of keys){if(o&&o[k]!=null&&o[k]!=='')return o[k]}return undefined};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const compactNumber=n=>{n=Number(n)||0;return n>9999?(n/10000).toFixed(1)+'w':n>999?(n/1000).toFixed(1)+'k':String(n)};
const escapeHtml=(s='')=>String(s).replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));

function findArray(obj){
  if(Array.isArray(obj))return obj;if(!obj||typeof obj!=='object')return [];
  for(const k of ['Items','items','Data','data','Results','results','Contents','contents','Followees','followees','Collections','collections','Favlists','favlists']){const v=obj[k];if(Array.isArray(v))return v}
  for(const v of Object.values(obj)){if(Array.isArray(v)&&v.length&&typeof v[0]==='object')return v}
  return [];
}
function collectUrls(obj,depth=0,out=[]){
  if(depth>5||obj==null)return out;
  if(typeof obj==='string'){if(/^https?:\/\//i.test(obj))out.push(obj);return out}
  if(Array.isArray(obj)){obj.slice(0,20).forEach(v=>collectUrls(v,depth+1,out));return out}
  if(typeof obj==='object')Object.entries(obj).forEach(([k,v])=>{if(/url|link|href/i.test(k)||typeof v==='object')collectUrls(v,depth+1,out)});
  return out;
}
function deepPick(obj,keys,depth=0){
  if(depth>5||obj==null||typeof obj!=='object')return undefined;
  for(const key of keys)if(obj[key]!=null&&obj[key]!=='')return obj[key];
  for(const value of Object.values(obj)){const hit=deepPick(value,keys,depth+1);if(hit!=null)return hit}
}
function bestSourceUrl(raw,title=''){
  const qid=deepPick(raw,['QuestionId','question_id','questionId']),aid=deepPick(raw,['AnswerId','answer_id','answerId']),article=deepPick(raw,['ArticleId','article_id','articleId']);
  if(qid&&aid)return `https://www.zhihu.com/question/${qid}/answer/${aid}`;
  if(qid)return `https://www.zhihu.com/question/${qid}`;
  if(article)return `https://zhuanlan.zhihu.com/p/${article}`;
  const urls=[...new Set(collectUrls(raw))];
  const score=u=>{
    let s=0;if(/zhihu\.com\/question\/\d+\/answer\/\d+/i.test(u))s+=100;
    else if(/zhihu\.com\/question\/\d+/i.test(u))s+=85;
    else if(/zhuanlan\.zhihu\.com\/p\/\d+/i.test(u))s+=80;
    else if(/zhihu\.com\/p\/\d+/i.test(u))s+=75;
    else if(/zhihu\.com\/people\//i.test(u))s+=55;
    else if(/zhihu\.com/i.test(u))s+=35;
    if(/developer\.zhihu\.com/i.test(u))s-=40;if(/^https?:\/\/www\.zhihu\.com\/?$/i.test(u))s-=90;return s;
  };
  urls.sort((a,b)=>score(b)-score(a));
  if(urls[0]&&score(urls[0])>0)return urls[0];
  return `https://www.zhihu.com/search?type=content&q=${encodeURIComponent(title||'知乎')}`;
}
function normalizeSearch(raw,scope='zhihu'){
  return findArray(raw).map((x,i)=>{
    const nested=x.Target||x.target||x.Content||x.content||x.Object||x.object||{};
    const title=cleanText(pick(x,'Title','title','Name','name')||pick(nested,'Title','title','Name','name')||'(无标题)');
    const summary=cleanText(pick(x,'ContentText','Summary','summary','Excerpt','excerpt','Description','description','Snippet','snippet')||pick(nested,'ContentText','Summary','summary','Excerpt','excerpt','Description','description')||'');
    const authorObj=pick(x,'Author','author')||pick(nested,'Author','author');
    const author=cleanText(pick(x,'AuthorName','author_name')||pick(nested,'AuthorName','author_name')||(typeof authorObj==='object'?pick(authorObj,'Name','name','Headline','headline'):authorObj)||'');
    const explicit=pick(x,'Url','URL','url','Link','link','ContentUrl','content_url')||pick(nested,'Url','URL','url','Link','link','ContentUrl','content_url');
    let url=explicit&&/^https?:\/\//i.test(String(explicit))?String(explicit):bestSourceUrl(x,title);
    if(/^https?:\/\/www\.zhihu\.com\/?$/i.test(url))url=`https://www.zhihu.com/search?type=content&q=${encodeURIComponent(title)}`;
    return {id:String(pick(x,'Id','id','Token','token')??`${Date.now()}-${i}`),title,summary,url,author,
      votes:Number(pick(x,'VoteUpCount','voteup_count','Votes','votes')||pick(nested,'VoteUpCount','voteup_count')||0),
      comments:Number(pick(x,'CommentCount','comment_count','Comments','comments')||pick(nested,'CommentCount','comment_count')||0),
      type:cleanText(pick(x,'ContentType','content_type','Type','type')||pick(nested,'ContentType','content_type','Type','type')||'content'),scope,raw:x};
  });
}
function normalizeHot(raw){return findArray(raw).map((x,i)=>{const title=cleanText(pick(x,'Title','title')||`HOT #${i+1}`);return {id:String(pick(x,'Id','id')??`hot-${i}`),title,summary:cleanText(pick(x,'Summary','summary','ContentText','Content')||''),url:bestSourceUrl(x,title),thumbnail:pick(x,'ThumbnailUrl','thumbnail_url','Image')||'',rank:Number(pick(x,'Rank','rank')||i+1),raw:x}})}
function parseUserTime(raw){
  const value=deepPick(raw,[
    'CreatedAt','createdAt','created_at','created_time','CreatedTime','CreateTime','create_time',
    'UpdatedAt','updatedAt','updated_at','updated_time','UpdatedTime','EditTime','edit_time',
    'CollectedAt','collectedAt','collected_at','CollectTime','collect_time','Ts','ts','Timestamp','timestamp'
  ]);
  if(value==null||value==='')return 0;
  if(typeof value==='number'&&Number.isFinite(value))return value;
  const text=String(value).trim();
  if(/^\d+(?:\.\d+)?$/.test(text)){const n=Number(text);return Number.isFinite(n)?n:0}
  const parsed=Date.parse(text);
  return Number.isNaN(parsed)?0:parsed;
}
function normalizeUser(raw,kind){return findArray(raw).map((x,i)=>{const title=cleanText(pick(x,'Title','title','Name','name','Fullname','fullname','Headline','headline')||`${kind} ${i+1}`);return {id:String(pick(x,'Id','id','UrlToken','url_token')??`${kind}-${i}`),title,summary:cleanText(pick(x,'ContentText','Summary','summary','Excerpt','excerpt','Headline','headline','Description','description')||''),url:bestSourceUrl(x,title),time:parseUserTime(x),kind,type:cleanText(pick(x,'ContentType','content_type','Type','type')||kind),votes:Number(pick(x,'LikeCount','like_count','VoteUpCount','voteup_count')||0),comments:Number(pick(x,'CommentCount','comment_count')||0),favorites:Number(pick(x,'FavoriteCount','favorite_count')||0),followers:Number(pick(x,'FollowerCount','follower_count')||0),avatar:String(pick(x,'AvatarUrl','avatar_url')||''),raw:x}})}
function extractJson(text=''){
  const clean=String(text).replace(/```(?:json)?/gi,'').replace(/```/g,'').trim();
  const starts=[clean.indexOf('{'),clean.indexOf('[')].filter(x=>x>=0).sort((a,b)=>a-b);
  for(const a of starts){for(let b=clean.length;b>a;b--){try{return JSON.parse(clean.slice(a,b))}catch{}}}return null;
}
function extractJsonArray(text=''){const x=extractJson(text);return Array.isArray(x)?x:[]}
function extractPaging(raw){const p=raw?.Paging||raw?.paging||raw?.Page||raw?.page||{},isEnd=pick(p,'IsEnd','is_end'),hasMore=pick(p,'HasMore','has_more');return {next:pick(p,'NextOffset','next_offset','next','Next'),isEnd:isEnd===true,hasMore:isEnd===false||Boolean(hasMore)}}
const STOP=new Set('一个 一种 一些 这个 那个 为什么 怎么 如何 可以 可能 是否 真的 哪些 什么 以及 对于 关于 里面 时候 因为 如果 我们 你们 他们 目前 现在 还是 已经 进行 这种 这样 比较 非常 没有 不是 的 了 和 是 在 有 与 及 或 但 都 就 而 被 把 从 到 为 对 中 上 下'.split(/\s+/));
function keywords(items,limit=18){
  const freq=new Map();
  const add=w=>{w=w.toLowerCase();if(!w||STOP.has(w)||w.length<2||/^\d+$/.test(w))return;freq.set(w,(freq.get(w)||0)+1)};
  for(const it of items){const s=cleanText(`${it.title||''} ${it.summary||''}`);(s.match(/[A-Za-z][A-Za-z0-9+.#-]{1,20}|[\u4e00-\u9fff]{2,8}/g)||[]).forEach(tok=>{if(/[\u4e00-\u9fff]/.test(tok)&&tok.length>4){for(let n=2;n<=Math.min(4,tok.length);n++)for(let i=0;i<=tok.length-n;i++)add(tok.slice(i,i+n))}else add(tok)})}
  return [...freq.entries()].sort((a,b)=>b[1]-a[1]).slice(0,limit).map(([word,count])=>({word,count}));
}
function toDate(ts){
  if(ts==null||ts==='')return null;
  if(ts instanceof Date)return Number.isNaN(ts.getTime())?null:ts;
  let n=Number(ts);
  if(Number.isFinite(n)){
    if(n>0&&n<1e12)n*=1000;
    const d=new Date(n);return Number.isNaN(d.getTime())?null:d;
  }
  const d=new Date(String(ts));return Number.isNaN(d.getTime())?null:d;
}
const API_BASE='https://developer.zhihu.com';
const SESSION_KEY='zhiverse.credentials.v3.6';
const SEARCH_DATABASES=new Set(['all','realtime','static']);
const ZHIDA_MODELS=new Set(['zhida-fast-1p5','zhida-thinking-1p5','zhida-agent']);
function validateSearchQuery(query){query=String(query??'').trim();if(query.length<2||query.length>100)throw new Error(`搜索关键词长度需为 2–100 个字符（当前 ${query.length}）`);return query}
function positiveInt(value,name='参数'){const n=Number(value);if(!Number.isSafeInteger(n)||n<1)throw new Error(`${name} 必须是正整数`);return n}
function boundedInt(value,name,min,max){const n=positiveInt(value,name);if(n<min||n>max)throw new Error(`${name} 必须在 ${min}–${max} 之间`);return n}
function validateOffset(value){if(typeof value==='number'&&Number.isSafeInteger(value)&&value>=0)return value;if(typeof value==='string'&&value.length>0)return value;throw new Error('Offset 必须是非负整数或非空字符串')}
function validateInt64Id(value,name){const text=String(value??'').trim();if(!/^\d+$/.test(text)||text==='0')throw new Error(`${name} 必须是正整数`);try{const n=BigInt(text);if(n<1n||n>((1n<<63n)-1n))throw new Error()}catch{throw new Error(`${name} 必须是 Int64 范围内的正整数`)}return text}
function validateTaskId(taskId,prefix){const id=String(taskId??'').trim(),re=new RegExp(`^${prefix}_[A-Za-z0-9_-]+$`);if(!re.test(id))throw new Error(`${prefix.toUpperCase()} task_id 格式不正确`);return id}
function validatePptResourceUrl(resourceUrl){let u;try{u=new URL(String(resourceUrl??'').trim())}catch{throw new Error('PPT 仅支持有效的 HTTPS 知乎回答或专栏文章链接')}if(u.protocol!=='https:')throw new Error('PPT 链接必须使用 HTTPS');const okAnswer=u.hostname==='www.zhihu.com'&&(/^\/answer\/\d+\/?$/.test(u.pathname)||/^\/question\/\d+\/answer\/\d+\/?$/.test(u.pathname));const okArticle=u.hostname==='zhuanlan.zhihu.com'&&/^\/p\/\d+\/?$/.test(u.pathname);if(!okAnswer&&!okArticle)throw new Error('PPT 仅支持知乎回答或知乎专栏文章链接');return u.href}
class ZhihuAPI{
  constructor(){this.accessSecret='';this.mode='auto';this.proxyUrl='';this.lastTransport='none';this.restoreSession()}
  configure({accessSecret='',mode='auto',proxyUrl='',remember=false}={}){this.accessSecret=accessSecret.trim().replace(/^Bearer\s+/i,'');this.mode=mode;this.proxyUrl=proxyUrl.trim().replace(/\/$/,'');if(remember)sessionStorage.setItem(SESSION_KEY,JSON.stringify({accessSecret:this.accessSecret,mode:this.mode,proxyUrl:this.proxyUrl}));else sessionStorage.removeItem(SESSION_KEY)}
  restoreSession(){try{const d=JSON.parse(sessionStorage.getItem(SESSION_KEY)||'null');if(d)Object.assign(this,d)}catch{}}
  clear(){this.accessSecret='';sessionStorage.removeItem(SESSION_KEY)}
  get connected(){return !!this.accessSecret}
  headers(contentType='application/json'){const h={'Authorization':`Bearer ${this.accessSecret}`,'X-Request-Timestamp':String(Math.floor(Date.now()/1000)),'Accept':'application/json'};if(contentType)h['Content-Type']=contentType;return h}
  async raw(path,{method='GET',params={},body=null,timeout=50000,formData=null,extraHeaders={}}={}){
    if(!this.accessSecret)throw new Error('NO_ACCESS_SECRET');const transports=this.mode==='auto'?(this.proxyUrl?['direct','proxy']:['direct']):[this.mode];let last;
    for(const transport of transports){try{return await this.#send(transport,path,{method,params,body,timeout,formData,extraHeaders})}catch(e){last=e;if(transport==='direct'&&e?.isCors&&transports.includes('proxy'))continue;throw e}}throw last||new Error('REQUEST_FAILED')
  }
  async #send(transport,path,{method,params,body,timeout,formData,extraHeaders}){
    if(transport==='proxy'&&!this.proxyUrl)throw new Error('PROXY_URL_REQUIRED');const q=new URLSearchParams();Object.entries(params||{}).forEach(([k,v])=>{if(v!==undefined&&v!==null&&v!=='')q.set(k,String(v))});let url;
    if(transport==='direct')url=`${API_BASE}${path}${q.size?'?'+q:''}`;else url=`${this.proxyUrl}${path}${q.size?'?'+q:''}`
    const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),timeout);let resp;const headers={...this.headers(formData?null:'application/json'),...extraHeaders};
    try{resp=await fetch(url,{method,headers,body:formData||((body!==null&&body!==undefined)?JSON.stringify(body):undefined),signal:ctl.signal,mode:'cors',cache:'no-store'})}catch(e){clearTimeout(timer);const err=new Error(e.name==='AbortError'?'REQUEST_TIMEOUT':`NETWORK_OR_CORS: ${e.message}`);err.isCors=e.name!=='AbortError';throw err}
    clearTimeout(timer);this.lastTransport=transport;const text=await resp.text();let payload;try{payload=text?JSON.parse(text):{}}catch{payload={raw:text}}if(!resp.ok){const e=new Error(payload?.Message||payload?.message||payload?.error?.message||payload?.error||`HTTP ${resp.status}`);e.status=resp.status;e.payload=payload;throw e}if(payload&&typeof payload==='object'&&'Code'in payload&&Number(payload.Code)!==0){const e=new Error(payload.Message||`ZHIHU_CODE_${payload.Code}`);e.code=Number(payload.Code);e.payload=payload;throw e}return payload&&typeof payload==='object'&&'Data'in payload?payload.Data:payload
  }
  async test(){return normalizeHot(await this.raw('/api/v1/content/hot_list',{params:{Limit:3}}))}
  async hot(limit=30){limit=Number(limit);if(!Number.isInteger(limit)||limit<1||limit>30)limit=30;return normalizeHot(await this.raw('/api/v1/content/hot_list',{params:{Limit:limit}}))}
  async search(query,count=10){query=validateSearchQuery(query);count=Number(count);if(!Number.isInteger(count)||count<=0)count=10;else count=Math.min(10,count);return normalizeSearch(await this.raw('/api/v1/content/zhihu_search',{params:{Query:query,Count:count}}),'zhihu')}
  async webSearch(query,count=20,filter='',searchDB='all'){query=validateSearchQuery(query);if(!SEARCH_DATABASES.has(searchDB))throw new Error('SearchDB 只能是 all、realtime 或 static');const params={Query:query,Count:Math.max(1,Math.min(20,Number(count)||20)),SearchDB:searchDB};if(String(filter||'').trim())params.Filter=String(filter).trim();return normalizeSearch(await this.raw('/api/v1/content/global_search',{params}),'web')}
  async ask(query,model='zhida-fast-1p5'){query=String(query??'').trim();if(!query)throw new Error('直答 query 不能为空');if(!ZHIDA_MODELS.has(model))throw new Error('直答模型只能是 zhida-fast-1p5、zhida-thinking-1p5 或 zhida-agent');const p=await this.raw('/v1/chat/completions',{method:'POST',body:{model,messages:[{role:'user',content:query}],stream:false},timeout:130000});const choices=p?.choices||[];const msg=choices[0]?.message||{};return {content:msg.content||p?.content||'',reasoning:msg.reasoning_content||p?.reasoning_content||'',model:p?.model||model,raw:p}}
  async userContentsPage(limit=50,offset=0){limit=boundedInt(limit,'Limit',1,50);offset=validateOffset(offset);const d=await this.raw('/api/v1/user/contents',{params:{Offset:offset,Limit:limit,ContentType:'all',SortField:'ts',SortOrder:'desc'}});return {items:normalizeUser(d,'creation'),paging:extractPaging(d),raw:d}}
  async userContents(limit=50,offset=0){return (await this.userContentsPage(limit,offset)).items}
  async userContentsMany(max=500){let out=[],offset=0;for(let i=0;i<12&&out.length<max;i++){const p=await this.userContentsPage(Math.min(50,max-out.length),offset);out.push(...p.items);const next=p.paging.next;if(p.paging.isEnd||next===undefined||next===null||next===''||String(next)===String(offset)||(!p.paging.hasMore&&p.items.length<50))break;offset=next}return out.slice(0,max)}
  async userFolloweesPage(limit=50,offset=0){limit=boundedInt(limit,'Limit',1,50);offset=validateOffset(offset);const d=await this.raw('/api/v1/user/followees',{params:{Offset:offset,Limit:limit}});return {items:normalizeUser(d,'followee'),paging:extractPaging(d),raw:d}}
  async userFollowees(limit=50,offset=0){return (await this.userFolloweesPage(limit,offset)).items}
  async userFolloweesMany(max=300){let out=[],offset=0;for(let i=0;i<12&&out.length<max;i++){const p=await this.userFolloweesPage(Math.min(50,max-out.length),offset);out.push(...p.items);const next=p.paging.next;if(p.paging.isEnd||next===undefined||next===null||next===''||String(next)===String(offset)||(!p.paging.hasMore&&p.items.length<50))break;offset=next}return out.slice(0,max)}
  async userCollections(limit=50){return normalizeUser(await this.raw('/api/v1/user/collections',{params:{Limit:positiveInt(limit,'Limit')}}),'collection')}
  async userFavlists(limit=30){return normalizeUser(await this.raw('/api/v1/user/favlists',{params:{Limit:positiveInt(limit,'Limit')}}),'favlist')}
  async favlistContentsPage({favlistUrlToken=null,favlistId=null,limit=50,offset=0}={}){if((favlistUrlToken==null)===(favlistId==null))throw new Error('FavlistUrlToken 与 FavlistId 必须且只能提供一个');offset=validateOffset(offset);const params={Offset:offset,Limit:positiveInt(limit,'Limit')};if(favlistUrlToken!=null)params.FavlistUrlToken=validateInt64Id(favlistUrlToken,'FavlistUrlToken');else params.FavlistId=validateInt64Id(favlistId,'FavlistId');const d=await this.raw('/api/v1/user/favlist_contents',{params});return {items:normalizeUser(d,'favitem'),paging:extractPaging(d),raw:d}}
  async favlistContents(opts={}){return (await this.favlistContentsPage(opts)).items}
  async favlistContentsMany({favlistUrlToken=null,favlistId=null,max=150}={}){let out=[],offset=0;for(let i=0;i<12&&out.length<max;i++){const p=await this.favlistContentsPage({favlistUrlToken,favlistId,limit:Math.min(50,max-out.length),offset});out.push(...p.items);const next=p.paging.next;if(p.paging.isEnd||next===undefined||next===null||next===''||String(next)===String(offset)||(!p.paging.hasMore&&p.items.length<50))break;offset=next}return out.slice(0,max)}
  async uploadPdf(file){if(!(file instanceof File))throw new Error('PDF_FILE_REQUIRED');if(!/\.pdf$/i.test(file.name))throw new Error('ONLY_PDF_SUPPORTED');if(file.size>100*1024*1024)throw new Error('PDF_TOO_LARGE_100MB');const fd=new FormData(),pdf=file.type==='application/pdf'?file:new File([file],file.name,{type:'application/pdf'});fd.append('file',pdf,file.name);return this.raw('/resources/v1/files',{method:'POST',formData:fd,timeout:130000})}
  async pdfCreate(fileId){fileId=String(fileId??'').trim();if(!fileId)throw new Error('file_id 不能为空');return this.raw('/api/v1/pdf-parse/tasks',{method:'POST',body:{file_id:fileId},extraHeaders:{'Idempotency-Key':crypto.randomUUID?.()||String(Date.now())}})}
  async pdfStatus(taskId){const id=validateTaskId(taskId,'pdf');return this.raw(`/api/v1/pdf-parse/tasks/${encodeURIComponent(id)}`)}
  async pptCreate(resourceUrl,numPages=12){const url=validatePptResourceUrl(resourceUrl),pages=positiveInt(numPages,'num_pages');if(pages<6||pages>21)throw new Error('num_pages 必须是 6–21 之间的整数');return this.raw('/api/v1/ppt-generation/tasks',{method:'POST',body:{resource_url:url,num_pages:pages},extraHeaders:{'Idempotency-Key':crypto.randomUUID?.()||String(Date.now())}})}
  async pptStatus(taskId){const id=validateTaskId(taskId,'ppt');return this.raw(`/api/v1/ppt-generation/tasks/${encodeURIComponent(id)}`)}
}
const COLORS={cyan:'#63f4ff',blue:'#2f9cff',violet:'#946dff',orange:'#ff8b3d',red:'#ff466b',green:'#4dffb5',white:'#e8fbff',muted:'#456273'};
const hexRgb=h=>{h=h.replace('#','');return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]};

class UniverseScene{
  constructor(canvas,{onNodeClick,onNodeHover}={}){
    this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.onNodeClick=onNodeClick;this.onNodeHover=onNodeHover;
    this.nodes=[];this.edges=[];this.particles=[];this.shockwaves=[];this.mode='home';this.selected=null;this.hovered=null;this.route=[];this.memoryNodes=[];
    this.camera={yaw:.22,pitch:-.18,distance:980,target:{x:0,y:0,z:0},goal:{x:0,y:0,z:0},goalDistance:980};
    this.pointer={x:0,y:0,down:false,lastX:0,lastY:0,moved:0};this.dpr=1;this.fps=60;this.last=performance.now();this.frameTimes=[];
    this.stars=this.#makeStars(1700);this.nebula=this.#makeNebula(80);this.resize();this.#events();requestAnimationFrame(t=>this.#loop(t));
  }
  #makeStars(n){const r=seeded(14391),arr=[];for(let i=0;i<n;i++){const radius=650+r()*2300,theta=r()*Math.PI*2,phi=Math.acos(2*r()-1);arr.push({x:Math.sin(phi)*Math.cos(theta)*radius,y:Math.cos(phi)*radius,z:Math.sin(phi)*Math.sin(theta)*radius,a:.12+r()*.7,s:.3+r()*1.5,p:r()*Math.PI*2})}return arr}
  #makeNebula(n){const r=seeded(8123),arr=[];for(let i=0;i<n;i++){const a=r()*Math.PI*2,rr=200+r()*900;arr.push({x:Math.cos(a)*rr,y:(r()-.5)*500,z:Math.sin(a)*rr,r:40+r()*180,a:.01+r()*.025,c:i%3})}return arr}
  resize(){this.dpr=Math.min(2,window.devicePixelRatio||1);const w=this.canvas.clientWidth||innerWidth,h=this.canvas.clientHeight||innerHeight;this.canvas.width=Math.floor(w*this.dpr);this.canvas.height=Math.floor(h*this.dpr);this.ctx.setTransform(this.dpr,0,0,this.dpr,0,0);this.w=w;this.h=h}
  #events(){
    addEventListener('resize',()=>this.resize());const c=this.canvas;
    c.addEventListener('pointerdown',e=>{this.pointer.down=true;this.pointer.lastX=e.clientX;this.pointer.lastY=e.clientY;this.pointer.moved=0;c.setPointerCapture(e.pointerId)});
    c.addEventListener('pointermove',e=>{this.pointer.x=e.clientX;this.pointer.y=e.clientY;if(this.pointer.down){const dx=e.clientX-this.pointer.lastX,dy=e.clientY-this.pointer.lastY;this.pointer.moved+=Math.abs(dx)+Math.abs(dy);this.camera.yaw+=dx*.004;this.camera.pitch=clamp(this.camera.pitch+dy*.003,-1.25,1.25);this.pointer.lastX=e.clientX;this.pointer.lastY=e.clientY}else this.#hover(e.clientX,e.clientY)});
    c.addEventListener('pointerup',e=>{if(this.pointer.moved<8){const n=this.#hit(e.clientX,e.clientY);if(n){this.selected=n;this.onNodeClick?.(n)}}this.pointer.down=false});
    c.addEventListener('wheel',e=>{e.preventDefault();this.camera.goalDistance=clamp(this.camera.goalDistance+e.deltaY*.55,380,1900)},{passive:false});
    c.addEventListener('dblclick',e=>{const n=this.#hit(e.clientX,e.clientY);if(n)this.focus(n)});
  }
  #hit(x,y){let best=null,bd=Infinity;for(const n of this.nodes){if(!n._p||n._p.alpha<.1)continue;const d=Math.hypot(x-n._p.x,y-n._p.y),rad=Math.max(10,n._p.r*1.7);if(d<rad&&d<bd){best=n;bd=d}}return best}
  #hover(x,y){const n=this.#hit(x,y);if(n!==this.hovered){this.hovered=n;this.canvas.style.cursor=n?'pointer':'grab';this.onNodeHover?.(n)}}
  project(p){
    let x=p.x-this.camera.target.x,y=p.y-this.camera.target.y,z=p.z-this.camera.target.z;
    const cy=Math.cos(this.camera.yaw),sy=Math.sin(this.camera.yaw);let x1=x*cy-z*sy,z1=x*sy+z*cy;
    const cp=Math.cos(this.camera.pitch),sp=Math.sin(this.camera.pitch);let y1=y*cp-z1*sp,z2=y*sp+z1*cp;
    const zz=z2+this.camera.distance;if(zz<80)return null;const f=Math.min(this.w,this.h)*1.05,sc=f/zz;return{x:this.w/2+x1*sc,y:this.h/2+y1*sc,z:zz,scale:sc,alpha:clamp((zz-100)/500,0,1)};
  }
  focus(n){this.camera.goal={x:n.x,y:n.y,z:n.z};this.camera.goalDistance=clamp(620+(n.r||8)*5,430,850)}
  resetCamera(){this.camera.goal={x:0,y:0,z:0};this.camera.goalDistance=980}
  clear({keepAmbient=false}={}){this.nodes=keepAmbient?this.nodes.filter(n=>n.type==='hot'):[];this.edges=[];this.particles=[];this.shockwaves=[];this.route=[];this.memoryNodes=[];this.selected=null;this.resetCamera()}
  setMode(m){this.mode=m}
  setHome(hot=[]){this.clear();this.mode='home';this.#galaxyFromHot(hot);this.resetCamera()}
  #galaxyFromHot(hot){
    const items=hot.length?hot:Array.from({length:18},(_,i)=>({title:`Signal ${i+1}`,rank:i+1}));
    items.forEach((it,i)=>{const a=i*.82+0.4,rr=170+i*22,z=(i%5-2)*58;const delta=it.delta||0;this.nodes.push({id:`hot-${i}-${hashString(it.title)}`,label:it.title,x:Math.cos(a)*rr,y:Math.sin(a*.7)*rr*.45,z:Math.sin(a)*rr*.65+z,r:9+Math.max(0,18-i)*.42,color:delta>0?COLORS.orange:COLORS.cyan,type:'hot',pulse:.5+i*.13,data:{...it,kind:'hot'}})})
    for(let i=1;i<this.nodes.length;i++){const j=Math.max(0,i-1-Math.floor(i%3===0?2:0));this.edges.push({a:this.nodes[j],b:this.nodes[i],alpha:.035})}
  }
  addSearchCluster(query,items){
    this.mode='explore';this.nodes=this.nodes.filter(n=>n.type==='hot');this.edges=[];
    const h=hashString(query),r=seeded(h),a=r()*Math.PI*2,dist=260+r()*260;const center={x:Math.cos(a)*dist,y:(r()-.5)*280,z:Math.sin(a)*dist};
    const anchor={id:`q-${h}`,label:query,...center,r:18,color:COLORS.white,type:'query',pulse:0,data:{title:query,summary:'当前探测目标',kind:'query'}};this.nodes.push(anchor);
    items.slice(0,16).forEach((it,i)=>{const aa=i/Math.max(1,items.length)*Math.PI*2+r()*.4,rr=85+r()*130;const n={id:`s-${h}-${i}`,label:it.title,x:center.x+Math.cos(aa)*rr,y:center.y+(r()-.5)*120,z:center.z+Math.sin(aa)*rr,r:8+Math.log10(1+(it.votes||0))*2.4,color:i<3?COLORS.cyan:COLORS.violet,type:'search',pulse:i*.4,data:{...it,kind:'search',query}};this.nodes.push(n);this.edges.push({a:anchor,b:n,alpha:.25})});
    this.focus(anchor);this.warpBurst(center,120,COLORS.cyan);return anchor;
  }
  addCollisionPath(path,verified=[]){
    this.clear();this.mode='collider';this.route=[];const n=path.length;path.forEach((label,i)=>{const t=n===1?.5:i/(n-1),x=lerp(-360,360,t),y=Math.sin(t*Math.PI*2)*80,z=Math.cos(t*Math.PI)*110;const ver=verified[i]||{};const node={id:`col-${i}-${hashString(label)}`,label,x,y,z,r:i===0||i===n-1?20:13,color:i===0?COLORS.cyan:i===n-1?COLORS.red:COLORS.violet,type:'collision',pulse:i*.5,data:{title:label,summary:ver.summary||`Knowledge Collider bridge #${i+1}`,url:ver.url||'',kind:'collision',verified:!!ver.title,verification:ver.title||''}};this.nodes.push(node);this.route.push(node);if(i)this.edges.push({a:this.nodes[i-1],b:node,alpha:.7,energy:true})});this.camera.goal={x:0,y:0,z:0};this.camera.goalDistance=920;this.collisionBurst({x:0,y:0,z:0});
  }
  setGraph(root,branches=[]){
    this.clear();this.mode='graph';
    const core={id:`graph-root-${hashString(root)}`,label:root,x:0,y:0,z:0,r:22,color:COLORS.white,type:'query',pulse:0,data:{title:root,summary:'知识图谱根主题',kind:'graph-root'}};this.nodes.push(core);
    branches.forEach((b,bi)=>{const a=bi/Math.max(1,branches.length)*Math.PI*2-.4,rr=210;const bn={id:`branch-${bi}`,label:b.title,x:Math.cos(a)*rr,y:Math.sin(a*1.7)*55,z:Math.sin(a)*rr,r:13,color:bi%2?COLORS.violet:COLORS.cyan,type:'graph-branch',pulse:bi*.4,data:{...b,kind:'graph-branch'}};this.nodes.push(bn);this.edges.push({a:core,b:bn,alpha:.34,energy:true});(b.items||[]).slice(0,7).forEach((it,j)=>{const aa=a+(j-3)*.12,rad=90+j*10;const n={id:`graph-${bi}-${j}`,label:it.title,x:bn.x+Math.cos(aa)*rad,y:bn.y+(j-3)*24,z:bn.z+Math.sin(aa)*rad,r:7+Math.log10(1+(it.votes||0))*1.4,color:it.scope==='web'?COLORS.orange:COLORS.green,type:'graph-node',pulse:j*.2,data:{...it,kind:'graph-node',branch:b.title}};this.nodes.push(n);this.edges.push({a:bn,b:n,alpha:.18})})});
    this.camera.goal={x:0,y:0,z:0};this.camera.goalDistance=1050;this.warpBurst({x:0,y:0,z:0},150,COLORS.green)
  }
  setMemory(items,themes=[]){
    this.clear();this.mode='memory';const core={id:'memory-core',label:'MY MEMORY',x:0,y:0,z:0,r:60,color:COLORS.cyan,type:'planet',pulse:0,data:{title:'MY MEMORY PLANET',summary:'由你的创作、收藏与关注构成。拖动 TIME DEPTH 可以沿时间向过去回溯。',kind:'planet'}};this.nodes.push(core);
    const byKind={creation:COLORS.cyan,collection:COLORS.violet,followee:COLORS.orange,favlist:COLORS.green,favitem:COLORS.green};
    const times=items.map(x=>x.time).filter(Boolean),min=Math.min(...times,0),max=Math.max(...times,1);
    items.forEach((it,i)=>{const seed=seeded(hashString(it.title+it.kind)),orbit=115+(i%7)*38+seed()*18,angle=seed()*Math.PI*2,tilt=(seed()-.5)*1.3,speed=(.00005+seed()*.00012)*(i%2?1:-1);const theme=themes.length?themes[hashString(it.title)%themes.length]:'';const node={id:`mem-${it.kind}-${i}`,label:it.title,x:0,y:0,z:0,r:6+(it.kind==='creation'?3:0),color:byKind[it.kind]||COLORS.white,type:'memory',pulse:i*.13,data:{...it,theme,kind:it.kind},orbit:{radius:orbit,angle,tilt,speed,phase:seed()*3},timeNorm:it.time&&max>min?(it.time-min)/(max-min):1};this.nodes.push(node);this.memoryNodes.push(node);this.edges.push({a:core,b:node,alpha:.035})});
    this.camera.goalDistance=820;this.warpBurst({x:0,y:0,z:0},180,COLORS.violet)
  }
  setMemoryDepth(v){const d=v/100;for(const n of this.memoryNodes)n.hidden=n.timeNorm>d+.001}
  setHotSnapshot(current,previous=[]){
    const pm=new Map(previous.map(x=>[x.title,x.rank]));const cm=new Map(current.map(x=>[x.title,x.rank]));
    const cur=current.map(x=>({...x,delta:pm.has(x.title)?pm.get(x.title)-x.rank:8,isNew:!pm.has(x.title)}));
    this.clear();this.mode='live';cur.forEach((it,i)=>{const ring=Math.floor(i/10),slot=i%10,a=slot/10*Math.PI*2+ring*.3,rr=170+ring*145;const rising=it.delta>1,falling=it.delta<-1;const n={id:`live-${i}-${hashString(it.title)}`,label:it.title,x:Math.cos(a)*rr,y:(ring-1)*120+Math.sin(a*2)*35,z:Math.sin(a)*rr,r:10+(31-it.rank)*.42+Math.max(0,it.delta)*.5,color:rising?COLORS.orange:falling?COLORS.violet:COLORS.cyan,type:'live',pulse:i*.2,data:{...it,kind:'live'}};this.nodes.push(n);if(rising||it.isNew)this.supernova(n,Math.min(44,18+Math.max(0,it.delta)*2))});
    if(previous.length){previous.filter(x=>!cm.has(x.title)).slice(0,6).forEach((it,i)=>{const a=i/6*Math.PI*2;const ghost={id:`dead-${i}`,label:it.title,x:Math.cos(a)*500,y:-210,z:Math.sin(a)*500,r:8,color:'#473248',type:'dead',data:{...it,kind:'dead',status:'COLLAPSED'}};this.nodes.push(ghost);this.collapse(ghost)})}
    this.camera.goalDistance=1050;
  }
  warpBurst(pos,count=100,color=COLORS.cyan){for(let i=0;i<count;i++){const a=rand(0,Math.PI*2),u=rand(-1,1),s=Math.sqrt(1-u*u),spd=rand(1.2,5);this.particles.push({x:pos.x,y:pos.y,z:pos.z,vx:Math.cos(a)*s*spd,vy:u*spd,vz:Math.sin(a)*s*spd,life:rand(45,100),max:100,color,size:rand(.5,2.2)})}this.shockwaves.push({x:pos.x,y:pos.y,z:pos.z,r:10,max:230,life:1,color})}
  collisionBurst(pos){this.warpBurst(pos,260,COLORS.red);this.shockwaves.push({x:pos.x,y:pos.y,z:pos.z,r:10,max:400,life:1,color:COLORS.violet})}
  supernova(node,power=26){for(let i=0;i<power;i++){const a=rand(0,Math.PI*2),spd=rand(.4,2.5);this.particles.push({x:node.x,y:node.y,z:node.z,vx:Math.cos(a)*spd,vy:rand(-1.2,1.2),vz:Math.sin(a)*spd,life:rand(70,160),max:160,color:COLORS.orange,size:rand(.5,2)})}this.shockwaves.push({x:node.x,y:node.y,z:node.z,r:8,max:120,life:1,color:COLORS.orange})}
  collapse(node){for(let i=0;i<22;i++)this.particles.push({x:node.x+rand(-18,18),y:node.y+rand(-18,18),z:node.z+rand(-18,18),vx:rand(-.2,.2),vy:rand(-.2,.2),vz:rand(-.2,.2),life:rand(60,150),max:150,color:'#79516f',size:rand(.3,1.2),inward:true,target:node})}
  #update(dt,t){
    const k=1-Math.pow(.001,dt/1000);this.camera.target.x=lerp(this.camera.target.x,this.camera.goal.x,k*.32);this.camera.target.y=lerp(this.camera.target.y,this.camera.goal.y,k*.32);this.camera.target.z=lerp(this.camera.target.z,this.camera.goal.z,k*.32);this.camera.distance=lerp(this.camera.distance,this.camera.goalDistance,k*.3);
    for(const n of this.memoryNodes){if(!n.orbit)continue;n.orbit.angle+=n.orbit.speed*dt;const a=n.orbit.angle,r=n.orbit.radius,tilt=n.orbit.tilt;n.x=Math.cos(a)*r;n.z=Math.sin(a)*r;n.y=Math.sin(a*.7+n.orbit.phase)*r*.22+Math.sin(tilt)*r*.18}
    for(const p of this.particles){if(p.inward&&p.target){p.vx+=(p.target.x-p.x)*.0004;p.vy+=(p.target.y-p.y)*.0004;p.vz+=(p.target.z-p.z)*.0004}p.x+=p.vx*dt*.06;p.y+=p.vy*dt*.06;p.z+=p.vz*dt*.06;p.life-=dt*.06}this.particles=this.particles.filter(p=>p.life>0);
    for(const s of this.shockwaves){s.r+=dt*.15*(s.max/200);s.life-=dt/900}this.shockwaves=this.shockwaves.filter(s=>s.life>0&&s.r<s.max);
  }
  #drawBackground(t){const c=this.ctx;c.fillStyle='#01030a';c.fillRect(0,0,this.w,this.h);const g=c.createRadialGradient(this.w*.5,this.h*.45,10,this.w*.5,this.h*.45,Math.max(this.w,this.h)*.7);g.addColorStop(0,'#071225');g.addColorStop(.35,'#030915');g.addColorStop(1,'#010207');c.fillStyle=g;c.fillRect(0,0,this.w,this.h);
    c.save();c.globalCompositeOperation='screen';for(const n of this.nebula){const p=this.project(n);if(!p)continue;const rr=n.r*p.scale*.7;if(rr<3)continue;const ng=c.createRadialGradient(p.x,p.y,0,p.x,p.y,rr);const col=n.c===0?'40,170,255':n.c===1?'126,70,255':'30,255,210';ng.addColorStop(0,`rgba(${col},${n.a})`);ng.addColorStop(1,`rgba(${col},0)`);c.fillStyle=ng;c.beginPath();c.arc(p.x,p.y,rr,0,Math.PI*2);c.fill()}c.restore();
    c.save();c.globalCompositeOperation='screen';for(const s of this.stars){const p=this.project(s);if(!p)continue;const a=s.a*(.65+.35*Math.sin(t*.001+s.p));c.globalAlpha=a*p.alpha;c.fillStyle='#d9f8ff';c.fillRect(p.x,p.y,Math.max(.35,s.s*p.scale),Math.max(.35,s.s*p.scale))}c.restore();
  }
  #drawEdges(){const c=this.ctx;c.save();c.globalCompositeOperation='screen';for(const e of this.edges){if(e.a.hidden||e.b.hidden)continue;const a=this.project(e.a),b=this.project(e.b);if(!a||!b)continue;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);if(e.energy){const grad=c.createLinearGradient(a.x,a.y,b.x,b.y);grad.addColorStop(0,'rgba(99,244,255,.12)');grad.addColorStop(.5,'rgba(149,109,255,.65)');grad.addColorStop(1,'rgba(255,70,107,.35)');c.strokeStyle=grad;c.lineWidth=1.2}else{c.strokeStyle=`rgba(91,196,231,${e.alpha||.12})`;c.lineWidth=.65}c.stroke()}c.restore()}
  #drawParticles(){const c=this.ctx;c.save();c.globalCompositeOperation='lighter';for(const p of this.particles){const q=this.project(p);if(!q)continue;const [r,g,b]=hexRgb(p.color);const a=clamp(p.life/p.max,0,1);c.fillStyle=`rgba(${r},${g},${b},${a*.8})`;c.beginPath();c.arc(q.x,q.y,Math.max(.5,p.size*q.scale*1.6),0,Math.PI*2);c.fill()}for(const s of this.shockwaves){const p=this.project(s);if(!p)continue;const [r,g,b]=hexRgb(s.color);c.strokeStyle=`rgba(${r},${g},${b},${Math.max(0,s.life)*.55})`;c.lineWidth=1.2;c.beginPath();c.arc(p.x,p.y,s.r*p.scale,0,Math.PI*2);c.stroke()}c.restore()}
  #drawNodes(t){const c=this.ctx,visible=[];for(const n of this.nodes){if(n.hidden)continue;const p=this.project(n);if(!p)continue;const rr=clamp(n.r*p.scale,1.2,48);n._p={...p,r:rr,alpha:p.alpha};visible.push(n)}visible.sort((a,b)=>b._p.z-a._p.z);
    c.save();c.globalCompositeOperation='lighter';for(const n of visible){const p=n._p,pulse=1+.08*Math.sin(t*.003+(n.pulse||0)),rr=p.r*pulse,[r,g,b]=hexRgb(n.color||COLORS.cyan);if(n.type==='planet'){
        const pg=c.createRadialGradient(p.x-rr*.22,p.y-rr*.26,rr*.08,p.x,p.y,rr*1.5);pg.addColorStop(0,'rgba(230,255,255,.96)');pg.addColorStop(.18,`rgba(${r},${g},${b},.92)`);pg.addColorStop(.48,'rgba(20,74,104,.82)');pg.addColorStop(1,'rgba(0,7,15,0)');c.fillStyle=pg;c.beginPath();c.arc(p.x,p.y,rr*1.5,0,Math.PI*2);c.fill();c.strokeStyle='rgba(99,244,255,.22)';c.lineWidth=1;c.beginPath();c.ellipse(p.x,p.y,rr*2.3,rr*.55,.3,0,Math.PI*2);c.stroke();continue}
      const glow=c.createRadialGradient(p.x,p.y,0,p.x,p.y,rr*3.4);glow.addColorStop(0,`rgba(${r},${g},${b},.95)`);glow.addColorStop(.18,`rgba(${r},${g},${b},.46)`);glow.addColorStop(1,`rgba(${r},${g},${b},0)`);c.fillStyle=glow;c.beginPath();c.arc(p.x,p.y,rr*3.4,0,Math.PI*2);c.fill();c.fillStyle=`rgba(${r},${g},${b},.86)`;c.beginPath();c.arc(p.x,p.y,Math.max(1.2,rr*.46),0,Math.PI*2);c.fill();if(n===this.selected||n===this.hovered){c.strokeStyle='rgba(235,255,255,.8)';c.lineWidth=.8;c.beginPath();c.arc(p.x,p.y,rr*1.25,0,Math.PI*2);c.stroke()}}
    c.restore();
    c.save();c.font='600 9px ui-monospace,SFMono-Regular,Consolas,monospace';let labels=0;visible.sort((a,b)=>a._p.z-b._p.z);for(const n of visible){if(labels>42)break;const p=n._p,important=this.mode!=='home'&&(n.type==='query'||n.type==='collision'||n.type==='planet'||n.type==='live'||n.type==='graph-branch'||n===this.hovered||n===this.selected||p.r>8);if(!important)continue;labels++;const label=n.label.length>28?n.label.slice(0,27)+'…':n.label;c.globalAlpha=clamp(p.alpha*(n.type==='hot'?.72:1),.18,1);c.fillStyle=n===this.hovered||n===this.selected?'#ffffff':'#a9c4cf';c.shadowColor=n.color;c.shadowBlur=n===this.hovered?10:0;c.fillText(label,p.x+p.r+6,p.y+3);if(n.type==='live'){c.fillStyle=n.data?.delta>0?'#ff9c58':'#63808e';c.font='700 7px ui-monospace,monospace';c.fillText(`#${n.data.rank} ${n.data.delta>0?'▲'+n.data.delta:n.data.delta<0?'▼'+Math.abs(n.data.delta):'—'}`,p.x+p.r+6,p.y+14);c.font='600 9px ui-monospace,monospace'}}c.restore()
  }
  #drawReticle(){const c=this.ctx;if(!this.hovered?._p)return;const p=this.hovered._p,r=p.r+10;c.save();c.strokeStyle='rgba(99,244,255,.5)';c.lineWidth=.7;for(let i=0;i<4;i++){const a=i*Math.PI/2+.2;c.beginPath();c.arc(p.x,p.y,r,a,a+.55);c.stroke()}c.restore()}
  #loop(t){const dt=Math.min(50,t-this.last);this.last=t;this.#update(dt,t);this.#drawBackground(t);this.#drawEdges();this.#drawParticles();this.#drawNodes(t);this.#drawReticle();this.frameTimes.push(dt);if(this.frameTimes.length>45)this.frameTimes.shift();this.fps=Math.round(1000/(this.frameTimes.reduce((a,b)=>a+b,0)/this.frameTimes.length));requestAnimationFrame(tt=>this.#loop(tt))}
}
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const api=new ZhihuAPI();
try{sessionStorage.removeItem('zhiverse.credentials.v3')}catch{}
const config=window.ZHIHU_VERSE_CONFIG||{};
if(!api.proxyUrl&&config.proxyUrl)api.proxyUrl=config.proxyUrl;
if(api.mode==='auto'&&config.defaultTransport)api.mode=config.defaultTransport;

const qlink=t=>`https://www.zhihu.com/search?type=content&q=${encodeURIComponent(t)}`;
const DEMO_HOT=['AI Agent 的下一步是什么？','为什么高维空间里的距离会失效？','一个普通人怎样理解具身智能？','黑洞里真的可能有另一个宇宙吗？','城市为什么会自然形成中心？','如果恐龙没有灭绝会怎样？','为什么收藏夹总是越积越多？','Transformer 为什么出现低秩现象？','一个热点能在互联网活多久？','人为什么会做梦？','量子纠缠怎么理解？','游戏里的经济系统为什么会崩？','如果秦始皇看到现代芯片会怎样？','AI 生成内容会怎样改变搜索？','为什么人会把无关事物联想到一起？'].map((title,i)=>({title,summary:['技术演化与可靠性','维数灾难与距离集中','环境、行动与反馈闭环','事件视界与宇宙学','交通、经济与空间结构'][i%5],url:qlink(title),rank:i+1}));
const demoSearch=(query,scope='zhihu')=>Array.from({length:scope==='web'?12:10},(_,i)=>{const title=[`${query}有哪些关键问题？`,`怎样从直觉上理解${query}？`,`${query}最容易被误解的地方是什么？`,`${query}和现实应用之间有什么距离？`,`${query}有哪些值得看的研究或讨论？`,`${query}背后的数学/技术原理是什么？`,`${query}未来几年会往哪里发展？`,`${query}有哪些反常识结论？`,`${query}为什么最近又被讨论？`,`${query}有哪些真实案例？`,`${query}在全网有哪些不同观点？`,`${query}有哪些争议？`][i];return {id:`demo-${scope}-${i}`,title,summary:`演示节点 ${i+1}：这里会展示真实接口返回的摘要、作者、互动信息和来源链接。`,url:qlink(title),author:['算法观察员','知乎用户','研究者','工程师'][i%4],votes:48+i*37,comments:6+i*3,type:i%3===0?'article':'answer',scope,raw:{}}});
const nowSec=()=>Math.floor(Date.now()/1000);
const DEMO_MEMORY=[
  ['creation','Transformer 中的低秩问题','注意力、谱分析与表示空间',Date.UTC(2026,6,28)/1000],['creation','高维空间距离为什么失效','距离集中与维数灾难',Date.UTC(2026,6,22)/1000],['creation','最短路径一定是直线吗','测地线和曲面几何',Date.UTC(2026,5,18)/1000],['creation','Agent 工具调用如何评测','可靠性与 benchmark',Date.UTC(2026,4,12)/1000],['creation','FEMA P695 的 CMR','结构工程与易损性',Date.UTC(2026,2,19)/1000],
  ['favitem','RAG 评测方法综述','检索、faithfulness 与 recall',Date.UTC(2026,6,30)/1000],['favitem','多模态大模型视觉幻觉','VLM hallucination',Date.UTC(2026,5,9)/1000],['favitem','UMAP 和 t-SNE 怎么选','降维与可视化',Date.UTC(2026,3,11)/1000],['favitem','知识图谱与个人知识库','RAG、图谱与检索',Date.UTC(2026,1,23)/1000],['favitem','如何做一个好的数据可视化','交互设计和图表',Date.UTC(2025,11,20)/1000],['favitem','游戏机制为什么会上瘾','奖励、反馈与设计',Date.UTC(2025,9,15)/1000],['favitem','城市空间结构入门','中心性与交通网络',Date.UTC(2025,7,6)/1000],
  ['collection','AI / ML 收藏夹','模型、论文和工程实践',Date.UTC(2026,6,1)/1000],['collection','数学与统计','概率、几何与统计推断',Date.UTC(2026,3,1)/1000],['favlist','以后一定会看的','经典收藏夹症候群',Date.UTC(2025,8,1)/1000],
  ['followee','机器学习研究者','表示学习与大模型',Date.UTC(2026,1,1)/1000],['followee','统计学答主','统计推断与 GLM',Date.UTC(2025,6,1)/1000],['followee','结构工程师','抗震与倒塌分析',Date.UTC(2025,4,1)/1000]
].map((x,i)=>({id:`m-${i}`,kind:x[0],title:x[1],summary:x[2],time:x[3],url:qlink(x[1]),raw:{}}));
const DEMO_QUIZ={questions:[
  {question:'Transformer 的 self-attention 中，缩放点积为什么要除以 √d_k？',options:['让 softmax 输入在维度增大时不过度变大','减少参数量','保证矩阵满秩','让位置编码可学习'],answer:0,explanation:'点积方差会随维度增大，缩放可以避免 softmax 进入过度饱和区。'},
  {question:'高维欧氏空间里常说的“距离集中”更接近下面哪种现象？',options:['所有点距离都趋近 0','最近邻和最远邻的相对差距变小','距离一定服从正态分布','维度越高点越稀疏所以距离失去定义'],answer:1,explanation:'距离并没有失去定义，而是不同样本之间的距离相对差异可能越来越不明显。'},
  {question:'RAG 系统里，提高检索 recall 最直接影响的是哪一步？',options:['候选证据能否被找回来','生成模型参数量','网页渲染速度','tokenizer 词表'],answer:0,explanation:'Recall 关注相关证据是否进入候选集合，是检索阶段的核心覆盖指标。'},
  {question:'知识图谱里的“边”通常表达什么？',options:['节点颜色','实体或概念之间的关系','页面访问次数','模型温度'],answer:1,explanation:'节点表示实体/概念，边则编码它们之间的关系。'},
  {question:'如果一个热点从第 20 名升到第 3 名，本项目里的 rank velocity 应该表现为？',options:['明显为正','明显为负','恒等于 0','无法计算'],answer:0,explanation:'排名数字变小意味着位置上升，因此 previousRank - currentRank 为正。'}
]};

const state={entered:false,demo:true,mode:'explore',scope:'zhihu',hot:[],search:[],query:'',memory:[],memoryThemes:[],graph:null,quiz:null,quizIndex:0,quizScore:0,quizStreak:0,selected:null,autoTimer:null,pdfTask:'',pptTask:'',runner:null};
const HISTORY_KEY='zhiverse.hotHistory.v3';

const scene=new UniverseScene($('#universe'),{onNodeClick:n=>showDrawer(n),onNodeHover:n=>showNodeTooltip(n)});
scene.setHome(DEMO_HOT);

function flash(){const f=$('#flash');f.style.transition='none';f.style.opacity='.34';requestAnimationFrame(()=>{f.style.transition='opacity .42s ease';f.style.opacity='0'})}
let toastTimer;function toast(msg,error=false){const t=$('#missionToast');t.textContent=msg;t.className='mission-toast show'+(error?' error':'');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.className='mission-toast',2600)}
function updateTelemetry(){ $('#nodeCount').textContent=String(scene.nodes.length).padStart(4,'0');$('#edgeCount').textContent=String(scene.edges.length).padStart(4,'0');$('#hotCount').textContent=String((state.hot.length||DEMO_HOT.length)).padStart(2,'0');$('#transportLabel').textContent=state.demo?'DEMO DATA':`${api.lastTransport.toUpperCase()} / LIVE API` }
function enterUniverse(){if(state.entered)return;state.entered=true;document.body.classList.remove('landing');$('#heroPanel').classList.add('hide');setMode('explore');toast('UNIVERSE ONLINE // 左侧选择实验，右上角 ? 查看说明')}
function hideAll(){['explorePanel','colliderPanel','graphPanel','memoryPanel','livePanel','arenaWorkspace','runnerWorkspace','recapWorkspace','labWorkspace'].forEach(id=>$('#'+id)?.classList.add('hidden'));$('#detailDrawer').classList.remove('open')}
function setMode(mode){state.mode=mode;hideAll();$$('.mode').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));const map={explore:'explorePanel',collider:'colliderPanel',graph:'graphPanel',arena:'arenaWorkspace',runner:'runnerWorkspace',memory:'memoryPanel',recap:'recapWorkspace',live:'livePanel',lab:'labWorkspace'};$('#'+map[mode])?.classList.remove('hidden');scene.setMode(mode);if(mode==='explore'&&!state.query)scene.setHome(state.hot.length?state.hot:DEMO_HOT);if(mode==='memory'&&state.memory.length)scene.setMemory(state.memory,state.memoryThemes);if(mode==='live')renderHotScene();if(mode==='recap')prepareRecap();if(mode==='runner')runnerResize();updateTelemetry()}

const HELP={
 explore:['双域探索','先选择“知乎 / 全网 / 混合”，再发射搜索。结果不是列表，而是空间节点。','点击节点查看更完整的摘要、作者、赞同/评论和来源。','点 EXPAND 会把当前节点标题当作下一次搜索目标，继续向外探索。'],
 collider:['知识对撞机','输入两个相距很远的概念。','真实模式先用“直答”提出一条语义桥梁，再逐个调用知乎搜索检查这些中间节点是否真的能检索到相关内容。','路径中的节点都可以打开详情和知乎来源。'],
 graph:['知识图谱','输入一个宽主题。','系统先找 4–5 个关键分支，再为每个分支同时取知乎搜索和全网搜索结果。','绿色节点偏知乎，橙色节点偏全网；点击节点可以继续查看原始来源。'],
 arena:['Zhida Arena','可以按自选主题出题，也可以直接根据自己的收藏内容出题。','真实模式由知乎直答生成 5 道四选一题；收藏模式会先读取本人收藏，再把其中的标题和摘要作为题目素材。','每题作答后立即显示解释并记录得分和连胜。'],
 runner:['Question Runner','地面问题卡用空格 / ↑ / 点击躲避；空中问题卡用 ↓ 或 S 下蹲躲避。','空格 / ↑ 支持二段跳，第二次起跳可在空中补高度；角色和问题卡的真实碰撞盒都比视觉外框略小。','前几十分只出现地面题，之后才混入空中题；刷新题库会重新读取热榜，并混入最近一次搜索结果。'],
 memory:['记忆星球','使用 Access Secret 读取当前调用方本人的公开创作、关注、近期收藏、收藏夹和部分收藏夹内容。','不同类型数据在星球上使用不同颜色，TIME DEPTH 可以沿时间裁剪内容。','AI THEME SCAN 会让直答把当前标题压缩成几个主题标签。'],
 recap:['年度 / 月度回顾','使用 Access Secret 读取本人公开创作与收藏数据，再按年或按月整理。','页面会计算活跃时间线、关键词和内容高光；ZHIDA COMMENT 可生成简短回顾。','EXPORT LONG POSTER 会把当前回顾一键导出成可分享的长图 PNG。'],
 live:['热榜超新星','SCAN NOW 保存一个热榜快照。多扫几次后，排名变化才有意义。','排名快速上升的节点会变成橙色并触发超新星；掉出榜单的旧节点会坍缩。','REPLAY 可以回放本浏览器保存过的快照。'],
 lab:['Tools Lab','PDF：上传不超过 100MB 的 PDF，随后创建解析任务；状态需要手动查询。','PPT：输入知乎回答或文章链接，创建 6–21 页的 PPT 生成任务；状态同样手动查询。','这些是异步任务，官方文档没有给固定轮询间隔，因此页面不会高频自动轮询。']
};
function showHelp(key){const h=HELP[key]||HELP.explore;$('#helpTitle').textContent=h[0];$('#helpBody').innerHTML=h.slice(1).map((x,i)=>`<div class="help-step"><b>0${i+1}</b><div><strong>${i===0?'操作':i===1?'发生什么':'注意'}</strong>${escapeHtml(x)}</div></div>`).join('');$('#helpDialog').showModal()}
$('#helpButton').addEventListener('click',()=>showHelp(state.mode));$$('[data-help]').forEach(b=>b.addEventListener('click',()=>showHelp(b.dataset.help)));
$$('.mode').forEach(b=>b.addEventListener('click',()=>{if(!state.entered)enterUniverse();setMode(b.dataset.mode)}));$$('[data-action="demo"]').forEach(b=>b.addEventListener('click',()=>{state.demo=true;enterUniverse()}));$$('[data-action="connect"]').forEach(b=>b.addEventListener('click',()=>$('#authDialog').showModal()));$('[data-action="home"]').addEventListener('click',()=>{document.body.classList.add('landing');state.entered=false;hideAll();$('#heroPanel').classList.remove('hide');scene.setHome(state.hot.length?state.hot:DEMO_HOT)});

// Auth
$('#authButton').addEventListener('click',()=>$('#authDialog').showModal());
function syncAuthForm(){$('#accessSecret').value=api.accessSecret||'';$('#transportMode').value=api.mode||'auto';$('#proxyUrl').value=api.proxyUrl||config.proxyUrl||''}syncAuthForm();
$('#connectButton').addEventListener('click',async()=>{const d=$('#authDiagnostics');api.configure({accessSecret:$('#accessSecret').value,mode:$('#transportMode').value,proxyUrl:$('#proxyUrl').value,remember:$('#rememberSession').checked});d.className='auth-diagnostics';d.textContent='正在测试热榜接口…';try{const x=await api.test();state.demo=false;state.hot=x;d.className='auth-diagnostics ok';d.textContent=`连接成功 // ${x.length} 条测试数据 // ${api.lastTransport.toUpperCase()}`;$('#authLabel').textContent='LIVE CONNECTED';$('#authButton').classList.add('connected');$('#authDot').style.background='var(--green)';setTimeout(()=>{$('#authDialog').close();enterUniverse();refreshHot(false)},600)}catch(e){d.className='auth-diagnostics fail';d.textContent=`连接失败 // ${e.message}`}});

// Search
$$('#searchScope button').forEach(b=>b.addEventListener('click',()=>{$$('#searchScope button').forEach(x=>x.classList.remove('active'));b.classList.add('active');state.scope=b.dataset.scope}));
async function doSearch(query,scope=state.scope){query=query.trim();if(!query)return;state.query=query;toast(`PROBE LAUNCHED // ${scope.toUpperCase()}`);let items;if(state.demo){items=scope==='both'?[...demoSearch(query,'zhihu').slice(0,7),...demoSearch(query,'web').slice(0,7)]:demoSearch(query,scope)}else{try{if(scope==='zhihu')items=await api.search(query,10);else if(scope==='web')items=await api.webSearch(query,16);else{const [z,w]=await Promise.all([api.search(query,10),api.webSearch(query,12)]);items=[...z,...w]}}catch(e){toast(e.message,true);return}}state.search=items;scene.addSearchCluster(query,items);updateTelemetry();flash()}
$('#probeForm').addEventListener('submit',e=>{e.preventDefault();doSearch($('#probeInput').value)});

function safeNodeUrl(d){const u=d?.url;if(u&&/^https?:\/\//i.test(u)&&!/^https?:\/\/www\.zhihu\.com\/?$/i.test(u))return u;return qlink(d?.title||state.query||'知乎')}
function showNodeTooltip(n){const el=$('#nodeTooltip');if(!n?.data||!n._p){el.classList.remove('show');return}const d=n.data;$('#tooltipKind').textContent=String(d.scope||d.kind||n.type||'NODE').toUpperCase();$('#tooltipTitle').textContent=d.title||n.label;$('#tooltipSummary').textContent=[d.author?`作者：${d.author}`:'',d.summary||'点击查看详细信息'].filter(Boolean).join(' · ');const w=330,h=110;el.style.left=`${clamp(n._p.x+18,12,innerWidth-w-12)}px`;el.style.top=`${clamp(n._p.y+18,64,innerHeight-h-24)}px`;el.classList.add('show')}
function showDrawer(n){state.selected=n;const d=n.data||{};$('#drawerKicker').textContent=`${String(d.kind||n.type||'node').toUpperCase()} // ${d.scope?d.scope.toUpperCase():'ZHIHU'}`;$('#drawerTitle').textContent=d.title||n.label;$('#drawerSummary').textContent=d.summary||'接口没有返回摘要。可以直接打开知乎来源，或使用 ZHIDA EXPLAIN 获取一段解释。';$('#drawerAuthor').textContent=d.author?`作者 / ${d.author}`:'';const badges=[d.scope,d.type,d.kind,d.verified?'SEARCH VERIFIED':''].filter(Boolean);$('#drawerBadges').innerHTML=badges.map(x=>`<span>${escapeHtml(String(x).toUpperCase())}</span>`).join('');const metrics=[];if(d.votes!=null)metrics.push(['赞同',compactNumber(d.votes)]);if(d.comments!=null)metrics.push(['评论',compactNumber(d.comments)]);if(d.rank)metrics.push(['热榜排名','#'+d.rank]);if(d.delta!=null)metrics.push(['排名变化',d.delta>0?'▲ '+d.delta:d.delta<0?'▼ '+Math.abs(d.delta):'—']);if(d.branch)metrics.push(['图谱分支',d.branch]);if(d.theme)metrics.push(['主题',d.theme]);$('#drawerMetrics').innerHTML=metrics.slice(0,6).map(([a,b])=>`<div class="metric"><small>${escapeHtml(a)}</small><b>${escapeHtml(String(b))}</b></div>`).join('');
  const rel=(state.search||[]).filter(x=>x.title&&x.title!==d.title).slice(0,4);$('#drawerRelated').innerHTML=rel.length?'<div class="drawer-kicker">RELATED NODES</div>'+rel.map(x=>`<button class="related-item" data-rel="${escapeHtml(x.title)}">${escapeHtml(x.title)}</button>`).join(''):'';$$('.related-item').forEach(b=>b.addEventListener('click',()=>doSearch(b.dataset.rel)));const a=$('#openNode');a.href=safeNodeUrl(d);a.style.display='inline-flex';$('#expandNode').style.display=d.title?'inline-flex':'none';$('#explainNode').style.display=d.title?'inline-flex':'none';$('#detailDrawer').classList.add('open');scene.focus(n)}
$('#drawerClose').addEventListener('click',()=>$('#detailDrawer').classList.remove('open'));
$('#expandNode').addEventListener('click',()=>{const d=state.selected?.data;if(d?.title){setMode('explore');$('#probeInput').value=d.title;doSearch(d.title,'zhihu')}});
$('#explainNode').addEventListener('click',async()=>{const d=state.selected?.data;if(!d?.title)return;const p=$('#drawerSummary'),old=p.textContent;p.textContent='直答正在生成简短解释…';if(state.demo){await sleep(450);p.textContent=`${d.title}：这是演示解释。真实连接后会调用知乎直答，用三句话说明这个节点是什么、为什么和当前主题有关，以及可以继续追问什么。`;return}try{const a=await api.ask(`请用不超过三句话解释“${d.title}”。第一句说明它是什么，第二句说明它为什么值得关注，第三句给出一个适合继续追问的问题。不要使用列表。`);p.textContent=a.content||old}catch(e){p.textContent=old;toast(e.message,true)}});

// Collider
function demoCollisionPath(l,r){const mids=(/秦始皇/.test(l+r)&&/nvidia|英伟达/i.test(l+r))?['古代技术','工业革命','计算机','GPU']:[`${l}的应用`,`技术与社会`,`计算与信息`,`${r}相关技术`];return [l,...mids,r]}
async function runCollider(left,right){left=left.trim();right=right.trim();if(!left||!right)return;$('#collisionStatus').className='collision-status active';$('#collisionStatus').textContent='COLLIDING // 正在寻找并验证桥梁…';let path,verified=[];try{if(state.demo){path=demoCollisionPath(left,right);verified=path.map(x=>({title:x,summary:`演示验证节点：${x}`,url:qlink(x),scope:'zhihu'}))}else{const a=await api.ask(`给定两个概念“${left}”和“${right}”，找一条自然、可解释的知识连接路径。只输出 JSON，格式必须是 {"path":["${left}","中间概念1","中间概念2","${right}"]}。总节点 4 到 7 个，首尾必须完全等于给定概念，中间节点应该适合在知乎单独搜索。不要输出 JSON 之外的文字。`,'zhida-thinking-1p5');const obj=extractJson(a.content);path=Array.isArray(obj?.path)?obj.path.map(String):demoCollisionPath(left,right);path[0]=left;path[path.length-1]=right;for(const x of path){try{const rs=await api.search(x,1);verified.push(rs[0]||{title:x,summary:'未找到可展示结果',url:qlink(x)})}catch{verified.push({title:x,summary:'验证请求失败',url:qlink(x)})}}}scene.addCollisionPath(path,verified);$('#collisionStatus').textContent=`CONNECTION FOUND // ${Math.max(0,path.length-1)} HOPS // ${verified.filter(x=>x?.title).length}/${path.length} SEARCH-VERIFIED`;flash();updateTelemetry()}catch(e){$('#collisionStatus').className='collision-status';$('#collisionStatus').textContent='FAILED // '+e.message;toast(e.message,true)}}
$('#colliderForm').addEventListener('submit',e=>{e.preventDefault();runCollider($('#leftCore').value,$('#rightCore').value)});

// Graph
async function buildGraph(root,depth){root=root.trim();if(!root)return;$('#graphStatus').textContent='正在提取分支并构建图谱…';let branches=[];try{if(state.demo){const names=['核心概念','方法与原理','真实应用','风险与争议','未来方向'];branches=names.slice(0,depth===1?4:5).map((x,i)=>({title:`${root} · ${x}`,items:[...demoSearch(`${root} ${x}`,'zhihu').slice(0,4),...demoSearch(`${root} ${x}`,'web').slice(0,3)]}))}else{let names=[];try{const a=await api.ask(`围绕主题“${root}”，给出 5 个彼此区分明显、适合进一步搜索的中文子主题。只输出 JSON 数组，例如 ["子主题1","子主题2"]，不要解释。`);names=extractJsonArray(a.content).slice(0,5)}catch{}if(!names.length){const seed=await api.search(root,10);names=keywords(seed,5).map(x=>x.word)}if(depth===1){const rs=await api.search(root,10);branches=names.slice(0,5).map((name,i)=>({title:name,items:rs.slice(i*2,i*2+2)}))}else{for(const name of names.slice(0,5)){const [z,w]=await Promise.allSettled([api.search(`${root} ${name}`,6),api.webSearch(`${root} ${name}`,6)]);branches.push({title:name,items:[...(z.status==='fulfilled'?z.value.slice(0,4):[]),...(w.status==='fulfilled'?w.value.slice(0,3):[])]})}}}state.graph={root,branches};scene.setGraph(root,branches);$('#graphStatus').textContent=`GRAPH READY // ${1+branches.length+branches.reduce((s,b)=>s+b.items.length,0)} NODES // ${branches.length} BRANCHES`;updateTelemetry();flash()}catch(e){$('#graphStatus').textContent='FAILED // '+e.message;toast(e.message,true)}}
$('#graphForm').addEventListener('submit',e=>{e.preventDefault();buildGraph($('#graphInput').value,Number($('#graphDepth').value))});

// Zhida Arena
async function makeQuiz(topic,difficulty,source='topic'){
  if(state.demo){
    if(source==='collections')return {questions:DEMO_QUIZ.questions.map((q,i)=>({...q,question:`收藏题 ${i+1} · ${q.question}`}))};
    return DEMO_QUIZ;
  }
  let context='';
  if(source==='collections'){
    await loadMemory({silent:true});
    const saved=state.memory.filter(x=>['favitem','collection'].includes(x.kind)&&x.title).slice(0,36);
    if(saved.length<3)throw new Error('当前收藏数据太少，暂时无法生成一局题目');
    const sample=saved.slice(0,24).map((x,i)=>`${i+1}. ${x.title}${x.summary?`｜${x.summary.slice(0,120)}`:''}`).join('\n');
    context=`请只围绕下面这些用户本人收藏过的内容出题。题目可以考概念理解或标题所涉及的知识，但不要编造用户身份信息。\n${sample}`;
  }else{
    context=`请围绕“${topic}”出题。`;
  }
  const p=`${context}\n生成 5 道${difficulty}难度的中文四选一知识题。只输出严格 JSON：{"questions":[{"question":"题目","options":["A","B","C","D"],"answer":0,"explanation":"一句解释"}]}。answer 必须是 0-3 的整数；每题只能有一个最佳答案；避免主观题和时效性数字；不要输出 Markdown。`;
  const a=await api.ask(p,difficulty==='硬核'?'zhida-thinking-1p5':'zhida-fast-1p5');const obj=extractJson(a.content);if(!Array.isArray(obj?.questions)||obj.questions.length<3)throw new Error('直答没有返回可解析的题目 JSON');return {questions:obj.questions.slice(0,5).map(q=>({question:String(q.question||''),options:(q.options||[]).slice(0,4).map(String),answer:Number(q.answer),explanation:String(q.explanation||'')})).filter(q=>q.question&&q.options.length===4&&q.answer>=0&&q.answer<4)}
}
function renderQuiz(){const qs=state.quiz?.questions||[];if(state.quizIndex>=qs.length){$('#arenaQuestion').textContent=`ROUND COMPLETE · ${state.quizScore}/${qs.length}`;$('#arenaOptions').innerHTML='';$('#arenaExplain').textContent=state.quizScore===qs.length?'全对。可以换一个更离谱的主题再来一局。':`连续答对最高记录会保留在这一局里。最终得分 ${state.quizScore}。`;$('#arenaNext').classList.add('hidden');return}const q=qs[state.quizIndex];$('#arenaIndex').textContent=`${state.quizIndex+1}/${qs.length}`;$('#arenaScore').textContent=state.quizScore;$('#arenaStreak').textContent=state.quizStreak;$('#arenaQuestion').textContent=q.question;$('#arenaExplain').textContent='';$('#arenaNext').classList.add('hidden');$('#arenaOptions').innerHTML=q.options.map((x,i)=>`<button class="arena-option" data-answer="${i}"><b>${String.fromCharCode(65+i)}.</b> ${escapeHtml(x)}</button>`).join('');$$('.arena-option').forEach(b=>b.addEventListener('click',()=>answerQuiz(Number(b.dataset.answer))))}
function answerQuiz(i){const q=state.quiz.questions[state.quizIndex],ok=i===q.answer;if(ok){state.quizScore++;state.quizStreak++;flash()}else state.quizStreak=0;$$('.arena-option').forEach((b,j)=>{b.disabled=true;if(j===q.answer)b.classList.add('correct');else if(j===i)b.classList.add('wrong')});$('#arenaScore').textContent=state.quizScore;$('#arenaStreak').textContent=state.quizStreak;$('#arenaExplain').textContent=(ok?'答对了。':'这题没过。')+' '+q.explanation;$('#arenaNext').classList.remove('hidden')}
$('#arenaSource').addEventListener('change',e=>{const personal=e.target.value==='collections';$('#arenaTopic').disabled=personal;$('#arenaTopic').placeholder=personal?'将从你的收藏中自动取材':'输入主题';});
$('#startArena').addEventListener('click',async()=>{const b=$('#startArena');b.disabled=true;b.textContent='GENERATING…';try{state.quiz=await makeQuiz($('#arenaTopic').value.trim()||'人工智能',$('#arenaDifficulty').value,$('#arenaSource').value);state.quizIndex=0;state.quizScore=0;state.quizStreak=0;$('#arenaSetup').classList.add('hidden');$('#arenaBoard').classList.remove('hidden');renderQuiz()}catch(e){toast(e.message,true)}finally{b.disabled=false;b.textContent='START ROUND'}});
$('#arenaNext').addEventListener('click',()=>{state.quizIndex++;renderQuiz()});

// Runner
function readLocal(key,fallback=''){try{return localStorage.getItem(key)??fallback}catch{return fallback}}
function writeLocal(key,value){try{localStorage.setItem(key,value);return true}catch{return false}}
function runnerPool(){const p=[...(state.hot.length?state.hot:DEMO_HOT),...state.search];const seen=new Set();return p.filter(x=>x?.title&&!seen.has(x.title)&&seen.add(x.title)).map(x=>x.title)}
const RUNNER_PHYSICS={groundOffset:48,gravity:1600,jumpVelocity:-650,doubleJumpVelocity:-585,startSpeed:220,maxSpeed:380,playerInsetX:5,playerInsetY:4,obstacleInsetX:16,inputBuffer:.14,maxJumps:2,ceiling:18,duckHeight:19};
function runnerResize(){const c=$('#runnerCanvas');if(!c)return;const r=c.getBoundingClientRect(),d=Math.min(2,devicePixelRatio||1);c.width=Math.max(700,Math.floor(r.width*d));c.height=Math.max(260,Math.floor(r.height*d));c.getContext('2d').setTransform(d,0,0,d,0,0);if(state.runner){state.runner.w=r.width;state.runner.h=r.height;const ground=state.runner.h-RUNNER_PHYSICS.groundOffset;if(!state.runner.running||state.runner.player.y>ground-state.runner.player.h)state.runner.player.y=ground-state.runner.player.h}}
addEventListener('resize',runnerResize);
function initRunner(){const c=$('#runnerCanvas'),r=c.getBoundingClientRect();const storedBest=Math.floor(Number(readLocal('zhiverse.runner.best','0'))||0);state.runner={running:false,w:r.width||1000,h:r.height||360,player:{x:75,y:0,vy:0,w:30,h:34,ducking:false,jumpsUsed:0},obstacles:[],score:0,best:storedBest,speed:RUNNER_PHYSICS.startSpeed,last:performance.now(),spawn:0,jumpBuffer:0,pool:runnerPool(),poolIndex:0};writeLocal('zhiverse.runner.best',String(storedBest));$('#runnerBest').textContent=String(storedBest).padStart(4,'0');runnerResize();runnerLoop(performance.now())}
function runnerOnGround(g){const ground=g.h-RUNNER_PHYSICS.groundOffset;return g.player.y>=ground-g.player.h-1}
function runnerJump(){const g=state.runner;if(!g?.running)return;g.player.ducking=false;if(runnerOnGround(g)){g.player.vy=RUNNER_PHYSICS.jumpVelocity;g.player.jumpsUsed=1;g.jumpBuffer=0;return}if(g.player.jumpsUsed<RUNNER_PHYSICS.maxJumps){g.player.vy=RUNNER_PHYSICS.doubleJumpVelocity;g.player.jumpsUsed++;g.jumpBuffer=0;return}g.jumpBuffer=RUNNER_PHYSICS.inputBuffer}
function runnerDuck(on=true){const g=state.runner;if(!g?.running)return;g.player.ducking=!!on}
function spawnObstacle(g){const title=g.pool[g.poolIndex++%Math.max(1,g.pool.length)]||'知乎问题';const allowAir=g.score>=100;const airChance=g.score>300?.35:.25;const kind=allowAir&&Math.random()<airChance?'air':'ground';const visualWidth=Math.min(112,Math.max(82,76+Math.min(12,[...title].length)*2.6));if(kind==='air'){const h=48,ground=g.h-RUNNER_PHYSICS.groundOffset;g.obstacles.push({kind,x:g.w+24,y:ground-67,w:visualWidth,h,title,passed:false})}else{const h=46+Math.round(Math.random()*6);g.obstacles.push({kind,x:g.w+24,y:g.h-RUNNER_PHYSICS.groundOffset-h,w:visualWidth,h,title,passed:false})}}
function drawDino(ctx,p,ground){const duck=p.ducking&&p.y>=ground-p.h-2;const y=duck?ground-RUNNER_PHYSICS.duckHeight:p.y;ctx.fillStyle='#6af6ff';ctx.shadowColor='#63f4ff';ctx.shadowBlur=14;if(duck){ctx.fillRect(p.x+3,y+5,22,10);ctx.fillRect(p.x+1,y+13,18,6);ctx.fillRect(p.x+22,y+8,7,6);ctx.fillRect(p.x+5,y+18,5,3);ctx.fillRect(p.x+18,y+18,5,3);ctx.shadowBlur=0;ctx.fillStyle='#00151b';ctx.fillRect(p.x+25,y+10,2,2)}else{ctx.fillRect(p.x+7,y+4,18,16);ctx.fillRect(p.x+3,y+17,17,12);ctx.fillRect(p.x,y+23,7,5);ctx.fillRect(p.x+17,y+29,5,7);ctx.fillRect(p.x+5,y+29,5,7);ctx.shadowBlur=0;ctx.fillStyle='#00151b';ctx.fillRect(p.x+20,y+8,3,3)}}
function wrapRunnerTitle(ctx,title,maxWidth,maxLines=2){const chars=[...String(title)],lines=[];let line='';for(const ch of chars){const next=line+ch;if(ctx.measureText(next).width>maxWidth&&line){lines.push(line);line=ch;if(lines.length===maxLines-1)break}else line=next}if(lines.length<maxLines&&line)lines.push(line);const used=lines.join('').length;if(used<chars.length&&lines.length){let last=lines.length-1;while(lines[last]&&ctx.measureText(lines[last]+'…').width>maxWidth)lines[last]=lines[last].slice(0,-1);lines[last]+='…'}return lines}
function runnerPlayerBox(g){const p=g.player,ground=g.h-RUNNER_PHYSICS.groundOffset,grounded=runnerOnGround(g),duck=p.ducking&&grounded;if(duck)return{x:p.x+6,y:ground-RUNNER_PHYSICS.duckHeight+3,w:p.w-12,h:RUNNER_PHYSICS.duckHeight-6};return{x:p.x+RUNNER_PHYSICS.playerInsetX,y:p.y+RUNNER_PHYSICS.playerInsetY,w:p.w-RUNNER_PHYSICS.playerInsetX*2,h:p.h-RUNNER_PHYSICS.playerInsetY*2}}
function runnerObstacleBox(o){const inset=RUNNER_PHYSICS.obstacleInsetX;return{x:o.x+inset,y:o.y+4,w:Math.max(26,o.w-inset*2),h:o.h-8}}
function runnerLoop(t){requestAnimationFrame(runnerLoop);const g=state.runner;if(!g)return;const c=$('#runnerCanvas'),ctx=c.getContext('2d');const rawDt=(t-g.last)/1000,dt=Math.min(.034,Math.max(0,rawDt||0));g.last=t;const ground=g.h-RUNNER_PHYSICS.groundOffset;ctx.clearRect(0,0,g.w,g.h);const bg=ctx.createLinearGradient(0,0,0,g.h);bg.addColorStop(0,'#030d18');bg.addColorStop(1,'#01060c');ctx.fillStyle=bg;ctx.fillRect(0,0,g.w,g.h);ctx.strokeStyle='rgba(99,244,255,.05)';ctx.lineWidth=1;for(let x=0;x<g.w;x+=44){ctx.beginPath();ctx.moveTo(x,ground);ctx.lineTo(x,g.h);ctx.stroke()}ctx.strokeStyle='rgba(99,244,255,.18)';ctx.beginPath();ctx.moveTo(0,ground);ctx.lineTo(g.w,ground);ctx.stroke();
  if(g.running){g.jumpBuffer=Math.max(0,g.jumpBuffer-dt);g.player.vy+=RUNNER_PHYSICS.gravity*dt;g.player.y+=g.player.vy*dt;if(g.player.y<RUNNER_PHYSICS.ceiling){g.player.y=RUNNER_PHYSICS.ceiling;if(g.player.vy<0)g.player.vy=0}if(g.player.y>=ground-g.player.h){g.player.y=ground-g.player.h;g.player.vy=0;g.player.jumpsUsed=0;if(g.jumpBuffer>0){g.player.vy=RUNNER_PHYSICS.jumpVelocity;g.player.jumpsUsed=1;g.jumpBuffer=0}}g.spawn-=dt;const baseSpeed=Math.min(RUNNER_PHYSICS.maxSpeed,RUNNER_PHYSICS.startSpeed+g.score*.13);g.speed=g.w<760?baseSpeed*.9:baseSpeed;if(g.spawn<=0){spawnObstacle(g);const difficulty=Math.min(.42,g.score/3000);g.spawn=(2.20-difficulty)+Math.random()*.82}g.obstacles.forEach(o=>o.x-=g.speed*dt);const pb=runnerPlayerBox(g);for(const o of g.obstacles){if(!o.passed&&o.x+o.w<g.player.x){o.passed=true;g.score+=25}const ob=runnerObstacleBox(o);const hit=pb.x+pb.w>ob.x&&pb.x<ob.x+ob.w&&pb.y+pb.h>ob.y&&pb.y<ob.y+ob.h;if(hit){g.running=false;g.player.ducking=false;g.best=Math.max(g.best,Math.floor(g.score));writeLocal('zhiverse.runner.best',String(g.best));$('#runnerBest').textContent=String(g.best).padStart(4,'0');$('#runnerStatus').textContent=`CRASH // ${o.title}`;toast('RUN ENDED // '+o.title)}}g.obstacles=g.obstacles.filter(o=>o.x+o.w>-30);g.score+=dt*8;$('#runnerScore').textContent=String(Math.floor(g.score)).padStart(4,'0')}
  drawDino(ctx,g.player,ground);for(const o of g.obstacles){const air=o.kind==='air';ctx.fillStyle=air?'rgba(16,12,34,.96)':'rgba(6,19,32,.96)';ctx.strokeStyle=air?'rgba(173,126,255,.7)':'rgba(255,139,61,.55)';ctx.shadowColor=air?'#a57cff':'#ff8b3d';ctx.shadowBlur=10;ctx.fillRect(o.x,o.y,o.w,o.h);ctx.strokeRect(o.x,o.y,o.w,o.h);ctx.shadowBlur=0;ctx.fillStyle=air?'#c4a7ff':'#ffb07b';ctx.font='700 8px ui-monospace,monospace';ctx.fillText(air?'AIR QUESTION · DUCK':'GROUND QUESTION · JUMP',o.x+7,o.y+12);ctx.fillStyle='#b9ced6';ctx.font='10px sans-serif';const lines=wrapRunnerTitle(ctx,o.title,o.w-14,2);lines.forEach((line,i)=>ctx.fillText(line,o.x+7,o.y+28+i*13));const ob=runnerObstacleBox(o);ctx.fillStyle=air?'rgba(173,126,255,.28)':'rgba(255,139,61,.28)';ctx.fillRect(ob.x,air?ob.y:ob.y+ob.h-2,ob.w,2)}const grounded=runnerOnGround(g),status=grounded?(g.player.ducking?'DUCKING':'JUMP READY'):`AIRBORNE · JUMP ${Math.min(RUNNER_PHYSICS.maxJumps,g.player.jumpsUsed+1)}/${RUNNER_PHYSICS.maxJumps}`;ctx.fillStyle='#527785';ctx.font='700 9px ui-monospace,monospace';ctx.fillText(`SPEED ${Math.round(g.speed)} PX/S  /  ${status}  /  SPACE ×2 · ↓ DUCK`,16,22)}
function startRunner(){if(!state.runner)initRunner();const g=state.runner;g.pool=runnerPool();g.poolIndex=0;g.obstacles=[];g.score=0;g.speed=RUNNER_PHYSICS.startSpeed;g.player.y=g.h-RUNNER_PHYSICS.groundOffset-g.player.h;g.player.vy=0;g.player.ducking=false;g.player.jumpsUsed=0;g.jumpBuffer=0;g.spawn=1.10;g.last=performance.now();g.running=true;$('#runnerStatus').textContent='RUNNING // SPACE ×2 TO JUMP · ↓ / S TO DUCK'}
$('#runnerStart').addEventListener('click',startRunner);$('#runnerCanvas').addEventListener('pointerdown',runnerJump);$('#runnerJumpBtn').addEventListener('pointerdown',e=>{e.preventDefault();runnerJump()});$('#runnerDuckBtn').addEventListener('pointerdown',e=>{e.preventDefault();runnerDuck(true)});['pointerup','pointercancel','pointerleave'].forEach(ev=>$('#runnerDuckBtn').addEventListener(ev,()=>runnerDuck(false)));addEventListener('keydown',e=>{if(state.mode!=='runner')return;if(e.code==='Space'||e.code==='ArrowUp'){e.preventDefault();if(!e.repeat)runnerJump()}else if(e.code==='ArrowDown'||e.code==='KeyS'){e.preventDefault();runnerDuck(true)}});addEventListener('keyup',e=>{if(state.mode==='runner'&&(e.code==='ArrowDown'||e.code==='KeyS'))runnerDuck(false)});$('#runnerRefresh').addEventListener('click',async()=>{if(!state.demo)await refreshHot(false);if(!state.runner)initRunner();state.runner.pool=runnerPool();toast(`QUESTION POOL // ${state.runner.pool.length} ITEMS`)});initRunner();

// Personal memory
async function loadMemory({silent=false}={}){if(state.memory.length)return state.memory;if(state.demo){state.memory=DEMO_MEMORY;state.memoryThemes=['AI','数学','工程','知识管理','游戏与设计'];return state.memory}const [c,co,f,fl]=await Promise.allSettled([api.userContentsMany(500),api.userCollections(50),api.userFolloweesMany(300),api.userFavlists(30)]);const creations=c.status==='fulfilled'?c.value:[],collections=co.status==='fulfilled'?co.value:[],followees=f.status==='fulfilled'?f.value:[],favlists=fl.status==='fulfilled'?fl.value:[];const deep=[];for(const fv of favlists.slice(0,8)){const raw=fv.raw||{},token=raw.UrlToken??raw.FavlistUrlToken??raw.url_token??raw.favlist_url_token,id=raw.Id??raw.FavlistId??raw.id??raw.favlist_id;try{if(token!=null&&/^\d+$/.test(String(token)))deep.push(...await api.favlistContentsMany({favlistUrlToken:String(token),max:150}));else if(id!=null&&/^\d+$/.test(String(id)))deep.push(...await api.favlistContentsMany({favlistId:String(id),max:150}))}catch{}}state.memory=[...creations,...collections,...followees,...favlists,...deep];if(!state.memory.length&&!silent)throw new Error('个人接口没有返回可展示的数据');return state.memory}
function updateMemoryStats(){const count=k=>state.memory.filter(x=>x.kind===k).length;$('#memoryStats').innerHTML=`<span>CREATIONS ${count('creation')}</span><span>COLLECTIONS ${count('collection')}</span><span>FOLLOWEES ${count('followee')}</span><span>SAVED ${count('favitem')+count('collection')}</span><span>FAVLISTS ${count('favlist')}</span>`}
$('#loadMemory').addEventListener('click',async()=>{const b=$('#loadMemory');b.disabled=true;b.textContent='ASSEMBLING…';try{await loadMemory();updateMemoryStats();scene.setMemory(state.memory,state.memoryThemes);updateTelemetry();flash();toast(`MEMORY PLANET // ${state.memory.length} SIGNALS`)}catch(e){toast(e.message,true)}finally{b.disabled=false;b.textContent='ASSEMBLE PLANET'}});
$('#timeDepth').addEventListener('input',e=>scene.setMemoryDepth(Number(e.target.value)));
$('#memoryAI').addEventListener('click',async()=>{try{await loadMemory();let themes;if(state.demo)themes=['AI / LLM','数学 / 统计','工程','知识管理','游戏与设计'];else{const titles=state.memory.slice(0,120).map(x=>x.title).join('\n');const a=await api.ask(`下面是一位用户公开创作、收藏和关注内容的标题。请归纳 5 个简短主题标签，每个不超过 8 个汉字。只输出 JSON 数组，不解释。\n${titles}`);themes=extractJsonArray(a.content).slice(0,5)}state.memoryThemes=themes.length?themes:keywords(state.memory,5).map(x=>x.word);scene.setMemory(state.memory,state.memoryThemes);toast('THEME SCAN // '+state.memoryThemes.join(' · '))}catch(e){toast(e.message,true)}});

// Recap
function populateYears(items){const years=[...new Set(items.map(x=>toDate(x.time)?.getFullYear()).filter(Boolean))].sort((a,b)=>b-a);const sel=$('#recapYear'),prev=Number(sel.value);sel.innerHTML=(years.length?years:[new Date().getFullYear()]).map(y=>`<option value="${y}">${y}</option>`).join('');if(years.includes(prev))sel.value=prev}
async function prepareRecap(){try{await loadMemory({silent:true});populateYears(state.memory);buildRecap()}catch(e){$('#recapComment').textContent=state.demo?'Demo recap ready.':`需要先连接 Access Secret：${e.message}`}}
function filterRecap(){const y=Number($('#recapYear').value)||new Date().getFullYear(),m=Number($('#recapMonth').value)||0;return state.memory.filter(x=>{const d=toDate(x.time);return d&&d.getFullYear()===y&&(!m||d.getMonth()+1===m)})}
function drawRecapChart(items,month){const c=$('#recapChart'),ctx=c.getContext('2d'),w=c.clientWidth||700,h=c.clientHeight||170,dpr=Math.min(2,devicePixelRatio||1);c.width=w*dpr;c.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);const bins=month?Array.from({length:31},()=>0):Array.from({length:12},()=>0);items.forEach(x=>{const d=toDate(x.time);if(d)bins[month?d.getDate()-1:d.getMonth()]++});const max=Math.max(1,...bins),pad=18,bw=(w-pad*2)/bins.length;ctx.strokeStyle='rgba(99,244,255,.08)';for(let i=0;i<4;i++){const y=pad+(h-pad*2)*i/3;ctx.beginPath();ctx.moveTo(pad,y);ctx.lineTo(w-pad,y);ctx.stroke()}bins.forEach((v,i)=>{const bh=(h-pad*2)*(v/max);const g=ctx.createLinearGradient(0,h-pad-bh,0,h-pad);g.addColorStop(0,'rgba(99,244,255,.8)');g.addColorStop(1,'rgba(47,156,255,.15)');ctx.fillStyle=g;ctx.fillRect(pad+i*bw+2,h-pad-bh,Math.max(2,bw-4),bh)});ctx.fillStyle='#536f7d';ctx.font='8px ui-monospace,monospace';bins.forEach((_,i)=>{if((month&&[0,7,14,21,28].includes(i))||(!month&&i%2===0))ctx.fillText(month?String(i+1):`${i+1}月`,pad+i*bw+2,h-4)})}
function buildRecap(){
  const items=filterRecap(),year=$('#recapYear').value,month=Number($('#recapMonth').value);
  $('#recapTotal').textContent=items.length;$('#recapPeriod').textContent=month?`${year}.${String(month).padStart(2,'0')}`:year;
  $('#recapCreations').textContent=items.filter(x=>x.kind==='creation').length;$('#recapSaved').textContent=items.filter(x=>['favitem','collection'].includes(x.kind)).length;
  const days=new Map();items.forEach(x=>{const d=toDate(x.time);if(d){const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;days.set(k,(days.get(k)||0)+1)}});
  const active=[...days.entries()].sort((a,b)=>b[1]-a[1])[0];$('#recapDay').textContent=active?active[0].slice(5):'—';drawRecapChart(items,month);
  const kws=keywords(items,20);$('#recapKeywords').innerHTML=kws.map((x,i)=>`<button style="font-size:${9+Math.min(8,x.count*1.2)}px">${escapeHtml(x.word)}</button>`).join('')||'<span style="color:#526d79">没有足够文本</span>';
  const top=[...items].sort((a,b)=>(toDate(b.time)?.getTime()||0)-(toDate(a.time)?.getTime()||0)).slice(0,8);$('#recapHighlights').innerHTML=top.map(x=>{const d=toDate(x.time);return `<div class="recap-highlight"><time>${d?`${d.getMonth()+1}/${d.getDate()}`:'—'}</time><span>${escapeHtml(x.title)}</span></div>`}).join('')||'<span style="color:#526d79">这个时间段没有记录</span>';
  const dated=state.memory.filter(x=>toDate(x.time)),undatedCreations=state.memory.filter(x=>x.kind==='creation'&&!toDate(x.time)).length;
  if(!items.length&&undatedCreations){$('#recapComment').textContent=`已读取 ${state.memory.filter(x=>x.kind==='creation').length} 条创作，但其中 ${undatedCreations} 条缺少可解析的发布时间，暂时无法按年份归档。`;return}
  if(!items.length&&dated.length){$('#recapComment').textContent=`当前选择的 ${month?`${year} 年 ${month} 月`:`${year} 年`} 没有读取到带日期的创作或收藏记录。`;return}
  $('#recapComment').textContent='点击 ZHIDA COMMENT，让直答基于统计摘要写一段简短回顾。';
}
$('#buildRecap').addEventListener('click',async()=>{try{await loadMemory();populateYears(state.memory);buildRecap()}catch(e){toast(e.message,true)}});$('#recapYear').addEventListener('change',buildRecap);$('#recapMonth').addEventListener('change',buildRecap);
$('#recapAI').addEventListener('click',async()=>{try{
  const items=filterRecap(),kws=keywords(items,10).map(x=>x.word),year=$('#recapYear').value,month=Number($('#recapMonth').value);
  if(!items.length){$('#recapComment').textContent=`当前选择的 ${month?`${year} 年 ${month} 月`:`${year} 年`} 没有可用于生成回顾的带日期记录。`;return}
  const stats={period:month?`${year}-${month}`:year,total:items.length,creations:items.filter(x=>x.kind==='creation').length,saved:items.filter(x=>['favitem','collection'].includes(x.kind)).length,keywords:kws};
  if(state.demo){$('#recapComment').textContent=`这一段时间里，你留下的痕迹明显集中在 ${kws.slice(0,4).join('、')||'几个不同主题'}。输出和收藏并不完全重合：有些东西你愿意写，有些东西只是默默存起来。`}
  else{const a=await api.ask(`这是用户基于自己知乎公开数据生成的回顾统计：${JSON.stringify(stats)}。请只依据这些统计写 80-120 字自然中文回顾；不要补充统计中不存在的事实，不要夸张，不要使用“你是一个”式人格判断，不要分点。`);$('#recapComment').textContent=a.content}
}catch(e){toast(e.message,true)}});

function roundedRect(ctx,x,y,w,h,r=24){const rr=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+rr,y);ctx.arcTo(x+w,y,x+w,y+h,rr);ctx.arcTo(x+w,y+h,x,y+h,rr);ctx.arcTo(x,y+h,x,y,rr);ctx.arcTo(x,y,x+w,y,rr);ctx.closePath()}
function wrapCanvasText(ctx,text,x,y,maxWidth,lineHeight,maxLines=99){const chars=Array.from(String(text||''));let line='',lines=[];for(const ch of chars){const next=line+ch;if(ctx.measureText(next).width>maxWidth&&line){lines.push(line);line=ch;if(lines.length>=maxLines)break}else line=next}if(lines.length<maxLines&&line)lines.push(line);lines.slice(0,maxLines).forEach((s,i)=>ctx.fillText(s,x,y+i*lineHeight));return lines.length*lineHeight}
function recapBins(items,month){const bins=month?Array.from({length:31},()=>0):Array.from({length:12},()=>0);items.forEach(x=>{const d=toDate(x.time);if(d)bins[month?d.getDate()-1:d.getMonth()]++});return bins}
function generateRecapPoster(){
  const items=filterRecap(),year=$('#recapYear').value,month=Number($('#recapMonth').value),period=month?`${year} 年 ${month} 月`:`${year} 年度`;
  if(!items.length){toast('当前时间段没有可生成长图的数据',true);return}
  const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=2480;const ctx=canvas.getContext('2d');
  const bg=ctx.createLinearGradient(0,0,0,2480);bg.addColorStop(0,'#020711');bg.addColorStop(.55,'#04111d');bg.addColorStop(1,'#01040a');ctx.fillStyle=bg;ctx.fillRect(0,0,1080,2480);
  const r=seeded(hashString(`${year}-${month}-${items.length}`));for(let i=0;i<250;i++){const x=r()*1080,y=r()*2480,a=.08+r()*.32,s=.6+r()*1.5;ctx.fillStyle=`rgba(110,238,255,${a})`;ctx.fillRect(x,y,s,s)}
  let glow=ctx.createRadialGradient(180,250,20,180,250,520);glow.addColorStop(0,'rgba(57,226,255,.18)');glow.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,760,760);
  glow=ctx.createRadialGradient(900,1250,10,900,1250,560);glow.addColorStop(0,'rgba(145,98,255,.12)');glow.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=glow;ctx.fillRect(400,700,680,1100);
  ctx.fillStyle='#63f4ff';ctx.font='700 21px ui-monospace,Consolas,monospace';ctx.letterSpacing='4px';ctx.fillText('ZHIHU://VERSE · PERSONAL RECAP',72,92);
  ctx.fillStyle='#efffff';ctx.font='900 78px system-ui,"Microsoft YaHei",sans-serif';ctx.fillText(period,72,205);
  ctx.fillStyle='#6c8d9b';ctx.font='500 27px system-ui,"Microsoft YaHei",sans-serif';ctx.fillText('把这一段时间留下的创作与收藏，重新摊开看一遍。',74,258);
  ctx.strokeStyle='rgba(99,244,255,.22)';ctx.beginPath();ctx.moveTo(72,305);ctx.lineTo(1008,305);ctx.stroke();
  const stats=[['TOTAL',items.length],['CREATIONS',items.filter(x=>x.kind==='creation').length],['SAVED',items.filter(x=>['favitem','collection'].includes(x.kind)).length],['ACTIVE DAYS',new Set(items.map(x=>toDate(x.time)?.toISOString().slice(0,10)).filter(Boolean)).size]];
  stats.forEach((s,i)=>{const x=72+i*237,y=352,w=213,h=150;ctx.fillStyle='rgba(7,20,34,.82)';roundedRect(ctx,x,y,w,h,18);ctx.fill();ctx.strokeStyle='rgba(99,244,255,.13)';ctx.stroke();ctx.fillStyle='#577886';ctx.font='700 17px ui-monospace,Consolas,monospace';ctx.fillText(s[0],x+20,y+34);ctx.fillStyle=i===0?'#63f4ff':'#e9feff';ctx.font='900 48px ui-monospace,Consolas,monospace';ctx.fillText(String(s[1]),x+20,y+98)});
  ctx.fillStyle='#dffcff';ctx.font='800 27px ui-monospace,Consolas,monospace';ctx.fillText('ACTIVITY TIMELINE',72,590);
  const bins=recapBins(items,month),max=Math.max(1,...bins),cx=72,cy=635,cw=936,ch=260,bw=cw/bins.length;
  ctx.strokeStyle='rgba(112,210,240,.09)';for(let i=0;i<4;i++){const yy=cy+i*ch/3;ctx.beginPath();ctx.moveTo(cx,yy);ctx.lineTo(cx+cw,yy);ctx.stroke()}
  bins.forEach((v,i)=>{const bh=(v/max)*(ch-22),g=ctx.createLinearGradient(0,cy+ch-bh,0,cy+ch);g.addColorStop(0,'#65f4ff');g.addColorStop(1,'rgba(47,156,255,.18)');ctx.fillStyle=g;roundedRect(ctx,cx+i*bw+4,cy+ch-bh,Math.max(4,bw-8),bh,5);ctx.fill()});
  ctx.fillStyle='#577482';ctx.font='500 14px ui-monospace,Consolas,monospace';bins.forEach((_,i)=>{if((month&&[0,7,14,21,28].includes(i))||(!month&&i%2===0))ctx.fillText(month?String(i+1):`${i+1}月`,cx+i*bw+4,cy+ch+28)});
  const kws=keywords(items,18);ctx.fillStyle='#dffcff';ctx.font='800 27px ui-monospace,Consolas,monospace';ctx.fillText('KEYWORD CONSTELLATION',72,1010);
  let kx=72,ky=1060;ctx.font='700 23px system-ui,"Microsoft YaHei",sans-serif';for(const [i,k] of kws.entries()){const label=`# ${k.word}`,tw=ctx.measureText(label).width+38;if(kx+tw>1008){kx=72;ky+=62}ctx.fillStyle=i%4===0?'rgba(99,244,255,.13)':i%4===1?'rgba(148,109,255,.12)':'rgba(255,255,255,.045)';roundedRect(ctx,kx,ky-34,tw,46,23);ctx.fill();ctx.strokeStyle=i%4===0?'rgba(99,244,255,.3)':'rgba(152,169,201,.13)';ctx.stroke();ctx.fillStyle=i%4===0?'#aefaff':i%4===1?'#cbbfff':'#9db7c2';ctx.fillText(label,kx+19,ky-4);kx+=tw+12}
  const highlights=[...items].sort((a,b)=>(b.time||0)-(a.time||0)).slice(0,7);let hy=Math.max(1325,ky+95);ctx.fillStyle='#dffcff';ctx.font='800 27px ui-monospace,Consolas,monospace';ctx.fillText('MEMORY HIGHLIGHTS',72,hy);hy+=55;
  highlights.forEach((it,i)=>{const d=toDate(it.time),date=d?`${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`:'—';ctx.fillStyle='rgba(6,18,31,.76)';roundedRect(ctx,72,hy,936,112,16);ctx.fill();ctx.strokeStyle='rgba(99,244,255,.09)';ctx.stroke();ctx.fillStyle=i<2?'#63f4ff':'#617f8c';ctx.font='700 18px ui-monospace,Consolas,monospace';ctx.fillText(date,94,hy+35);ctx.fillStyle='#d9edf2';ctx.font='650 23px system-ui,"Microsoft YaHei",sans-serif';wrapCanvasText(ctx,it.title,195,hy+35,780,32,2);hy+=126});
  let comment=cleanText($('#recapComment').textContent||'');if(!comment||comment.startsWith('点击 ZHIDA COMMENT')){const topWords=keywords(items,5).map(x=>x.word);comment=topWords.length?`这一段时间留下的内容主要围绕 ${topWords.join('、')} 展开。`: '这一段时间的公开创作与收藏已经整理在这张回顾里。'}const commentY=Math.min(2220,hy+36);ctx.fillStyle='#dffcff';ctx.font='800 27px ui-monospace,Consolas,monospace';ctx.fillText('A NOTE FOR THIS PERIOD',72,commentY);ctx.fillStyle='#89a7b3';ctx.font='500 24px system-ui,"Microsoft YaHei",sans-serif';wrapCanvasText(ctx,comment,72,commentY+58,920,40,5);
  ctx.strokeStyle='rgba(99,244,255,.16)';ctx.beginPath();ctx.moveTo(72,2380);ctx.lineTo(1008,2380);ctx.stroke();ctx.fillStyle='#587684';ctx.font='600 16px ui-monospace,Consolas,monospace';ctx.fillText(`GENERATED ${new Date().toLocaleDateString('zh-CN')} · ZHIHU://VERSE`,72,2425);ctx.textAlign='right';ctx.fillStyle='#63f4ff';ctx.fillText(`${items.length} SIGNALS`,1008,2425);ctx.textAlign='left';
  const a=document.createElement('a');a.download=`zhihu-recap-${year}${month?'-'+String(month).padStart(2,'0'):''}.png`;a.href=canvas.toDataURL('image/png',1);a.click();toast('LONG POSTER EXPORTED // PNG');
}
$('#exportRecap').addEventListener('click',async()=>{try{await loadMemory();populateYears(state.memory);buildRecap();generateRecapPoster()}catch(e){toast(e.message,true)}});


// Hot / Live
function loadHistory(){try{return JSON.parse(readLocal(HISTORY_KEY,'[]')||'[]')}catch{return []}}
function saveSnapshot(items){const h=loadHistory(),snap={time:Date.now(),items:items.map(x=>({title:x.title,rank:x.rank,url:x.url,summary:x.summary}))};if(h.at(-1)&&Date.now()-h.at(-1).time<120000)return h;h.push(snap);while(h.length>120)h.shift();writeLocal(HISTORY_KEY,JSON.stringify(h));return h}
function demoHistory(){const base=DEMO_HOT.slice(0,12);return Array.from({length:8},(_,t)=>({time:Date.now()-(7-t)*3600e3,items:base.map((x,i)=>({...x,rank:clamp(i+1+Math.round(Math.sin(t*.8+i)*4)+(i===0?4-t:0),1,30)})).sort((a,b)=>a.rank-b.rank)}))}
async function refreshHot(show=true){if(state.demo){state.hot=DEMO_HOT.map(x=>({...x}));if(show)toast('DEMO HOT ARRAY UPDATED');return state.hot}try{state.hot=await api.hot(30);saveSnapshot(state.hot);if(show)toast(`HOT ARRAY // ${state.hot.length} SIGNALS`);updateTelemetry();return state.hot}catch(e){if(show)toast(e.message,true);throw e}}
function renderHotScene(){const hist=state.demo?demoHistory():loadHistory();let current=state.hot.length?state.hot:(state.demo?hist.at(-1)?.items:[]);const prev=hist.length>1?hist.at(-2).items:[];if(!current?.length){scene.setHome([]);$('#liveFeed').innerHTML='<span>先点 SCAN NOW 保存第一个快照</span>';return}scene.setHotSnapshot(current,prev);const pm=new Map(prev.map(x=>[x.title,x.rank]));const diffs=current.map(x=>({...x,delta:pm.has(x.title)?pm.get(x.title)-x.rank:null})).filter(x=>x.delta!=null).sort((a,b)=>Math.abs(b.delta)-Math.abs(a.delta));$('#liveFeed').innerHTML=diffs.slice(0,4).map(x=>`<span class="${x.delta>0?'rise':x.delta<0?'collapse':''}">${escapeHtml(x.title)} ${x.delta>0?'▲'+x.delta:x.delta<0?'▼'+Math.abs(x.delta):'—'}</span>`).join('　')||'<span>需要至少两个快照才能计算排名变化</span>';const sl=$('#hotTimeline');sl.max=Math.max(0,hist.length-1);sl.value=Math.max(0,hist.length-1);updateTelemetry()}
$('#scanHot').addEventListener('click',async()=>{await refreshHot(true);if(!state.demo)saveSnapshot(state.hot);renderHotScene()});$('#hotTimeline').addEventListener('input',e=>{const h=state.demo?demoHistory():loadHistory(),i=Number(e.target.value);if(!h[i])return;scene.setHotSnapshot(h[i].items,i>0?h[i-1].items:[]);$('#liveFeed').innerHTML=`<span>REPLAY // ${new Date(h[i].time).toLocaleString()}</span>`;updateTelemetry()});$('#toggleAutoScan').addEventListener('click',()=>{if(state.autoTimer){clearInterval(state.autoTimer);state.autoTimer=null;$('#toggleAutoScan').textContent='AUTO: OFF';toast('AUTO SCAN OFF')}else{const ms=state.demo?10000:5*60*1000;state.autoTimer=setInterval(async()=>{try{await refreshHot(false);renderHotScene()}catch{}},ms);$('#toggleAutoScan').textContent=state.demo?'AUTO: 10S':'AUTO: 5MIN';toast(state.demo?'DEMO 每 10 秒刷新':'每 5 分钟保存一次热榜快照')}});

// PDF/PPT lab
const pretty=x=>JSON.stringify(x,null,2);
function readId(obj,...names){for(const n of names){if(obj?.[n]!=null)return obj[n]}for(const v of Object.values(obj||{})){if(v&&typeof v==='object'){const x=readId(v,...names);if(x!=null)return x}}return null}
function formatBytes(bytes){const n=Number(bytes)||0;if(n<1024)return `${n} B`;if(n<1024**2)return `${(n/1024).toFixed(1)} KB`;return `${(n/1024**2).toFixed(n<10*1024**2?1:0)} MB`}
function labTaskState(payload){
  if(payload&&typeof payload==='object'&&payload.error)return 'error';
  const raw=readId(payload,'task_status','TaskStatus','status','Status','state','State');
  const status=String(raw??'').toLowerCase();
  if(/success|succeed|complete|completed|finished|done/.test(status))return 'success';
  if(/fail|failed|error|cancel|rejected/.test(status))return 'error';
  if(/run|running|process|processing|pending|queue|queued|upload|parsing|creating/.test(status))return 'working';
  return 'idle';
}
function setLabOutput(kind,content,state='idle'){
  const consoleEl=$(`#${kind}Console`),out=$(`#${kind}Output`),status=$(`#${kind}ConsoleState`);
  if(out)out.textContent=typeof content==='string'?content:pretty(content);
  if(consoleEl)consoleEl.dataset.state=state;
  if(status)status.textContent=state==='working'?'RUNNING':state==='success'?'SUCCEEDED':state==='error'?'ERROR':'IDLE';
}
function updatePdfFileSummary(file){
  const box=$('#pdfFileSummary'),name=$('#pdfFileName'),meta=$('#pdfFileMeta');
  if(!file){box?.classList.remove('has-file');if(name)name.textContent='NO FILE SELECTED';if(meta)meta.textContent='等待选择本地 PDF';return}
  box?.classList.add('has-file');if(name)name.textContent=file.name;if(meta)meta.textContent=`${formatBytes(file.size)} · ${file.type||'application/pdf'}`;
}
const pdfInput=$('#pdfFile'),pdfDrop=$('#pdfDropzone');
pdfInput?.addEventListener('change',()=>updatePdfFileSummary(pdfInput.files?.[0]));
pdfDrop?.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pdfInput?.click()}});
for(const evt of ['dragenter','dragover'])pdfDrop?.addEventListener(evt,e=>{e.preventDefault();pdfDrop.classList.add('dragover')});
for(const evt of ['dragleave','drop'])pdfDrop?.addEventListener(evt,e=>{e.preventDefault();pdfDrop.classList.remove('dragover')});
pdfDrop?.addEventListener('drop',e=>{const file=e.dataTransfer?.files?.[0];if(!file)return;if(!/\.pdf$/i.test(file.name)){toast('这里只接受 PDF 文件',true);return}const dt=new DataTransfer();dt.items.add(file);pdfInput.files=dt.files;updatePdfFileSummary(file)});
function stepPptPages(delta){const el=$('#pptPages');if(!el)return;el.value=String(clamp((Number(el.value)||12)+delta,6,21))}
$('#pptPagesMinus')?.addEventListener('click',()=>stepPptPages(-1));
$('#pptPagesPlus')?.addEventListener('click',()=>stepPptPages(1));
$('#pptPages')?.addEventListener('change',e=>{e.target.value=String(clamp(Number(e.target.value)||12,6,21))});

$('#pdfUpload').addEventListener('click',async()=>{const file=$('#pdfFile').files[0];if(state.demo){state.pdfTask='pdf_demo_2026';setLabOutput('pdf','DEMO\nfile_id: file_demo_2026\ntask_id: pdf_demo_2026\nstatus: processing','working');return}if(!file){toast('请先选择 PDF',true);return}setLabOutput('pdf',`正在上传 ${file.name}\n${formatBytes(file.size)}\n\n等待服务器响应…`,'working');try{const up=await api.uploadPdf(file),fileId=readId(up,'file_id','FileId','id','Id');if(!fileId)throw new Error('上传成功但未识别到 file_id');setLabOutput('pdf',`上传完成\nfile_id: ${fileId}\n\n正在创建解析任务…`,'working');const task=await api.pdfCreate(String(fileId));state.pdfTask=String(readId(task,'task_id','TaskId','id','Id')||'');setLabOutput('pdf',task,labTaskState(task));if(!state.pdfTask)$('#pdfOutput').textContent+='\n\n未自动识别 task_id，可从响应中复制。'}catch(e){setLabOutput('pdf','ERROR: '+e.message,'error')}});
$('#pdfCheck').addEventListener('click',async()=>{if(state.demo){setLabOutput('pdf','DEMO\nstatus: succeeded\nmarkdown_url: https://example.invalid/demo.md','success');return}if(!state.pdfTask){toast('还没有 PDF task_id',true);return}setLabOutput('pdf',`正在查询\n${state.pdfTask}`,'working');try{const result=await api.pdfStatus(state.pdfTask);setLabOutput('pdf',result,labTaskState(result))}catch(e){setLabOutput('pdf','ERROR: '+e.message,'error')}});
$('#pptCreate').addEventListener('click',async()=>{const url=$('#pptUrl').value.trim(),pages=Number($('#pptPages').value);if(state.demo){state.pptTask='ppt_demo_2026';setLabOutput('ppt',`DEMO\ntask_id: ppt_demo_2026\nstatus: processing\npages: ${pages}`,'working');return}setLabOutput('ppt',`正在创建 PPT 任务\npages: ${pages}\n\n等待服务器响应…`,'working');try{const task=await api.pptCreate(url,pages);state.pptTask=String(readId(task,'task_id','TaskId','id','Id')||'');setLabOutput('ppt',task,labTaskState(task))}catch(e){setLabOutput('ppt','ERROR: '+e.message,'error')}});
$('#pptCheck').addEventListener('click',async()=>{if(state.demo){setLabOutput('ppt','DEMO\nstatus: succeeded\ndownload_url: https://example.invalid/demo.pptx','success');return}if(!state.pptTask){toast('还没有 PPT task_id',true);return}setLabOutput('ppt',`正在查询\n${state.pptTask}`,'working');try{const result=await api.pptStatus(state.pptTask);setLabOutput('ppt',result,labTaskState(result))}catch(e){setLabOutput('ppt','ERROR: '+e.message,'error')}});

// Capture
$('#shareButton').addEventListener('click',()=>{const out=$('#shareCanvas'),ctx=out.getContext('2d'),src=$('#universe');ctx.fillStyle='#01040a';ctx.fillRect(0,0,out.width,out.height);try{ctx.drawImage(src,0,0,out.width,out.height)}catch{}ctx.fillStyle='rgba(1,5,12,.52)';ctx.fillRect(0,0,out.width,100);ctx.fillStyle='#eaffff';ctx.font='800 36px ui-monospace,monospace';ctx.fillText('ZHIHU://VERSE',45,58);ctx.fillStyle='#6a8c9b';ctx.font='700 13px ui-monospace,monospace';ctx.fillText(`${state.mode.toUpperCase()} · ${state.demo?'DEMO':'LIVE'} · ${new Date().toLocaleString()}`,47,82);$('#shareDialog').showModal()});$('#saveShare').addEventListener('click',()=>{const a=document.createElement('a');a.download=`zhihu-verse-${Date.now()}.png`;a.href=$('#shareCanvas').toDataURL('image/png');a.click()});

// Sound is intentionally subtle: toggle only UI feedback in this build.
let soundOn=true;$('#soundButton').addEventListener('click',()=>{soundOn=!soundOn;$('#soundButton').textContent=soundOn?'◉':'○';toast(soundOn?'SOUND ON':'SOUND OFF')});

// Boot
refreshHot(false).catch(()=>{});updateTelemetry();
window.addEventListener('error',e=>{const msg=e?.error?.message||e.message||'UNKNOWN';const bar=document.createElement('div');bar.style.cssText='position:fixed;z-index:9999;left:10px;right:10px;top:10px;padding:12px;background:#3b0d19;color:#ffdbe3;border:1px solid #ff466b;font:12px monospace';bar.textContent='ZHIHU://VERSE BOOT ERROR // '+msg;document.body.appendChild(bar)});
