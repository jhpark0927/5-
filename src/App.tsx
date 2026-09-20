import React, { useState, useEffect, useRef } from 'react';
import {
  UserProfile,
  AppointmentData,
  SimulationSummary,
  ContextDataJSON,
} from './types';
import { ProfileSettings } from './components/ProfileSettings';
import { AppointmentForm } from './components/AppointmentForm';
import { SimulationResult } from './components/SimulationResult';
import { RecentHistoryBoard } from './components/RecentHistoryBoard';
import {
  runMonteCarloSimulation,
  formatTimeKorean,
} from './utils/simulation';
import { generateStandaloneHtml } from './utils/standaloneHtml';
import {
  AlarmClock,
  Sparkles,
  FileCode2,
  Check,
  Download,
  Flame,
  Info,
} from 'lucide-react';

const STORAGE_PROFILE_KEY = '5min_simulator_user_profile_v1';

const DEFAULT_PROFILE: UserProfile = {
  shower: { mode: 'preset', preset: 'normal', customMinutes: 20 },
  dress: { mode: 'preset', preset: 'normal', customMinutes: 15 },
  meal: { mode: 'preset', preset: 'normal', customMinutes: 25 },
  walk: { mode: 'preset', preset: 'normal', customMinutes: 15 },
};

function getInitialDateTime(): string {
  const target = new Date(Date.now() + 2.5 * 3600 * 1000);
  const year = target.getFullYear();
  const month = String(target.getMonth() + 1).padStart(2, '0');
  const day = String(target.getDate()).padStart(2, '0');
  const hours = String(target.getHours()).padStart(2, '0');
  const minutes = String(target.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PROFILE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_PROFILE;
  });

  const [appointment, setAppointment] = useState<AppointmentData>({
    location: '강남역',
    targetDateTime: getInitialDateTime(),
    appointmentType: 'class',
    transitTimeMinutes: 30,
    variables: {
      rain: false,
      snow: false,
      event: false,
      rushHour: true,
      heavyLuggage: false,
    },
  });

  const [simulationResult, setSimulationResult] = useState<{
    summary: SimulationSummary;
    contextData: ContextDataJSON;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Save profile to LocalStorage on change
  const handleProfileChange = (newProfile: UserProfile) => {
    setProfile(newProfile);
    try {
      localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(newProfile));
    } catch {
      // LocalStorage error fallback
    }
  };

  // Run Monte Carlo simulation on submit
  const handleRunSimulation = () => {
    setIsLoading(true);

    // Minor timeout to allow UI loading state to paint and feel tactile
    setTimeout(() => {
      const result = runMonteCarloSimulation(profile, appointment, 3000);
      setSimulationResult(result);
      setIsLoading(false);

      // Requirement 4: JSON Context data logging
      console.log(
        '%c[5분만 Context Data]%c 시뮬레이션 및 역산 분석 결과:',
        'color: #ec4899; font-weight: bold; font-size: 13px;',
        'color: #6366f1;',
        result.contextData
      );

      // Smooth scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }, 120);
  };

  // Initial simulation run on load
  useEffect(() => {
    handleRunSimulation();
  }, []);

  // Copy standalone single-file HTML code
  const handleCopyStandaloneHtml = async () => {
    const html = generateStandaloneHtml();
    try {
      await navigator.clipboard.writeText(html);
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2200);
    } catch {
      // fallback
    }
  };

  // Download standalone single-file HTML
  const handleDownloadStandaloneHtml = () => {
    const html = generateStandaloneHtml();
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '5min_simulator_standalone.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 py-6 px-3 sm:px-4 font-sans">
      {/* Mobile-optimized viewport container (max-w-[480px]) */}
      <div className="max-w-[480px] mx-auto space-y-4">
        
        {/* Header Hero Card */}
        <header
          id="app-header"
          className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm text-center relative overflow-hidden"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 font-bold text-xs border border-rose-100 mb-2">
            <Flame className="w-3.5 h-3.5 fill-rose-500" />
            <span>지각 방지 & 외출 시간 시뮬레이터</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
            <span>5분만</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
              MVP
            </span>
          </h1>

          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-sm mx-auto">
            "5분만 더 잘까?" 하는 순간의 비극을 방지하기 위해 지금 당장의 지각 확률과 최적의 기상·출발 시각을 역산합니다.
          </p>

          {/* Standalone HTML Copy Bar */}
          {/*
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <FileCode2 className="w-3.5 h-3.5 text-slate-400" />
              순수 단일 HTML 내보내기
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                id="btn-copy-standalone-html"
                onClick={handleCopyStandaloneHtml}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                title="단일 파일 HTML 코드를 클립보드에 복사"
              >
                {copiedHtml ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">복사완료</span>
                  </>
                ) : (
                  <>
                    <span>코드 복사</span>
                  </>
                )}
              </button>
              <button
                type="button"
                id="btn-download-standalone-html"
                onClick={handleDownloadStandaloneHtml}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                title="단일 HTML 파일 다운로드"
              >
                <Download className="w-3 h-3" />
                <span>저장</span>
              </button>
            </div>
          </div>
          */}
        </header>

      

        {/* 1. 초기 프로필 설정 영역 */}
        <section id="section-profile">
          <ProfileSettings
            profile={profile}
            onChange={handleProfileChange}
          />
        </section>

        {/* 2. 약속 정보 입력 폼 */}
        <section id="section-appointment">
          <AppointmentForm
            data={appointment}
            onChange={setAppointment}
            onSubmit={handleRunSimulation}
            isLoading={isLoading}
          />
        </section>

        {/* 3. 핵심 결과 연출 영역 */}
        <section id="section-results" ref={resultsRef}>
          {simulationResult && (
            <SimulationResult
              summary={simulationResult.summary}
              contextData={simulationResult.contextData}
            />
          )}
        </section>

        {/* Footer */}
        <footer className="text-center py-4 text-xs text-slate-400 space-y-1">
          <p>© 5분만 - 지각 방지 및 외출 역산 시뮬레이터 MVP</p>
          <p className="text-[11px] text-slate-400">
            Box-Muller 정규분포 난수 몬테카를로 엔진 기반
          </p>
        </footer>

      </div>
    </div>
  );
}
