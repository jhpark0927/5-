/**
 * Generates a self-contained, standalone single HTML file string
 * containing HTML5, Tailwind CSS via CDN, vanilla JavaScript ES6+, LocalStorage,
 * Box-Muller Monte Carlo simulation (N=3,000), Part A reverse calculation,
 * Part B real-time probability gauge, and JSON context logging.
 */
export function generateStandaloneHtml(): string {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>5분만 - 지각 방지 및 외출 역산 시뮬레이터</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Pretendard Font -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
  <style>
    body { font-family: "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; }
  </style>
</head>
<body class="bg-slate-100 text-slate-900 min-h-screen py-6 px-4">
  <div class="max-w-[480px] mx-auto space-y-4">
    
    <!-- Header -->
    <header class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm text-center">
      <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 font-bold text-xs border border-rose-100 mb-2">
        <span>⏰</span> 지각 방지 & 외출 역산기
      </div>
      <h1 class="text-2xl font-black text-slate-900 tracking-tight">5분만</h1>
      <p class="text-xs text-slate-500 mt-1">
        "5분만 더 잘까?" 하는 순간의 비극을 방지하는 몬테카를로 역산 시뮬레이터
      </p>
    </header>

    <!-- 1. 기본 프로필 설정 영역 (아코디언) -->
    <section class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <button type="button" id="btn-toggle-profile" class="w-full px-5 py-4 flex items-center justify-between bg-slate-50/70 hover:bg-slate-100/70 transition-colors text-left">
        <div>
          <h2 class="text-sm font-bold text-slate-900">1. 초기 프로필 설정 (준비 시간)</h2>
          <p class="text-xs text-slate-500 mt-0.5" id="profile-summary-text">기본 준비 시간 계산 중...</p>
        </div>
        <span id="profile-accordion-icon" class="text-slate-400 font-bold text-sm">▼</span>
      </button>

      <div id="profile-body" class="p-5 space-y-3.5 border-t border-slate-100">
        <!-- 씻는 시간 -->
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div class="text-xs font-bold text-slate-800">🚿 씻는 시간</div>
            <div class="text-[11px] text-slate-400">샤워 및 머리 말리기</div>
          </div>
          <div class="flex items-center gap-2">
            <select id="select-shower" class="text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg">
              <option value="10">빠름 (10분)</option>
              <option value="20" selected>보통 (20분)</option>
              <option value="35">느림 (35분)</option>
            </select>
            <input type="number" id="input-shower" min="1" max="180" class="hidden w-16 text-xs px-2 py-1 bg-white border border-slate-300 rounded-lg text-center" value="20">
            <button type="button" id="toggle-shower-custom" class="text-[11px] px-2 py-1 border border-slate-300 rounded-lg bg-white text-slate-600">직접 입력</button>
          </div>
        </div>

        <!-- 옷 입는 시간 -->
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div class="text-xs font-bold text-slate-800">👕 옷 입는 시간</div>
            <div class="text-[11px] text-slate-400">착용 및 매무새</div>
          </div>
          <div class="flex items-center gap-2">
            <select id="select-dress" class="text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg">
              <option value="5">빠름 (5분)</option>
              <option value="15" selected>보통 (15분)</option>
              <option value="25">느림 (25분)</option>
            </select>
            <input type="number" id="input-dress" min="1" max="180" class="hidden w-16 text-xs px-2 py-1 bg-white border border-slate-300 rounded-lg text-center" value="15">
            <button type="button" id="toggle-dress-custom" class="text-[11px] px-2 py-1 border border-slate-300 rounded-lg bg-white text-slate-600">직접 입력</button>
          </div>
        </div>

        <!-- 식사 시간 -->
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div class="text-xs font-bold text-slate-800">🍚 식사 시간</div>
            <div class="text-[11px] text-slate-400">식사 및 정리</div>
          </div>
          <div class="flex items-center gap-2">
            <select id="select-meal" class="text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg">
              <option value="10">빠름 (10분)</option>
              <option value="25" selected>보통 (25분)</option>
              <option value="45">느림 (45분)</option>
            </select>
            <input type="number" id="input-meal" min="1" max="180" class="hidden w-16 text-xs px-2 py-1 bg-white border border-slate-300 rounded-lg text-center" value="25">
            <button type="button" id="toggle-meal-custom" class="text-[11px] px-2 py-1 border border-slate-300 rounded-lg bg-white text-slate-600">직접 입력</button>
          </div>
        </div>

        <!-- 기본 도보 시간 -->
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div class="text-xs font-bold text-slate-800">🚶 기본 도보 속도</div>
            <div class="text-[11px] text-slate-400">집-역 + 역-목적지 총 도보</div>
          </div>
          <div class="flex items-center gap-2">
            <select id="select-walk" class="text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg">
              <option value="10">빠름 (10분)</option>
              <option value="15" selected>보통 (15분)</option>
              <option value="25">느림 (25분)</option>
            </select>
            <input type="number" id="input-walk" min="1" max="180" class="hidden w-16 text-xs px-2 py-1 bg-white border border-slate-300 rounded-lg text-center" value="15">
            <button type="button" id="toggle-walk-custom" class="text-[11px] px-2 py-1 border border-slate-300 rounded-lg bg-white text-slate-600">직접 입력</button>
          </div>
        </div>
      </div>
    </section>

    <!-- 2. 약속 정보 입력 폼 -->
    <section class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
      <h2 class="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">2. 약속 정보 입력</h2>

      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">약속 장소</label>
        <input type="text" id="appointment-location" placeholder="예: 강남역 11번 출구" class="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500" value="강남역">
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">약속 일시 (Date & Time)</label>
        <input type="datetime-local" id="appointment-datetime" class="w-full text-xs font-medium px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500">
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">약속 종류</label>
          <select id="appointment-type" class="w-full text-xs px-2.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 font-semibold">
            <option value="interview">면접 (허용오차 1%)</option>
            <option value="class" selected>수업/업무 (허용오차 5%)</option>
            <option value="friend">친구약속 (허용오차 15%)</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">대중교통 예상 (분)</label>
          <input type="number" id="transit-time" min="1" max="300" value="30" class="w-full text-xs font-semibold px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500">
        </div>
      </div>

      <!-- 오늘(당일)의 예상 변수 -->
      <div class="space-y-2 pt-1">
        <span class="block text-xs font-semibold text-slate-700">오늘(당일)의 예상 변수 (중복 가능)</span>
        <div class="space-y-1.5 text-xs text-slate-800">
          <label class="flex items-center gap-2 p-2 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
            <input type="checkbox" id="var-rain" class="w-4 h-4 rounded text-rose-600">
            <span>🌧️ 비 (도보시간 +10%, 대기시간 +3분)</span>
          </label>
          <label class="flex items-center gap-2 p-2 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
            <input type="checkbox" id="var-snow" class="w-4 h-4 rounded text-rose-600">
            <span>❄️ 눈/빙판 (도보시간 +30%, 대기시간 +8분)</span>
          </label>
          <label class="flex items-center gap-2 p-2 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
            <input type="checkbox" id="var-event" class="w-4 h-4 rounded text-rose-600">
            <span>🎪 행사/혼잡 (대기시간 +5분, 시간 편차 1.5배)</span>
          </label>
          <label class="flex items-center gap-2 p-2 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
            <input type="checkbox" id="var-rush" class="w-4 h-4 rounded text-rose-600">
            <span>🚇 출퇴근 시간대 (대기시간 +3분)</span>
          </label>
          <label class="flex items-center gap-2 p-2 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
            <input type="checkbox" id="var-luggage" class="w-4 h-4 rounded text-rose-600">
            <span>🎒 짐 많음 (도보시간 5% 증가)</span>
          </label>
        </div>
      </div>

      <!-- 시뮬레이션 버튼 -->
      <button type="button" id="btn-run-simulation" class="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 text-white font-bold text-sm shadow-md hover:opacity-95 transition-all">
        🚀 시뮬레이션 돌리기 (N=3,000)
      </button>
    </section>

    <!-- 3. 결과 연출 영역 -->
    <section id="results-area" class="hidden space-y-4">
      <!-- 팩폭 브리핑 -->
      <div id="verdict-banner" class="p-4 rounded-2xl border"></div>

      <!-- 파트 A: 역산기 카드 -->
      <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
        <h3 class="text-sm font-bold text-slate-900 flex items-center justify-between">
          <span>파트 A: 정시 도착을 위한 팩폭 역산기</span>
          <span class="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded">상위 90% 안전선</span>
        </h3>
        
        <div class="p-3.5 rounded-xl bg-indigo-50 border border-indigo-100">
          <div class="text-xs font-semibold text-indigo-900">🚿 지금 당장 씻기 시작해야 할 시각</div>
          <div id="part-a-prep-time" class="text-xl font-black text-indigo-950 mt-1">--</div>
          <div id="part-a-prep-desc" class="text-[11px] text-indigo-700 mt-0.5"></div>
        </div>

        <div class="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100">
          <div class="text-xs font-semibold text-emerald-900">🏠 집에서 늦어도 출발해야 할 시각</div>
          <div id="part-a-depart-time" class="text-xl font-black text-emerald-950 mt-1">--</div>
          <div id="part-a-depart-desc" class="text-[11px] text-emerald-700 mt-0.5"></div>
        </div>
      </div>

      <!-- 파트 B: 실시간 지각 게이지 -->
      <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
        <h3 class="text-sm font-bold text-slate-900">파트 B: 지금 당장 준비를 시작한다면?</h3>
        
        <div class="space-y-3">
          <div>
            <div class="flex justify-between text-xs font-bold mb-1">
              <span>🏃 지금 당장 출발 시</span>
              <span id="prob-now-text">0%</span>
            </div>
            <div class="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div id="prob-now-bar" class="h-full bg-rose-500 rounded-full" style="width: 0%"></div>
            </div>
          </div>

          <div>
            <div class="flex justify-between text-xs font-bold mb-1">
              <span>🛌 5분 뒤 일어날 경우</span>
              <span id="prob-5min-text">0%</span>
            </div>
            <div class="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div id="prob-5min-bar" class="h-full bg-rose-500 rounded-full" style="width: 0%"></div>
            </div>
          </div>

          <div>
            <div class="flex justify-between text-xs font-bold mb-1">
              <span>📱 10분 뒤 일어날 경우</span>
              <span id="prob-10min-text">0%</span>
            </div>
            <div class="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div id="prob-10min-bar" class="h-full bg-rose-500 rounded-full" style="width: 0%"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. 데이터 로깅 박스 -->
      <div class="bg-slate-900 text-slate-200 p-4 rounded-2xl text-xs space-y-2">
        <div class="font-bold flex justify-between items-center text-slate-300">
          <span>통합 Context Data (console.log 완료)</span>
          <button type="button" id="btn-copy-raw-json" class="px-2 py-0.5 bg-slate-800 rounded text-[11px] border border-slate-700">JSON 복사</button>
        </div>
        <pre id="json-display" class="font-mono text-[11px] text-emerald-400 bg-slate-950 p-2.5 rounded-lg overflow-x-auto max-h-48"></pre>
      </div>
    </section>

  </div>

  <script>
    // LocalStorage 키
    const STORAGE_KEY = "5min_simulator_profile";

    // Box-Muller 변환을 이용한 정규분포 난수 생성기
    function randomGaussian(mean = 0, stdDev = 1) {
      let u1 = 0, u2 = 0;
      while (u1 === 0) u1 = Math.random();
      while (u2 === 0) u2 = Math.random();
      const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      return mean + z0 * stdDev;
    }

    // 기본 시간 세팅 (초기값 및 LocalStorage 복원)
    const profile = {
      shower: { mode: 'preset', val: 20 },
      dress: { mode: 'preset', val: 15 },
      meal: { mode: 'preset', val: 25 },
      walk: { mode: 'preset', val: 15 }
    };

    function loadProfile() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) Object.assign(profile, JSON.parse(saved));
      } catch (e) {}
    }

    function saveProfile() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      } catch (e) {}
      updateProfileSummary();
    }

    function updateProfileSummary() {
      const prep = profile.shower.val + profile.dress.val + profile.meal.val;
      document.getElementById('profile-summary-text').textContent = 
        '기본 준비 ' + prep + '분 + 기본 도보 ' + profile.walk.val + '분 (총 ' + (prep + profile.walk.val) + '분)';
    }

    // 커스텀 직접 입력 토글 바인딩
    ['shower', 'dress', 'meal', 'walk'].forEach(key => {
      const select = document.getElementById('select-' + key);
      const input = document.getElementById('input-' + key);
      const btn = document.getElementById('toggle-' + key + '-custom');

      select.value = profile[key].val;
      input.value = profile[key].val;

      btn.addEventListener('click', () => {
        if (profile[key].mode === 'preset') {
          profile[key].mode = 'custom';
          select.classList.add('hidden');
          input.classList.remove('hidden');
          btn.textContent = '✓ 직접입력';
          btn.classList.add('bg-indigo-600', 'text-white');
        } else {
          profile[key].mode = 'preset';
          input.classList.add('hidden');
          select.classList.remove('hidden');
          btn.textContent = '직접 입력';
          btn.classList.remove('bg-indigo-600', 'text-white');
        }
        saveProfile();
      });

      select.addEventListener('change', (e) => {
        profile[key].val = Number(e.target.value);
        input.value = e.target.value;
        saveProfile();
      });

      input.addEventListener('input', (e) => {
        profile[key].val = Math.max(1, Number(e.target.value) || 1);
        saveProfile();
      });
    });

    // 기본 시간 초기화
    loadProfile();
    updateProfileSummary();

    // 초기 약속 시간 세팅 (지금으로부터 2시간 뒤)
    const initTarget = new Date(Date.now() + 2 * 3600 * 1000);
    const yyyy = initTarget.getFullYear();
    const mm = String(initTarget.getMonth() + 1).padStart(2, '0');
    const dd = String(initTarget.getDate()).padStart(2, '0');
    const hh = String(initTarget.getHours()).padStart(2, '0');
    const min = String(initTarget.getMinutes()).padStart(2, '0');
    document.getElementById('appointment-datetime').value = yyyy + '-' + mm + '-' + dd + 'T' + hh + ':' + min;

    // 아코디언 토글
    document.getElementById('btn-toggle-profile').addEventListener('click', () => {
      const body = document.getElementById('profile-body');
      const icon = document.getElementById('profile-accordion-icon');
      if (body.classList.contains('hidden')) {
        body.classList.remove('hidden');
        icon.textContent = '▼';
      } else {
        body.classList.add('hidden');
        icon.textContent = '▶';
      }
    });

    let currentContextData = null;

    // 시뮬레이션 돌리기
    document.getElementById('btn-run-simulation').addEventListener('click', () => {
      const location = document.getElementById('appointment-location').value || '약속 장소';
      const dtVal = document.getElementById('appointment-datetime').value;
      const targetDate = dtVal ? new Date(dtVal) : new Date(Date.now() + 2 * 3600 * 1000);
      const appType = document.getElementById('appointment-type').value;
      const transitTime = Math.max(1, Number(document.getElementById('transit-time').value) || 20);

      const rain = document.getElementById('var-rain').checked;
      const snow = document.getElementById('var-snow').checked;
      const event = document.getElementById('var-event').checked;
      const rush = document.getElementById('var-rush').checked;
      const luggage = document.getElementById('var-luggage').checked;

      // 변수 적용
      let walkMult = 1.0;
      if (rain) walkMult += 0.1;
      if (snow) walkMult += 0.3;
      if (luggage) walkMult += 0.05;

      let waitAdd = 0;
      if (rain) waitAdd += 3;
      if (snow) waitAdd += 8;
      if (event) waitAdd += 5;
      if (rush) waitAdd += 3;

      const varMult = event ? 1.5 : 1.0;

      const showerBase = profile.shower.val;
      const dressBase = profile.dress.val;
      const mealBase = profile.meal.val;
      const walkBase = profile.walk.val * walkMult;
      const waitBase = 4 + waitAdd;

      const N = 3000;
      const prepSamples = [];
      const travelSamples = [];
      const totalSamples = [];

      for (let i = 0; i < N; i++) {
        const sShower = Math.max(2, randomGaussian(showerBase, showerBase * 0.15 * varMult));
        const sDress = Math.max(1, randomGaussian(dressBase, dressBase * 0.15 * varMult));
        const sMeal = Math.max(2, randomGaussian(mealBase, mealBase * 0.2 * varMult));
        const prep = sShower + sDress + sMeal;
        prepSamples.push(prep);

        const sWalk = Math.max(2, randomGaussian(walkBase, walkBase * 0.12 * varMult));
        const sWait = Math.max(1, randomGaussian(waitBase, 2 * varMult));
        const sTransit = Math.max(2, randomGaussian(transitTime, (transitTime * 0.12 + (rush ? 3 : 0)) * varMult));
        const travel = sWalk + sWait + sTransit;
        travelSamples.push(travel);

        totalSamples.push(prep + travel);
      }

      prepSamples.sort((a, b) => a - b);
      travelSamples.sort((a, b) => a - b);
      totalSamples.sort((a, b) => a - b);

      const p90Idx = Math.floor(N * 0.9);
      const prepP90 = Math.round(prepSamples[p90Idx]);
      const travelP90 = Math.round(travelSamples[p90Idx]);
      const totalP90 = Math.round(totalSamples[p90Idx]);

      // 파트 A 역산
      const targetMs = targetDate.getTime();
      const departMs = targetMs - travelP90 * 60 * 1000;
      const prepMs = departMs - prepP90 * 60 * 1000;

      const departDate = new Date(departMs);
      const prepDate = new Date(prepMs);

      // 파트 B 실시간 지각 확률
      const now = Date.now();
      let lateNow = 0, late5 = 0, late10 = 0;
      for (let i = 0; i < N; i++) {
        const dur = totalSamples[i] * 60 * 1000;
        if (now + dur > targetMs) lateNow++;
        if (now + 5 * 60 * 1000 + dur > targetMs) late5++;
        if (now + 10 * 60 * 1000 + dur > targetMs) late10++;
      }

      const probNow = Math.min(100, Math.round((lateNow / N) * 100));
      const prob5 = Math.min(100, Math.round((late5 / N) * 100));
      const prob10 = Math.min(100, Math.round((late10 / N) * 100));

      // 화면 업데이트
      function formatTime(d) {
        const h = d.getHours();
        const m = String(d.getMinutes()).padStart(2, '0');
        const ampm = h >= 12 ? '오후' : '오전';
        const dh = h % 12 === 0 ? 12 : h % 12;
        return (d.getMonth() + 1) + '월 ' + d.getDate() + '일 ' + ampm + ' ' + dh + ':' + m;
      }

      document.getElementById('part-a-prep-time').textContent = formatTime(prepDate);
      document.getElementById('part-a-prep-desc').textContent = '(출발 시각에서 안전 준비시간 ' + prepP90 + '분 역산)';
      document.getElementById('part-a-depart-time').textContent = formatTime(departDate);
      document.getElementById('part-a-depart-desc').textContent = '(약속 시각에서 안전 이동시간 ' + travelP90 + '분 역산)';

      document.getElementById('prob-now-text').textContent = probNow + '%';
      document.getElementById('prob-now-bar').style.width = Math.max(3, probNow) + '%';
      document.getElementById('prob-5min-text').textContent = prob5 + '%';
      document.getElementById('prob-5min-bar').style.width = Math.max(3, prob5) + '%';
      document.getElementById('prob-10min-text').textContent = prob10 + '%';
      document.getElementById('prob-10min-bar').style.width = Math.max(3, prob10) + '%';

      // 팩폭 메시지
      const banner = document.getElementById('verdict-banner');
      if (probNow >= 75) {
        banner.className = 'p-4 rounded-2xl border bg-rose-50 border-rose-200 text-rose-950';
        banner.innerHTML = '<div class="text-xs font-bold text-rose-600">🚨 팩폭: 이미 지각 확정 수준</div><div class="text-sm font-bold mt-1">지금 당장 화장실로 뛰어가세요!</div><div class="text-xs mt-1 text-rose-800">지금 출발해도 지각 확률이 ' + probNow + '%입니다. 침대에서 휴대폰 보며 뭉갤 시간 없습니다!</div>';
      } else if (prob5 >= 60) {
        banner.className = 'p-4 rounded-2xl border bg-amber-50 border-amber-200 text-amber-950';
        banner.innerHTML = '<div class="text-xs font-bold text-amber-600">⚠️ 팩폭: "5분만 더..."의 대재앙</div><div class="text-sm font-bold mt-1">지금 누워있으면 100% 택시행입니다</div><div class="text-xs mt-1 text-amber-800">지금은 지각 확률 ' + probNow + '%지만, 딱 5분 뒹굴거리면 ' + prob5 + '%로 치솟습니다. 지금 일어나세요!</div>';
      } else {
        banner.className = 'p-4 rounded-2xl border bg-emerald-50 border-emerald-200 text-emerald-950';
        banner.innerHTML = '<div class="text-xs font-bold text-emerald-600">✨ 팩폭: 아직은 안전 지대</div><div class="text-sm font-bold mt-1">아직 시간 있습니다. 단, 딴짓 금지!</div><div class="text-xs mt-1 text-emerald-800">역산된 준비 시작 시각(' + formatTime(prepDate) + ')에 맞춰 알람을 설정해두세요.</div>';
      }

      // JSON 생성 및 console.log
      currentContextData = {
        timestamp: new Date().toISOString(),
        userProfile: profile,
        appointment: {
          location,
          targetDateTime: dtVal,
          appointmentType: appType,
          transitTimeMinutes: transitTime,
          variables: { rain, snow, event, rushHour: rush, heavyLuggage: luggage }
        },
        simulationResult: {
          samples: N,
          percentiles: { p90Total: totalP90, p90Prep: prepP90, p90Travel: travelP90 },
          calculatedSchedule: {
            mustStartPrepTime: formatTime(prepDate),
            mustDepartTime: formatTime(departDate),
            targetAppointmentTime: formatTime(targetDate)
          },
          lateRiskAnalysis: { ifStartNow: probNow, ifStartIn5Min: prob5, ifStartIn10Min: prob10 }
        }
      };

      console.log("[5분만 Context Data]", currentContextData);
      document.getElementById('json-display').textContent = JSON.stringify(currentContextData, null, 2);
      document.getElementById('results-area').classList.remove('hidden');
      document.getElementById('results-area').scrollIntoView({ behavior: 'smooth' });
    });

    document.getElementById('btn-copy-raw-json').addEventListener('click', () => {
      if (!currentContextData) return;
      navigator.clipboard.writeText(JSON.stringify(currentContextData, null, 2));
      alert('JSON 데이터가 클립보드에 복사되었습니다.');
    });
  </script>
</body>
</html>`;
}
