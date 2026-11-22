// TEST-only browser adapter. Public GitHub Pages uses a fixed snapshot fixture; local runs may use read-only SQLite HTTP.
'use strict';
(async function(){
  const notice=document.getElementById('notice');
  try {
    const response=await fetch('./api/mock/portfolio',{method:'GET',cache:'no-store',credentials:'omit'});
    if(!response.ok) throw new Error(`모의 데이터 읽기 실패 (${response.status})`);
    const data=await response.json();
    if(!data || !['DEV','TEST'].includes(data.environment)) throw new Error('모의 환경 표식 오류');
    if(!['GITHUB_PAGES_STATIC_TEST_FIXTURE','LOCAL_SQLITE_READ_ONLY'].includes(data.source)) throw new Error('모의 데이터 출처 표식 오류');
    if(typeof render!=='function') throw new Error('R008 렌더 함수 연결 실패');
    render(data);
    document.documentElement.dataset.mockEnvironment=data.environment;
    document.documentElement.dataset.mockIntegration='PASS';
    const publicSnapshot=data.source==='GITHUB_PAGES_STATIC_TEST_FIXTURE';
    if(publicSnapshot && data.environment!=='TEST') throw new Error('공개 고정 스냅샷은 TEST 환경만 허용됩니다');
    document.documentElement.dataset.mockSource=publicSnapshot?'STATIC_TEST_SNAPSHOT':'LOCAL_SQLITE_READ_ONLY';
    notice.textContent=publicSnapshot
      ? 'TEST 공개 고정 모의 스냅샷 표시 · SQLite/Oracle/키움 실시간 연결 아님'
      : `${data.environment} 로컬 SQLite 모의 DB · 읽기 전용 · Oracle/키움 미연결`;
    window.__pwaMockIntegration={status:'PASS',environment:data.environment,source:publicSnapshot?'STATIC_TEST_SNAPSHOT':'LOCAL_SQLITE_READ_ONLY'};
  } catch(error) {
    document.documentElement.dataset.mockIntegration='HOLD';
    notice.textContent=`DEV/TEST 모의 데이터 연결 HOLD: ${error.message}`;
    window.__pwaMockIntegration={status:'HOLD',error:error.message};
  }
})();
