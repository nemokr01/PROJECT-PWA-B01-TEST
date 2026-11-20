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
const SECTORS=[{name:'반도체',stocks:['삼성전자','SK하이닉스','한미반도체','DB하이텍']},{name:'자동차·배터리',stocks:['현대차','기아','현대모비스','LG에너지솔루션']},{name:'IT·바이오·기타',stocks:['NAVER','카카오','삼성바이오로직스','셀트리온','POSCO홀딩스','KB금융','신한지주','한국전력']}];
const UNOWNED_EXAMPLES=['한전기술','두산에너빌리티'];
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
 const rects=[];if(!items.length||width<=0||height<=0)return rects;
 const total=items.reduce((n,s)=>n+s.value,0);if(total<=0)return rects;
 const sorted=[...items].sort((a,b)=>b.value-a.value);
 let remaining=sorted.map(s=>({...s,area:s.value/total*width*height}));
 let x=0,y=0,w=width,h=height;
 const worst=(row,side)=>{const sum=row.reduce((n,a)=>n+a.area,0),min=Math.min(...row.map(a=>a.area)),max=Math.max(...row.map(a=>a.area));return Math.max(side*side*max/(sum*sum),(sum*sum)/(side*side*min));};
 function place(row){const sum=row.reduce((n,a)=>n+a.area,0);if(w>=h){const rowW=sum/h;let yy=y;row.forEach((a,i)=>{const hh=i===row.length-1?y+h-yy:a.area/rowW;rects.push({name:a.name,x,y:yy,w:rowW,h:hh});yy+=hh;});x+=rowW;w=Math.max(0,w-rowW);}else{const rowH=sum/w;let xx=x;row.forEach((a,i)=>{const ww=i===row.length-1?x+w-xx:a.area/rowH;rects.push({name:a.name,x:xx,y,w:ww,h:rowH});xx+=ww;});y+=rowH;h=Math.max(0,h-rowH);}}
 let row=[];while(remaining.length){const next=remaining[0],side=Math.min(w,h);if(!row.length||worst([...row,next],side)<=worst(row,side)){row.push(remaining.shift());}else{place(row);row=[];}}
 if(row.length)place(row);return rects;
}
function layoutTreemap(){
 const root=document.getElementById('sector-grid');if(!root)return;
 for(const sector of root.querySelectorAll('.sector')){
  const tiles=sector.querySelector('.squarified-tiles');if(!tiles)continue;
  const width=tiles.clientWidth,height=tiles.clientHeight;if(width<10||height<10)continue;
  const nodes=[...tiles.children],data=nodes.map(tile=>({name:tile.dataset.name,value:Number(tile.dataset.valuationArea)}));
  const positions=squarify(data,width,height);
  for(const pos of positions){const tile=nodes.find(el=>el.dataset.name===pos.name);if(!tile)continue;
   tile.style.setProperty('left',pos.x+'px','important');tile.style.setProperty('top',pos.y+'px','important');tile.style.setProperty('width',Math.max(0,pos.w-3)+'px','important');tile.style.setProperty('height',Math.max(0,pos.h-3)+'px','important');
   tile.classList.toggle('tile-tiny',pos.w<75||pos.h<55);tile.classList.toggle('tile-micro',pos.w<47||pos.h<35);
  }
 }
}
function render(data){
 const r=calculate(data),byId=id=>document.getElementById(id);
 byId('invested').textContent=won(r.invested);byId('cash').textContent=won(r.cash);byId('valuation').textContent=won(r.valuation);
 byId('profit').textContent=(r.profit>=0?'+':'')+won(r.profit);byId('return').textContent=percent(r.rate);
 const previous=r.stocks.reduce((sum,s)=>sum+(s.value/(1+s.change/100)),0);
 const day=r.valuation-previous;byId('dayrate').textContent=percent(previous?day/previous*100:0);byId('dayprofit').textContent=(day>=0?'+':'')+won(Math.round(day));
 const idx=byId('indices');idx.replaceChildren();
 for(const item of INDICES){const card=el('article','index-card');card.append(el('span','index-name',item.name),el('strong','index-value',item.value),el('small','index-change',item.change));const chart=el('div','index-spark');chart.innerHTML=spark(item.points,item.dir);card.append(chart);idx.append(card);}
 const root=byId('sector-grid');root.replaceChildren();
 for(const group of SECTORS){
  const sector=el('section','sector');sector.append(el('h2','sector-heading',group.name+' ›'));
  const tiles=el('div','sector-tiles squarified-tiles');
  for(const name of group.stocks){
   const s=r.stocks.find(x=>x.name===name);if(!s||s.value<=0)continue;
   const tile=el('article','heat-tile '+(s.change>0?'tile-up':s.change<0?'tile-down':'tile-flat'));
   const [bg,fg]=tilePalette(s.change),weight=r.valuation?s.value/r.valuation:0;
   tile.style.background=bg;tile.style.color=fg;tile.dataset.name=s.name;tile.dataset.valuationArea=String(s.value);
   tile.title=`${s.name} · ${percent(s.change)} · 평가비중 ${(weight*100).toFixed(1)}%`;
   tile.append(el('span','tile-icon','◈'),el('span','tile-name',s.name),el('strong','tile-change',percent(s.change)),el('small','tile-weight',`평가비중 ${(weight*100).toFixed(1)}%`));
   const chart=el('div','tile-spark');chart.innerHTML=spark([13,22,20,37,32,44,42,59,54,65],s.change);tile.append(chart);tiles.append(tile);
  }
  sector.append(tiles);root.append(sector);
 }
 const demo=byId('unowned-examples');demo.replaceChildren();demo.append(el('strong','example-label','미보유 예시 · 히트맵 제외'));for(const name of UNOWNED_EXAMPLES)demo.append(el('span','example-name',name));
 byId('notice').textContent='보유 평가금액 비례 · 9단계 등락률 색상';
 requestAnimationFrame(layoutTreemap);
}
if(typeof document!=='undefined'){try{render(MOCK);window.addEventListener('resize',()=>requestAnimationFrame(layoutTreemap),{passive:true});if(typeof ResizeObserver!=='undefined'){const observer=new ResizeObserver(()=>requestAnimationFrame(layoutTreemap));observer.observe(document.getElementById('sector-grid'));}}catch(e){document.getElementById('notice').textContent='표시 오류: '+e.message;}}
if(typeof module!=='undefined')module.exports={MOCK,validate,calculate,percent,spark,INDICES,SECTORS,squarify};
