'use strict';
const money = value => new Intl.NumberFormat('ko-KR',{style:'currency',currency:'KRW',maximumFractionDigits:0}).format(value);
const pct = value => `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
function validate(data){
  if(data?.environment!=='TEST'||data?.source!=='STATIC_TEST_FIXTURE'||!Number.isFinite(data.cash)||data.cash<0||!Array.isArray(data.stocks)) throw Error('TEST 모의 데이터 형식이 맞지 않습니다.');
  const seen=new Set();
  for(const stock of data.stocks){
    if(!stock.name||seen.has(stock.name)||!stock.sector||![stock.buyPrice,stock.price,stock.quantity,stock.changePct].every(Number.isFinite)||stock.buyPrice<0||stock.price<0||stock.quantity<0||!Number.isInteger(stock.quantity)) throw Error('종목 모의 데이터 검증에 실패했습니다.');
    seen.add(stock.name);
  }
  return data;
}
function show(data){
  const stocks=data.stocks.map(s=>({...s,invested:s.buyPrice*s.quantity,value:s.price*s.quantity}));
  const invested=stocks.reduce((sum,s)=>sum+s.invested,0),valuation=stocks.reduce((sum,s)=>sum+s.value,0),profit=valuation-invested,rate=invested?profit/invested*100:NaN;
  document.querySelector('#invested').textContent=money(invested);
  document.querySelector('#cash').textContent=money(data.cash);
  document.querySelector('#valuation').textContent=money(valuation);
  document.querySelector('#profit').textContent=`${profit>=0?'+':''}${money(profit)}`;
  document.querySelector('#return').textContent=Number.isFinite(rate)?pct(rate):'—';
  for(const id of ['profit','return']) document.querySelector(`#${id}`).className=profit>0?'positive':profit<0?'negative':'';
  const sections=new Map();
  for(const stock of stocks){if(!sections.has(stock.sector))sections.set(stock.sector,[]);sections.get(stock.sector).push(stock);}
  const root=document.querySelector('#sector-list');
  for(const [name,items] of sections){
    const section=document.createElement('section');section.className='sector';
    const heading=document.createElement('h2');heading.textContent=name;section.append(heading);
    const tiles=document.createElement('div');tiles.className='tiles';
    for(const stock of items){
      const tile=document.createElement('article');tile.className=`tile ${stock.changePct>0?'up':stock.changePct<0?'down':'flat'}`;
      const weight=valuation?stock.value/valuation*100:0;tile.style.setProperty('--weight',String(weight));
      const label=document.createElement('span');label.className='tile-name';label.textContent=stock.name;
      const change=document.createElement('strong');change.className='tile-change';change.textContent=pct(stock.changePct);
      const share=document.createElement('small');share.className='tile-weight';share.textContent=`평가비중 ${weight.toFixed(1)}%`;
      tile.append(label,change,share);tiles.append(tile);
    }
    section.append(tiles);root.append(section);
  }
  document.querySelector('#load-status').textContent='모의 JSON 로드 및 계산 완료';
}
async function start(){
  try{const response=await fetch('./mock-data.json',{cache:'no-store',credentials:'omit'});if(!response.ok)throw Error(`모의 데이터 요청 실패 (${response.status})`);show(validate(await response.json()));}
  catch(error){document.querySelector('#load-status').textContent=`표시 HOLD: ${error.message}`;}
}
start();
if('serviceWorker'in navigator&&location.protocol==='https:') window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
