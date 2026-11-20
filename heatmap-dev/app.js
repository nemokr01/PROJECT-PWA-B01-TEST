'use strict';
// 모의 데이터 전용. 키움·Oracle·외부 네트워크 요청 없음.
const MOCK = Object.freeze({cash:1450000,stocks:[
 {name:'삼성전자',buy:65000,price:71000,qty:12,change:1.8},
 {name:'SK하이닉스',buy:190000,price:205000,qty:4,change:4.7},
 {name:'한미반도체',buy:110000,price:119000,qty:2,change:7.1},
 {name:'DB하이텍',buy:53000,price:52000,qty:2,change:-2.2},
 {name:'현대차',buy:245000,price:232000,qty:3,change:-3.2},
 {name:'기아',buy:105000,price:110000,qty:4,change:3.1},
 {name:'현대모비스',buy:230000,price:238000,qty:1,change:-0.4},
 {name:'LG에너지솔루션',buy:330000,price:345000,qty:1,change:5.4},
 {name:'NAVER',buy:205000,price:205000,qty:2,change:0.4},
 {name:'카카오',buy:47000,price:44000,qty:8,change:-4.6},
 {name:'삼성바이오로직스',buy:820000,price:845000,qty:1,change:0.1},
 {name:'셀트리온',buy:180000,price:174000,qty:2,change:-1.6},
 {name:'POSCO홀딩스',buy:360000,price:350000,qty:1,change:-5.8},
 {name:'KB금융',buy:79000,price:83000,qty:5,change:2.6},
 {name:'신한지주',buy:52000,price:53500,qty:3,change:0},
 {name:'한국전력',buy:22000,price:23000,qty:7,change:1.1}
]});
const won=n=>new Intl.NumberFormat('ko-KR',{style:'currency',currency:'KRW',maximumFractionDigits:0}).format(n);
const percent=n=>Number.isFinite(n)?`${n>=0?'+':''}${n.toFixed(2)}%`:'—';
function validate(data){if(!data||!Array.isArray(data.stocks)||!Number.isFinite(data.cash)||data.cash<0)throw Error('예수금 또는 종목 목록 오류');const names=new Set();for(const s of data.stocks){if(typeof s.name!=='string'||!s.name.trim()||names.has(s.name)||![s.buy,s.price,s.qty,s.change].every(Number.isFinite)||s.buy<0||s.price<0||s.qty<0||!Number.isInteger(s.qty))throw Error('종목 데이터 오류');names.add(s.name);}return data;}
function calculate(data){validate(data);const stocks=data.stocks.map(s=>({...s,invested:s.buy*s.qty,value:s.price*s.qty,profit:(s.price-s.buy)*s.qty}));const invested=stocks.reduce((a,s)=>a+s.invested,0),valuation=stocks.reduce((a,s)=>a+s.value,0);if(!Number.isSafeInteger(invested)||!Number.isSafeInteger(valuation))throw Error('계산 범위 초과');return {stocks,invested,valuation,profit:valuation-invested,rate:invested?((valuation-invested)/invested)*100:null,cash:data.cash};}

const INDICES=[
 {name:'코스피',value:'2,650.12',change:'+0.82%',dir:1,points:[12,21,18,33,30,45,42,55,51,69]},
 {name:'코스닥',value:'760.82',change:'-0.50%',dir:-1,points:[58,49,55,39,46,37,45,30,38,34]},
 {name:'S&P500',value:'5,850.2',change:'+0.34%',dir:1,points:[12,19,16,32,28,42,40,56,53,66]},
 {name:'나스닥',value:'18,450.6',change:'+0.71%',dir:1,points:[11,23,20,33,29,47,44,59,55,72]},
 {name:'다우',value:'42,150.3',change:'-0.18%',dir:-1,points:[49,56,44,53,37,49,41,29,39,33]}
];
// V1_R056: DEV-only index addition; never fetches live market data.
const selectedIndices=[...INDICES];
const EXTRA_INDICES=[
 {name:'러셀2000',value:'2,310.8',change:'+0.26%',dir:1,points:[12,20,17,28,23,35,31,43,41,52]},
 {name:'닛케이225',value:'38,250.4',change:'-0.31%',dir:-1,points:[55,48,53,39,44,34,36,25,30,20]},
 {name:'항셍',value:'19,630.1',change:'+0.12%',dir:1,points:[15,22,19,24,21,30,28,37,33,39]}
];
function createIndexCard(item){
 const card=el('article','index-card '+(item.dir>0?'index-up':item.dir<0?'index-down':'index-flat'));
 card.append(el('span','index-name',item.name),el('strong','index-value',item.value),el('small','index-change',item.change));
 const chart=el('div','index-spark');chart.innerHTML=spark(item.points,item.dir);card.append(chart);
 return card;
}
function updateIndexPagination(){
 const row=document.getElementById('indices'),nav=document.getElementById('index-pagination');
 if(!row||!nav||!row.children.length)return;
 const cards=[...row.children],step=cards.length>1?cards[1].offsetLeft-cards[0].offsetLeft:row.clientWidth;
 if(step<=0)return;
 const visible=Math.max(1,Math.min(cards.length,Math.round((row.clientWidth+5)/step)));
 const pages=Math.max(1,cards.length-visible+1);
 const active=Math.max(0,Math.min(pages-1,Math.round(row.scrollLeft/step)));
 if(nav.children.length!==pages){
  nav.replaceChildren();
  for(let i=0;i<pages;i++){
   const dot=document.createElement('button');dot.type='button';dot.className='index-page';dot.setAttribute('aria-label',`지수 목록 ${i+1}번째 위치로 이동`);
   dot.addEventListener('click',()=>row.scrollTo({left:i*step,behavior:'smooth'}));nav.append(dot);
  }
 }
 [...nav.children].forEach((dot,i)=>{dot.classList.toggle('active',i===active);dot.setAttribute('aria-current',i===active?'true':'false');});
}
const SECTORS=[{name:'반도체',stocks:['삼성전자','SK하이닉스','한미반도체','DB하이텍']},{name:'자동차·배터리',stocks:['현대차','기아','현대모비스','LG에너지솔루션']},{name:'IT·바이오·기타',stocks:['NAVER','카카오','삼성바이오로직스','셀트리온','POSCO홀딩스','KB금융','신한지주','한국전력']}];
const UNOWNED_EXAMPLES=['한전기술','두산에너빌리티'];
// V1_R039: no stock industry icons; names and percentage only.
// V1_R040: preserve full stock names and wrap only at meaningful boundaries.
const NAME_PARTS={
 'POSCO홀딩스':['POSCO','홀딩스'],
 'LG에너지솔루션':['LG','에너지솔루션'],
 '삼성바이오로직스':['삼성','바이오로직스'],
 'SK하이닉스':['SK','하이닉스'],
 'DB하이텍':['DB','하이텍'],
 '한미반도체':['한미','반도체'],
 '현대모비스':['현대','모비스']
};
// V1_R041: abbreviated labels only on small valuation-sized tiles.
const SHORT_NAMES={
 'POSCO홀딩스':'POSCO','LG에너지솔루션':'LG엔솔','삼성바이오로직스':'삼성바이오',
 'SK하이닉스':'SK하이닉스','DB하이텍':'DB','한미반도체':'한미',
 '현대모비스':'모비스','현대차':'현대','기아':'기아','삼성전자':'삼성',
 'NAVER':'NAVER','카카오':'카카오','셀트리온':'셀트리온',
 'KB금융':'KB','신한지주':'신한','한국전력':'한전'
};
function stockNameNode(name){
 const label=el('span','tile-name');
 const full=el('span','name-full');
 const parts=NAME_PARTS[name]||[name];
 parts.forEach((part,i)=>{if(i)full.append(document.createElement('wbr'));full.append(el('span','name-part',part));});
 const short=el('span','name-short',SHORT_NAMES[name]||name);
 label.append(full,short);
 return label;
}
function tilePalette(change){
 const anchors=[[-4.5,'#123F98'],[-3,'#246CC5'],[-2,'#4B9ADD'],[-1,'#A4D3F2'],[0,'#8793A2'],[1,'#F6B4B7'],[2,'#F17A83'],[3,'#DF4356'],[4.5,'#A90E2B']];
 if(!Number.isFinite(change))return ['#788594','#FFFFFF'];
 const x=Math.max(-4.5,Math.min(4.5,change));
 let hex=anchors[anchors.length-1][1];
 if(x<=-4.5)hex=anchors[0][1];
 else for(let i=1;i<anchors.length;i++){if(x<=anchors[i][0]){
  const [p,from]=anchors[i-1],[q,to]=anchors[i],t=(x-p)/(q-p);
  const rgb=[0,1,2].map(j=>Math.round(parseInt(from.slice(1+j*2,3+j*2),16)*(1-t)+parseInt(to.slice(1+j*2,3+j*2),16)*t));
  hex='#'+rgb.map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase();break;
 }}
 const rgb=[1,3,5].map(j=>parseInt(hex.slice(j,j+2),16)/255).map(v=>v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4));
 const luminance=.2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];
 return [hex,luminance>.32?'#122B48':'#FFFFFF'];
}
function spark(points,dir=1){if(!Array.isArray(points)||points.length<2||!points.every(Number.isFinite))throw Error('미니차트 데이터 오류');const w=160,h=55,min=Math.min(...points),max=Math.max(...points),span=max-min||1;const coords=points.map((n,i)=>`${(i/(points.length-1)*w).toFixed(1)},${(h-5-(n-min)/span*(h-12)).toFixed(1)}`).join(' ');return `<svg class="spark ${dir>0?'rising':dir<0?'falling':'neutral'}" viewBox="0 0 ${w} ${h}" aria-hidden="true" preserveAspectRatio="none"><polyline points="${coords}" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;}
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}

function squarify(items,width,height){
 if(!items.length||width<=0||height<=0)return [];
 const valid=items.filter(s=>Number.isFinite(s.value)&&s.value>0).sort((a,b)=>b.value-a.value);
 const total=valid.reduce((n,s)=>n+s.value,0);if(!total)return [];
 const remaining=valid.map(s=>({...s,area:s.value/total*width*height}));
 const rects=[];let x=0,y=0,w=width,h=height,row=[];
 const worst=(list,side)=>{if(!list.length)return Infinity;const sum=list.reduce((n,a)=>n+a.area,0),small=Math.min(...list.map(a=>a.area)),large=Math.max(...list.map(a=>a.area));return Math.max(side*side*large/(sum*sum),(sum*sum)/(side*side*small));};
 function place(list){
  const sum=list.reduce((n,a)=>n+a.area,0);
  if(w>=h){const colW=sum/h;let yy=y;list.forEach((a,i)=>{const hh=i===list.length-1?y+h-yy:a.area/colW;rects.push({name:a.name,x,y:yy,w:colW,h:hh});yy+=hh;});x+=colW;w=Math.max(0,w-colW);}
  else{const rowH=sum/w;let xx=x;list.forEach((a,i)=>{const ww=i===list.length-1?x+w-xx:a.area/rowH;rects.push({name:a.name,x:xx,y,w:ww,h:rowH});xx+=ww;});y+=rowH;h=Math.max(0,h-rowH);}
 }
 while(remaining.length){const next=remaining[0],side=Math.min(w,h);if(!row.length||worst([...row,next],side)<=worst(row,side))row.push(remaining.shift());else{place(row);row=[];}}
 if(row.length)place(row);return rects;
}
// V1_R080: fixed-area, stock-count-aware, valuation-ranked 2D theme layout.
// All weights are display weights only; actual valuation/returns remain unchanged.
function layoutTreemap(){
 const root=document.getElementById('sector-grid');if(!root)return;
 const width=root.clientWidth,height=root.clientHeight;if(width<10||height<10)return;
 const groups=[...root.querySelectorAll('.theme-group')];
 const entries=groups.map(group=>{
  const tiles=[...group.querySelectorAll('.heat-tile')];
  const valuation=tiles.reduce((sum,t)=>sum+Math.max(0,Number(t.dataset.valuationArea)||0),0);
  return {group,tiles,valuation,name:group.dataset.theme};
 }).filter(e=>e.tiles.length&&e.valuation>0).sort((a,b)=>b.valuation-a.valuation);
 if(!entries.length)return;
 const stockCount=entries.reduce((n,e)=>n+e.tiles.length,0);
 // Compress differences as the number of stocks grows, keeping the ordering.
 const exponent=stockCount<=4?1:stockCount<=8?.75:stockCount<=12?.60:stockCount<=16?.45:.35;
 const stockWeight=tile=>Math.pow(Math.max(1,Number(tile.dataset.valuationArea)||0),exponent);
 const weighted=entries.map(e=>({...e,weight:e.tiles.reduce((n,t)=>n+stockWeight(t),0)}));
 // Ordered binary partition. A is top-left; lower ranked groups flow right/below.
 // Unlike fixed columns, partitions can be horizontal or vertical.
 function partition(items,x,y,w,h){
  if(!items.length)return [];
  if(items.length===1)return [{entry:items[0],x,y,w,h}];
  const total=items.reduce((n,e)=>n+e.weight,0);
  let best=1,diff=Infinity,acc=0;
  for(let i=1;i<items.length;i++){acc+=items[i-1].weight;const d=Math.abs(acc/total-.5);if(d<diff){diff=d;best=i;}}
  const first=items.slice(0,best),second=items.slice(best);
  const ratio=first.reduce((n,e)=>n+e.weight,0)/total;
  if(w>=h){const cut=w*ratio;return [...partition(first,x,y,cut,h),...partition(second,x+cut,y,w-cut,h)];}
  const cut=h*ratio;return [...partition(first,x,y,w,cut),...partition(second,x,y+cut,w,h-cut)];
 }
 // Try both orientations to avoid narrow sections; never change total heatmap size.
 const layouts=[partition(weighted,0,0,width,height)];
 function alternate(items,x,y,w,h,vertical){
  if(items.length===1)return [{entry:items[0],x,y,w,h}];
  const total=items.reduce((n,e)=>n+e.weight,0);
  let acc=0,best=1,diff=Infinity;
  for(let i=1;i<items.length;i++){acc+=items[i-1].weight;const d=Math.abs(acc/total-.5);if(d<diff){diff=d;best=i;}}
  const left=items.slice(0,best),right=items.slice(best),ratio=left.reduce((n,e)=>n+e.weight,0)/total;
  if(vertical){const cut=w*ratio;return [...alternate(left,x,y,cut,h,!vertical),...alternate(right,x+cut,y,w-cut,h,!vertical)];}
  const cut=h*ratio;return [...alternate(left,x,y,w,cut,!vertical),...alternate(right,x,y+cut,w,h-cut,!vertical)];
 }
 layouts.push(alternate(weighted,0,0,width,height,width>=height));
 layouts.push(alternate(weighted,0,0,width,height,width<height));
 const evaluate=layout=>layout.reduce((penalty,r)=>{
  const heading=Math.min(23,Math.max(14,r.h*.13)),availableH=Math.max(1,r.h-heading-3),availableW=Math.max(1,r.w-5);
  const tiles=squarify(r.entry.tiles.map(t=>({name:t.dataset.name,value:stockWeight(t)})),availableW,availableH);
  return penalty+tiles.reduce((n,t)=>{
   const shortfall=Math.max(0,56-t.h)/56+Math.max(0,72-t.w)/72;
   const ratio=Math.max(t.w/Math.max(1,t.h),t.h/Math.max(1,t.w));
   return n+shortfall*shortfall*10+Math.max(0,ratio-2.8)*.5;
  },0);
 },0);
 const layout=layouts.reduce((best,next)=>evaluate(next)<evaluate(best)?next:best);
 for(const rect of layout){
  const group=rect.entry.group;
  for(const [key,val] of Object.entries({left:rect.x,top:rect.y,width:Math.max(0,rect.w-3),height:Math.max(0,rect.h-3)}))group.style.setProperty(key,val+'px','important');
  const header=group.querySelector('.theme-heading'),tiles=group.querySelector('.theme-tiles');
  const headerHeight=Math.min(23,Math.max(14,rect.h*.13));header.style.height=headerHeight+'px';
  const innerWidth=Math.max(0,rect.w-5),innerHeight=Math.max(0,rect.h-3-headerHeight);
  const positions=squarify(rect.entry.tiles.map(t=>({name:t.dataset.name,value:stockWeight(t)})),innerWidth,innerHeight);
  for(const pos of positions){
   const tile=rect.entry.tiles.find(t=>t.dataset.name===pos.name);if(!tile)continue;
   for(const [key,val] of Object.entries({left:pos.x,top:pos.y,width:Math.max(0,pos.w-3),height:Math.max(0,pos.h-3)}))tile.style.setProperty(key,val+'px','important');
   tile.classList.toggle('tile-tiny',pos.w<83||pos.h<58);
   tile.classList.toggle('tile-micro',pos.w<52||pos.h<37);
  }
 }
}
// V1_R082: same-size briefing/detail panel, line-only chart behind text.
let selectedStockName=null;
let detailPeriod='1m';
let detailHistoryActive=false;
const DETAIL_PERIODS=[['day','당일'],['week','1주'],['1m','1개월'],['3m','3개월']];
function renderMockDetailChart(stock,period){
 const wrap=el('div','stock-detail-backchart');
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
 svg.setAttribute('viewBox','0 0 340 160');svg.setAttribute('preserveAspectRatio','none');svg.setAttribute('aria-hidden','true');
 // Deterministic illustration only: never present as actual OHLC/history.
 const seed=[...stock.name].reduce((n,ch)=>n+ch.charCodeAt(0),0);
 const drift=stock.change<0?1:-1;
 const points=Array.from({length:24},(_,i)=>{
  const wave=Math.sin(i*(period==='day'?1.5:period==='week'?.95:period==='1m'?.68:.4)+seed)*8;
  const noise=Math.cos(i*1.9+seed*.2)*4;
  const y=111+drift*i*1.35+wave+noise;
  return (i*340/23).toFixed(1)+','+Math.max(25,Math.min(145,y)).toFixed(1);
 }).join(' ');
 const poly=document.createElementNS('http://www.w3.org/2000/svg','polyline');
 poly.setAttribute('points',points);poly.setAttribute('fill','none');
 poly.setAttribute('stroke',stock.change<0?'#246CC5':stock.change>0?'#DF4356':'#8793A2');
 poly.setAttribute('stroke-width','2.2');poly.setAttribute('stroke-opacity','.38');
 poly.setAttribute('stroke-linecap','round');poly.setAttribute('stroke-linejoin','round');
 svg.append(poly);wrap.append(svg);return wrap;
}
function showStockDetail(name,fromHistory=false){
 const stock=heatmapStocks.find(s=>s.name===name),panel=document.getElementById('stock-detail'),summary=document.getElementById('briefing-default');
 if(!stock||!panel||!summary)return;
 if(!fromHistory&&!detailHistoryActive){
  history.pushState({pwaStockDetail:true},'',location.href);
  detailHistoryActive=true;
 }
 selectedStockName=name;
 const rate=stock.invested?stock.profit/stock.invested*100:null;
 const theme=SECTORS.find(t=>t.stocks.includes(name))?.name||'기타';
 const daily=stock.change;
 const sign=stock.profit>0?'gain':stock.profit<0?'loss':'flat';
 const daySign=daily>0?'gain':daily<0?'loss':'flat';
 const total=heatmapStocks.reduce((n,s)=>n+s.value,0);
 panel.replaceChildren();
 panel.append(renderMockDetailChart(stock,detailPeriod));
 const content=el('div','stock-detail-content');
 const head=el('div','stock-detail-head');
 const back=el('button','stock-detail-back','←');back.type='button';back.setAttribute('aria-label','시장 브리핑으로 돌아가기');back.addEventListener('click',()=>hideStockDetail());
 head.append(back,el('strong','stock-detail-name',stock.name),el('span','stock-detail-market',theme),el('span','stock-detail-mock','모의'));
 const price=el('div','stock-detail-price');
 price.append(el('strong','',won(stock.price)),el('span','stock-detail-rate '+daySign,percent(daily)));
 const metrics=el('div','stock-detail-metrics');
 for(const [label,value,cls] of [['보유수량',stock.qty.toLocaleString('ko-KR')+'주',''],['평가금액',won(stock.value),''],['평가손익',(stock.profit>=0?'+':'')+won(stock.profit),sign],['수익률',percent(rate),sign],['보유비중',total?(stock.value/total*100).toFixed(1)+'%':'—','']]){
  const cell=el('div','stock-detail-metric');cell.append(el('span','',label),el('strong',cls,value));metrics.append(cell);
 }
 const periods=el('div','stock-detail-periods');
 for(const [key,label] of DETAIL_PERIODS){
  const btn=el('button','stock-detail-period'+(key===detailPeriod?' active':''),label);
  btn.type='button';btn.setAttribute('aria-pressed',String(key===detailPeriod));
  btn.addEventListener('click',()=>{detailPeriod=key;showStockDetail(name,true);});
  periods.append(btn);
 }
 content.append(head,price,metrics,periods);
 panel.append(content,el('span','stock-detail-chart-label','모의 추이 · 실제 가격 이력 아님'));
 summary.hidden=true;panel.hidden=false;document.getElementById('briefing-panel')?.classList.add('show-stock-detail');
 document.querySelectorAll('#sector-grid .heat-tile').forEach(t=>t.classList.toggle('selected-stock',t.dataset.name===name));
}
function hideStockDetail(fromHistory=false){
 if(!fromHistory&&detailHistoryActive){history.back();return;}
 detailHistoryActive=false;selectedStockName=null;
 const summary=document.getElementById('briefing-default'),panel=document.getElementById('stock-detail');
 if(summary)summary.hidden=false;if(panel)panel.hidden=true;
 document.getElementById('briefing-panel')?.classList.remove('show-stock-detail');
 document.querySelectorAll('#sector-grid .heat-tile').forEach(t=>t.classList.remove('selected-stock'));
}
// V1_R084: explicit same-document hash entry for Galaxy installed PWA back.
const HOME_GUARD_HASH='#pwa-home';
let homeExitDeadline=0;
let homeExitTimer=null;
let homeExitToast=null;
let allowHomeExit=false;
function showHomeExitHint(){
 if(!homeExitToast){
  homeExitToast=el('div','pwa-exit-toast');
  homeExitToast.setAttribute('role','status');
  homeExitToast.setAttribute('aria-live','polite');
  document.body.append(homeExitToast);
 }
 homeExitToast.textContent='종료하려면 2초 안에 뒤로가기를 한 번 더 누르세요';
 homeExitToast.classList.add('visible');
 clearTimeout(homeExitTimer);
 homeExitTimer=setTimeout(()=>homeExitToast?.classList.remove('visible'),2000);
}
function armHomeBackGuard(){
 if(location.hash===HOME_GUARD_HASH){
  // A bookmarked/reloaded hash alone is not a real guard history entry.
  history.replaceState({},'',location.pathname+location.search);
 }
 history.pushState({pwaHomeGuardV1:true},'',location.pathname+location.search+HOME_GUARD_HASH);
}
function onPwaBack(){
 if(selectedStockName){
  hideStockDetail(true);
  // If the stock entry was removed, home hash remains available for the next back.
  return;
 }
 if(allowHomeExit)return;
 if(Date.now()<homeExitDeadline){
  allowHomeExit=true;
  homeExitDeadline=0;
  homeExitToast?.classList.remove('visible');
  // The browser is already at the original entry after popping the hash guard.
  // Do not call history.go(-1): it can skip the intended home transition.
  return;
 }
 homeExitDeadline=Date.now()+2000;
 showHomeExitHint();
 armHomeBackGuard();
}
window.addEventListener('popstate',onPwaBack);
// A fragment entry is more visible to Android Chrome navigation than same-URL state.
armHomeBackGuard();
// V1_R073: switch heatmap values without changing evaluation-weighted tile layout.
let heatmapMode='daily';
let heatmapStocks=[];
function stockHeatValue(s){return heatmapMode==='daily'?s.change:(s.invested>0?s.profit/s.invested*100:null);}
function updateHeatmapMode(mode){
 if(mode!=='daily'&&mode!=='return')return;
 heatmapMode=mode;
 const root=document.getElementById('sector-grid');if(!root)return;
 const title=mode==='daily'?'등락률':'수익률';
 const label=document.getElementById('heatmap-mode');
 if(label){
  label.textContent=title;
  label.setAttribute('aria-label',title+' 표시 중. 누르면 다른 모드로 전환');
  label.classList.remove('mode-flash');void label.offsetWidth;label.classList.add('mode-flash');
 }
 const help=document.getElementById('legend-help'),popup=document.getElementById('legend-popup');
 if(help)help.setAttribute('aria-label',title+' 색상 범례 보기');
 if(popup)popup.setAttribute('aria-label',title+' 색상 안내');
 const heading=popup?.querySelector('.legend-popup-head strong');
 if(heading)heading.textContent=title+' 색상 안내';
 const scale=popup?.querySelector('.scale-legend');
 if(scale)scale.setAttribute('aria-label','9단계 '+title+' 색상표');
 const total=heatmapStocks.reduce((sum,s)=>sum+s.value,0);
 for(const tile of root.querySelectorAll('.heat-tile')){
  const stock=heatmapStocks.find(s=>s.name===tile.dataset.name);if(!stock)continue;
  const value=stockHeatValue(stock),[bg,fg]=tilePalette(value);
  tile.classList.remove('heat-mode-pulse');
  tile.style.background=bg;tile.style.color=fg;
  void tile.offsetWidth;tile.classList.add('heat-mode-pulse');
  tile.classList.toggle('tile-up',value>0);tile.classList.toggle('tile-down',value<0);
  tile.classList.toggle('tile-flat',value===0||value===null);
  const number=tile.querySelector('.tile-change');if(number)number.textContent=percent(value);
  tile.title=`${stock.name} · ${title} ${percent(value)} · 평가비중 ${total?(stock.value/total*100).toFixed(1):'0.0'}%`;
 }
}
function setupHeatmapSwipe(){
 const toggle=document.getElementById('heatmap-mode');
 if(toggle)toggle.addEventListener('click',()=>updateHeatmapMode(heatmapMode==='daily'?'return':'daily'));
 const root=document.getElementById('sector-grid');if(!root)return;
 // V1_R079: recognize a deliberate horizontal gesture while moving, before
 // Android Chrome can cancel touchend. Both directions toggle either mode.
 let start=null;
 function toggleOnce(x,y){
  if(!start||start.done)return;
  const dx=x-start.x,dy=y-start.y;
  if(Math.abs(dy)>28&&Math.abs(dy)>Math.abs(dx)){start=null;return;}
  if(Math.abs(dx)>=45&&Math.abs(dx)>Math.abs(dy)*1.35){
   start.done=true;
   updateHeatmapMode(heatmapMode==='daily'?'return':'daily');
  }
 }
 root.addEventListener('touchstart',e=>{
  start=e.touches.length===1?{x:e.touches[0].clientX,y:e.touches[0].clientY,done:false}:null;
 },{passive:true});
 root.addEventListener('touchmove',e=>{
  if(e.touches.length!==1){start=null;return;}
  toggleOnce(e.touches[0].clientX,e.touches[0].clientY);
 },{passive:true});
 root.addEventListener('touchend',e=>{
  if(e.changedTouches.length===1)toggleOnce(e.changedTouches[0].clientX,e.changedTouches[0].clientY);
  start=null;
 },{passive:true});
 root.addEventListener('touchcancel',()=>{start=null;},{passive:true});
}
function render(data){
 const r=calculate(data),byId=id=>document.getElementById(id);
  heatmapStocks=r.stocks;
 byId('invested').textContent=won(r.invested);byId('cash').textContent=won(r.cash);byId('valuation').textContent=won(r.valuation);
 byId('profit').textContent=(r.profit>=0?'+':'')+won(r.profit);byId('return').textContent=percent(r.rate);
 // V1_R042: DEV-only fixed negative day comparison to exercise independent card palettes.
 const day=-42819,dayRate=-0.64;
 byId('dayrate').textContent=percent(dayRate);
 byId('dayprofit').textContent=won(day);
 const valuationCard=document.querySelector('.asset-card.valuation');
 valuationCard.classList.toggle('gain',r.profit>0);
 valuationCard.classList.toggle('loss',r.profit<0);
 valuationCard.classList.toggle('flat',r.profit===0);
 const dayCard=byId('dayrate').closest('.day-card');
 dayCard.classList.toggle('gain',day>0);
 dayCard.classList.toggle('loss',day<0);
 dayCard.classList.toggle('flat',day===0);
 const idx=byId('indices');idx.replaceChildren();
 for(const item of selectedIndices){idx.append(createIndexCard(item));}
 const addCard=el('button','index-card index-add');addCard.type='button';addCard.setAttribute('aria-label','모의 시장지수 추가');addCard.append(el('span','index-add-plus','+'),el('span','index-add-label','지수 추가'));addCard.addEventListener('click',()=>{const item=EXTRA_INDICES.find(x=>!selectedIndices.some(y=>y.name===x.name));if(!item){addCard.querySelector('.index-add-label').textContent='추가 완료';addCard.disabled=true;return;}selectedIndices.push(item);idx.insertBefore(createIndexCard(item),addCard);updateIndexPagination();idx.scrollTo({left:idx.scrollWidth,behavior:'smooth'});});idx.append(addCard);
 requestAnimationFrame(updateIndexPagination);
 const root=byId('sector-grid');root.replaceChildren();
 for(const theme of SECTORS){
  const members=theme.stocks.map(name=>r.stocks.find(s=>s.name===name)).filter(s=>s&&s.value>0);
  if(!members.length)continue;
  const group=el('section','theme-group');group.dataset.theme=theme.name;group.dataset.valuationArea=String(members.reduce((sum,s)=>sum+s.value,0));
  group.append(el('h2','theme-heading',theme.name));
  const tiles=el('div','theme-tiles');
  for(const s of members){
   const tile=el('article','heat-tile '+(s.change>0?'tile-up':s.change<0?'tile-down':'tile-flat'));
   const [bg,fg]=tilePalette(s.change),weight=r.valuation?s.value/r.valuation:0;
   tile.style.background=bg;tile.style.color=fg;tile.dataset.name=s.name;tile.dataset.valuationArea=String(s.value);
   tile.title=`${s.name} · ${theme.name} · ${percent(s.change)} · 평가비중 ${(weight*100).toFixed(1)}%`;
   tile.setAttribute('role','button');tile.setAttribute('tabindex','0');tile.setAttribute('aria-label',s.name+' 상세 정보 보기');tile.addEventListener('click',()=>showStockDetail(s.name));tile.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();showStockDetail(s.name);}});
   const caption=el('div','tile-caption');caption.append(stockNameNode(s.name),el('strong','tile-change',percent(s.change)));tile.append(caption);
   tiles.append(tile);
  }
  group.append(tiles);root.append(group);
 }
 updateHeatmapMode(heatmapMode);
 if(selectedStockName)showStockDetail(selectedStockName);
  // V1_R060: removed the two auxiliary rows below the heatmap.
 requestAnimationFrame(layoutTreemap);
}
if(typeof document!=='undefined'){try{render(MOCK);setupHeatmapSwipe();document.getElementById('indices').addEventListener('scroll',updateIndexPagination,{passive:true});window.addEventListener('resize',updateIndexPagination,{passive:true});window.addEventListener('resize',()=>requestAnimationFrame(layoutTreemap),{passive:true});if(typeof ResizeObserver!=='undefined'){const observer=new ResizeObserver(()=>requestAnimationFrame(layoutTreemap));observer.observe(document.getElementById('sector-grid'));}}catch(e){console.error('표시 오류:',e);}}
if(typeof module!=='undefined')module.exports={MOCK,validate,calculate,percent,spark,INDICES,SECTORS,squarify};
