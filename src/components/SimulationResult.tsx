import React, { useState } from 'react';
import { SimulationSummary, ContextDataJSON } from '../types';
import { formatTimeKorean, formatTimeShort } from '../utils/simulation';
import {
  Clock,
  Home,
  ShowerHead,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Copy,
  Check,
  Code2,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';


interface SimulationResultProps {
  summary: SimulationSummary;
  contextData: ContextDataJSON;
}

export const SimulationResult: React.FC<SimulationResultProps> = ({
  summary,
  contextData,
}) => {
  const [copiedJSON, setCopiedJSON] = useState(false);
  const [showJSON, setShowJSON] = useState(false);

  const [isDeparted, setIsDeparted] = useState(false); // 출발 버튼을 눌렀는지 여부
  const [arrivalResult, setArrivalResult] = useState(null); // 도착 결과 데이터 저장

  const handleCopyJSON = async () => {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(contextData, null, 2)
      );
      setCopiedJSON(true);
      setTimeout(() => setCopiedJSON(false), 2000);
    } catch {
      // Fallback
      console.log('Copied context data to clipboard');
    }
  };

  const handleArrival = () => {
    const actualArrivalTime = new Date(); // 버튼을 누른 현재 실제 시각
    const appointmentTime = new Date(summary.targetTime); // 약속 시각 (기존 summary 데이터 활용)

    // 시간 차이 계산 (분 단위)
    const diffFromAppointment = Math.round(
      (actualArrivalTime.getTime() - appointmentTime.getTime()) / 60000
    );

    const isLate = diffFromAppointment > 0;

    const newRecord = {
    id: Date.now(),
    type: contextData.appointment || '약속', // 예: 친구, 수업, 면접
    diff: diffFromAppointment, // 양수면 지각, 음수면 일찍 도착
    date: actualArrivalTime.toLocaleDateString(),
  };
    const existingHistory = JSON.parse(localStorage.getItem('5min_history') || '[]');
  
    // 3. 새 기록을 맨 앞에 추가하고 다시 저장
    const updatedHistory = [newRecord, ...existingHistory];
    localStorage.setItem('5min_history', JSON.stringify(updatedHistory));
    
    let statusMessage = isLate
      ? `지각입니다! 약속 시간보다 ${diffFromAppointment}분 늦었어요.`
      : `정시 도착! 약속 시간보다 ${Math.abs(diffFromAppointment)}분 일찍 도착했어요.`;

    // 결과 상태 업데이트
    setArrivalResult({
      time: actualArrivalTime,
      isLate,
      statusMessage,
    });
  };

  const prepDate = new Date(summary.mustStartPrepAt);
  const departDate = new Date(summary.mustDepartAt);
  const targetDate = new Date(summary.targetTime);

  // Helper for color based on late percentage
  const getGaugeColor = (prob: number) => {
    if (prob < 20) return 'bg-emerald-500 text-emerald-700';
    if (prob < 50) return 'bg-amber-500 text-amber-700';
    if (prob < 80) return 'bg-orange-500 text-orange-700';
    return 'bg-rose-500 text-rose-700';
  };

  const getGaugeTrackColor = (prob: number) => {
    if (prob < 20) return 'bg-emerald-50 border-emerald-200';
    if (prob < 50) return 'bg-amber-50 border-amber-200';
    if (prob < 80) return 'bg-orange-50 border-orange-200';
    return 'bg-rose-50 border-rose-200';
  };

  return (

    <div id="simulation-results-container" className="space-y-4">
      {/* 팩폭 브리핑 배너 */}
      <div
        id="fact-bomb-banner"
        className={`p-4 rounded-2xl border transition-all ${
          summary.verdict.level === 'critical'
            ? 'bg-rose-50 border-rose-200 text-rose-950'
            : summary.verdict.level === 'danger'
            ? 'bg-orange-50 border-orange-200 text-orange-950'
            : summary.verdict.level === 'warning'
            ? 'bg-amber-50 border-amber-200 text-amber-950'
            : 'bg-emerald-50 border-emerald-200 text-emerald-950'
        }`}
      >

      
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/80 border border-current shadow-xs">
            {summary.verdict.badge}
          </span>
          {/*
          <span className="text-[11px] font-medium opacity-70">
            N={summary.sampleCount.toLocaleString()}회 난수 시뮬레이션 완료
          </span>
          */}
        </div>
        <h3 className="text-base font-bold tracking-tight">
          {summary.verdict.title}
        </h3>
        <p className="text-xs mt-1 leading-relaxed opacity-90">
          {summary.verdict.message}
        </p>
      </div>

      {/* [파트 A: 정시 도착을 위한 팩폭 역산기 (미래 계획용)] */}
      <div
        id="part-a-reverse-calculator"
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4"
      >
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                파트 A: 정시 도착을 위한 팩폭 역산기
              </h3>
              <p className="text-xs text-slate-500">
                약속 시간 기준 상위 90% 
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            목표 안전 마진 90%
          </span>
        </div>

        <div className="bg-slate-50/80 rounded-xl p-3 text-xs text-slate-600 flex items-center justify-between">
          <span>이 약속에 지각하지 않으려면...</span>
          <span className="font-semibold text-slate-900">
            총 여유 시간 {summary.totalP90}분 필요
          </span>
        </div>

        {/* 2단계 역산 카드 */}
        <div className="grid grid-cols-1 gap-3">
          {/* 1) 씻기 시작해야 할 시각 */}
          <div
            id="card-must-prep-time"
            className="p-4 rounded-xl bg-gradient-to-br from-indigo-50/80 to-purple-50/50 border border-indigo-100/90 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-900 font-semibold text-xs">
                <span className="text-lg">🚿</span>
                <span>지금 당장 씻기 시작해야 할 시각</span>
              </div>
              <span className="text-[11px] font-bold text-indigo-600 bg-white px-2 py-0.5 rounded border border-indigo-100">
                준비 P90 {summary.prepP90}분
              </span>
            </div>
            <div className="mt-2 text-xl sm:text-2xl font-black text-indigo-950 tracking-tight">
              {formatTimeKorean(prepDate)}
            </div>
            <p className="text-[11px] text-indigo-700 mt-1">
              (출발 시각 {formatTimeShort(departDate)}에서 준비 시간 {summary.prepP90}분 역산)
            </p>
          </div>

          {/* 2) 집에서 출발해야 할 시각 */}
          <div
            id="card-must-depart-time"
            className="p-4 rounded-xl bg-gradient-to-br from-emerald-50/80 to-teal-50/50 border border-emerald-100/90 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-900 font-semibold text-xs">
                <span className="text-lg">🏠</span>
                <span>집에서 늦어도 출발해야 할 시각</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 bg-white px-2 py-0.5 rounded border border-emerald-100">
                이동 P90 {summary.travelP90}분
              </span>
            </div>
            <div className="mt-2 text-xl sm:text-2xl font-black text-emerald-950 tracking-tight">
              {formatTimeKorean(departDate)}
            </div>
            <p className="text-[11px] text-emerald-700 mt-1">
              (약속 시각 {formatTimeShort(targetDate)}에서 이동 시간 {summary.travelP90}분 역산)
            </p>
          </div>
        </div>

        {/* 요약 상세 통계 바 */}
        <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-around text-center text-xs">
          <div>
            <div className="text-[11px] text-slate-400">중앙값(50%)</div>
            <div className="font-bold text-slate-700">{summary.medianTotal}분</div>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <div className="text-[11px] text-slate-400">안전선(90%)</div>
            <div className="font-bold text-indigo-600">{summary.totalP90}분</div>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <div className="text-[11px] text-slate-400">최악의 경우</div>
            <div className="font-bold text-rose-600">{summary.maxTotal}분</div>
          </div>
        </div>
      </div>

      {/* [파트 B: 지금 당장 준비를 시작한다면? (실시간 지각 게이지)] */}
      <div
        id="part-b-live-probability"
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4"
      >
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-sm">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                파트 B: 지금 당장 준비를 시작한다면?
              </h3>
              <p className="text-xs text-slate-500">
                현재 시각 기준 실시간 지각 확률 시뮬레이션
              </p>
            </div>
          </div>
          <span className="text-[11px] text-slate-400">
            기준: {formatTimeShort(new Date(summary.currentTime))}
          </span>
        </div>

        {/* 3단계 게이지 바 */}
        <div className="space-y-3.5">
          {/* 1. 지금 당장 */}
          <div
            id="gauge-start-now"
            className={`p-3 rounded-xl border transition-all ${getGaugeTrackColor(
              summary.lateProbNow
            )}`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span>🏃</span> 지금 당장 씻고 준비해서 출발할 경우
              </span>
              <span
                className={`text-sm font-black ${
                  summary.lateProbNow > 50 ? 'text-rose-600' : 'text-slate-800'
                }`}
              >
                지각 확률 {summary.lateProbNow}%
              </span>
            </div>
            <div className="w-full h-3 bg-slate-200/80 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  summary.lateProbNow < 20
                    ? 'bg-emerald-500'
                    : summary.lateProbNow < 50
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${Math.max(2, summary.lateProbNow)}%` }}
              />
            </div>
          </div>

          {/* 2. 5분 뒤 침대에서 일어날 경우 */}
          <div
            id="gauge-start-5min"
            className={`p-3 rounded-xl border transition-all ${getGaugeTrackColor(
              summary.lateProb5Min
            )}`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span>🛌</span> 5분 뒤 침대에서 일어날 경우 (+5분)
              </span>
              <div className="flex items-center gap-1.5">
                {summary.lateProb5Min > summary.lateProbNow && (
                  <span className="text-[11px] font-bold text-rose-600 bg-rose-100 px-1.5 py-0.2 rounded">
                    +{summary.lateProb5Min - summary.lateProbNow}%p 폭등
                  </span>
                )}
                <span
                  className={`text-sm font-black ${
                    summary.lateProb5Min > 50
                      ? 'text-rose-600'
                      : 'text-slate-800'
                  }`}
                >
                  지각 확률 {summary.lateProb5Min}%
                </span>
              </div>
            </div>
            <div className="w-full h-3 bg-slate-200/80 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  summary.lateProb5Min < 20
                    ? 'bg-emerald-500'
                    : summary.lateProb5Min < 50
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${Math.max(2, summary.lateProb5Min)}%` }}
              />
            </div>
          </div>

          {/* 3. 10분 뒤 일어날 경우 */}
          <div
            id="gauge-start-10min"
            className={`p-3 rounded-xl border transition-all ${getGaugeTrackColor(
              summary.lateProb10Min
            )}`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span>📱</span> 10분 뒤 일어날 경우 (+10분 폰 보기)
              </span>
              <div className="flex items-center gap-1.5">
                {summary.lateProb10Min > summary.lateProbNow && (
                  <span className="text-[11px] font-bold text-rose-600 bg-rose-100 px-1.5 py-0.2 rounded">
                    +{summary.lateProb10Min - summary.lateProbNow}%p 폭등
                  </span>
                )}
                <span
                  className={`text-sm font-black ${
                    summary.lateProb10Min > 50
                      ? 'text-rose-600'
                      : 'text-slate-800'
                  }`}
                >
                  지각 확률 {summary.lateProb10Min}%
                </span>
              </div>
            </div>
            <div className="w-full h-3 bg-slate-200/80 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  summary.lateProb10Min < 20
                    ? 'bg-emerald-500'
                    : summary.lateProb10Min < 50
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${Math.max(2, summary.lateProb10Min)}%` }}
              />
            </div>
          </div>
        </div>
          <div className="border-t pt-6 mt-6">
        {/* 아직 출발 안 했을 때 -> 출발 버튼 표시 */}
        {!isDeparted && !arrivalResult && (
          <button
            onClick={() => setIsDeparted(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-colors text-lg"
          >
            🚀 지금 당장 출발하기
          </button>
        )}

        {/* 출발은 했고, 도착은 안 했을 때 -> 도착 버튼 표시 */}
        {isDeparted && !arrivalResult && (
          <div className="text-center animate-fade-in">
            <p className="text-sm text-slate-500 mb-2">이동 중입니다... 목적지에 도착하면 눌러주세요!</p>
            <button
              onClick={handleArrival}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg transition-colors text-lg"
            >
              🚩 목적지 도착 완료!
            </button>
          </div>
        )}

        {/* 도착 버튼을 눌렀을 때 -> 결과 판정 화면 표시 */}
        {arrivalResult && (
          <div className={`p-6 rounded-xl text-center shadow-sm border ${
            arrivalResult.isLate 
              ? 'bg-red-50 border-red-200 text-red-700' 
              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}>
            <h3 className="text-2xl font-bold mb-3">
              {arrivalResult.isLate ? '⚠️ 지각 확정' : '🎉 세이프!'}
            </h3>
            <div className="bg-white/60 p-3 rounded-lg">
              <p className="font-bold text-lg">{arrivalResult.statusMessage}</p>
            </div>
            
            {/* 초기화 버튼 (다음 약속 등록을 위해) */}
            <button
              onClick={() => {
                setIsDeparted(false);
                setArrivalResult(null);
                // 추가로 상위 폼을 리셋하는 로직이 필요하다면 여기서 호출하세요.
              }}
              className="mt-6 px-4 py-2 bg-white rounded-lg text-sm font-semibold shadow-sm hover:bg-slate-50 transition-colors"
            >
              상태 초기화
            </button>
          </div>
        )}
      </div>
        <p className="text-[11px] text-slate-500 text-center">
          💡 "딱 5분만 더 잘까?" 하는 순간 지각 위험은 선형이 아니라 기하급수적으로 폭발합니다.
        </p>
      </div>

     
      {/* 4. 데이터 로깅 (AI 연동용 JSON Context) */}
      {/*}
      <div
        id="data-logging-section"
        className="bg-slate-900 text-slate-100 rounded-2xl p-4 space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-200">
              통합 Context JSON (AI 연동 및 console.log 완료)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-copy-json"
              onClick={handleCopyJSON}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedJSON ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>복사됨</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>JSON 복사</span>
                </>
              )}
            </button>
            <button
              type="button"
              id="btn-toggle-json-view"
              onClick={() => setShowJSON(!showJSON)}
              className="text-xs p-1 text-slate-400 hover:text-slate-200"
            >
              {showJSON ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed">
          브라우저 개발자 도구 콘솔(`F12`)에 이미 <code className="text-emerald-400">console.log("[5분만 Context Data]", contextData)</code>로 전체 JSON이 출력되었습니다.
        </p>

        {showJSON && (
          <pre
            id="json-preview-block"
            className="text-[11px] bg-slate-950 p-3 rounded-xl overflow-x-auto text-emerald-300 max-h-60 border border-slate-800 font-mono"
          >
            {JSON.stringify(contextData, null, 2)}
          </pre>
        )}
      </div>
      */}
    </div>
  );
};
