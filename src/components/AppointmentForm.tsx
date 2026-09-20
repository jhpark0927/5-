import React from 'react';
import {
  AppointmentData,
  AppointmentType,
  AppointmentVariables,
} from '../types';
import {
  MapPin,
  Calendar,
  Briefcase,
  Train,
  CloudRain,
  Snowflake,
  Users,
  Clock,
  Luggage,
  Play,
} from 'lucide-react';

interface AppointmentFormProps {
  data: AppointmentData;
  onChange: (newData: AppointmentData) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

const APPOINTMENT_TYPES: {
  value: AppointmentType;
  label: string;
  riskTolerance: string;
  desc: string;
}[] = [
  {
    value: 'interview',
    label: '면접 (목표 허용오차 1%)',
    riskTolerance: '1%',
    desc: '지각 시 인생 망함. 99% 안전 마진 확보 필수',
  },
  {
    value: 'class',
    label: '수업 / 업무 (목표 허용오차 5%)',
    riskTolerance: '5%',
    desc: '출결 감점 or 회의 지각 눈치. 엄격한 정시 도착',
  },
  {
    value: 'friend',
    label: '친구 약속 (목표 허용오차 15%)',
    riskTolerance: '15%',
    desc: '"야 나 거의 다 옴" 시전 가능하지만 양심상 15% 이내',
  },
];

const VARIABLE_OPTIONS: {
  key: keyof AppointmentVariables;
  label: string;
  effect: string;
  icon: React.ReactNode;
}[] = [
  {
    key: 'rain',
    label: '비',
    effect: '도보시간 +10%, 대기시간 +3분',
    icon: <CloudRain className="w-4 h-4 text-blue-500" />,
  },
  {
    key: 'snow',
    label: '눈 / 빙판길',
    effect: '도보시간 +30%, 대기시간 +8분',
    icon: <Snowflake className="w-4 h-4 text-cyan-500" />,
  },
  {
    key: 'event',
    label: '행사 / 인파 혼잡',
    effect: '대기시간 +5분, 시간 편차 1.5배 폭증',
    icon: <Users className="w-4 h-4 text-amber-500" />,
  },
  {
    key: 'rushHour',
    label: '출퇴근 피크 시간대',
    effect: '대기시간 +3분 및 환승 지연',
    icon: <Clock className="w-4 h-4 text-rose-500" />,
  },
  {
    key: 'heavyLuggage',
    label: '짐 많음 (캐리어 / 백팩)',
    effect: '도보 이동 속도 5% 감소',
    icon: <Luggage className="w-4 h-4 text-purple-500" />,
  },
];

export const AppointmentForm: React.FC<AppointmentFormProps> = ({
  data,
  onChange,
  onSubmit,
  isLoading = false,
}) => {
  const handleVariableChange = (
    key: keyof AppointmentVariables,
    checked: boolean
  ) => {
    onChange({
      ...data,
      variables: {
        ...data.variables,
        [key]: checked,
      },
    });
  };

  const setQuickTime = (hoursFromNow: number) => {
    const baseDate = data.targetDateTime ? new Date(data.targetDateTime) : new Date();
    const target = new Date(baseDate.getTime() + hoursFromNow * 3600 * 1000);
    // Format to YYYY-MM-DDTHH:mm
    const year = target.getFullYear();
    const month = String(target.getMonth() + 1).padStart(2, '0');
    const day = String(target.getDate()).padStart(2, '0');
    const hours = String(target.getHours()).padStart(2, '0');
    const minutes = String(target.getMinutes()).padStart(2, '0');
    const formatted = `${year}-${month}-${day}T${hours}:${minutes}`;

    onChange({
      ...data,
      targetDateTime: formatted,
    });
  };

  return (
    <form
      id="appointment-info-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-5"
    >
      <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
          <Calendar className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            2. 약속 정보 및 실시간 변수
          </h2>
          <p className="text-xs text-slate-500">
            목적지와 도착 시각, 오늘 마주칠 돌발 변수를 입력하세요.
          </p>
        </div>
      </div>

      {/* 약속 장소 */}
      <div className="space-y-1.5">
        <label
          htmlFor="input-location"
          className="text-xs font-semibold text-slate-700 flex items-center gap-1.5"
        >
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          약속 장소
        </label>
        <input
          id="input-location"
          type="text"
          required
          value={data.location}
          onChange={(e) => onChange({ ...data, location: e.target.value })}
          placeholder="예: 강남역 11번 출구, 판교 알파돔시티"
          className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900 placeholder:text-slate-400 transition-colors"
        />
      </div>

      {/* 약속 일시 */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="input-target-datetime"
            className="text-xs font-semibold text-slate-700 flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            약속 일시 (Date & Time)
          </label>
          {/* Quick preset buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              id="btn-quick-1h"
              onClick={() => setQuickTime(1.0)}
              className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              +1시간 후
            </button>
            <button
              type="button"
              id="btn-quick-2h"
              onClick={() => setQuickTime(2.5)}
              className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              +2.5시간 후
            </button>
            <button
              type="button"
              id="btn-quick-tomorrow"
              onClick={() => setQuickTime(24)}
              className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              내일
            </button>
          </div>
        </div>

        <input
          id="input-target-datetime"
          type="datetime-local"
          required
          value={data.targetDateTime}
          onChange={(e) =>
            onChange({ ...data, targetDateTime: e.target.value })
          }
          className="w-full px-3.5 py-2.5 text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900 transition-colors"
        />
      </div>

      {/* 약속 종류 & 대중교통 시간 2열 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* 약속 종류 */}
        <div className="space-y-1.5">
          <label
            htmlFor="select-appointment-type"
            className="text-xs font-semibold text-slate-700 flex items-center gap-1.5"
          >
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            약속 종류 (중요도)
          </label>
          <select
            id="select-appointment-type"
            value={data.appointmentType}
            onChange={(e) =>
              onChange({
                ...data,
                appointmentType: e.target.value as AppointmentType,
              })
            }
            className="w-full px-3 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900 transition-colors cursor-pointer"
          >
            {APPOINTMENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* 대중교통 탑승 예상 시간 */}
        <div className="space-y-1.5">
          <label
            htmlFor="input-transit-time"
            className="text-xs font-semibold text-slate-700 flex items-center gap-1.5"
          >
            <Train className="w-3.5 h-3.5 text-slate-400" />
            대중교통 탑승 예상 시간 (분)
          </label>
          <div className="relative">
            <input
              id="input-transit-time"
              type="number"
              min={1}
              max={300}
              required
              value={data.transitTimeMinutes}
              onChange={(e) =>
                onChange({
                  ...data,
                  transitTimeMinutes: Math.max(1, Number(e.target.value)),
                })
              }
              placeholder="예: 30"
              className="w-full px-3.5 py-2.5 pr-10 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900 transition-colors"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
              분
            </span>
          </div>
        </div>
      </div>

      {/* 오늘(당일)의 예상 변수 (체크박스) */}
      <div className="space-y-2.5 pt-1">
        <label className="text-xs font-semibold text-slate-700 block">
          오늘(당일)의 예상 변수 (중복 선택)
        </label>

        <div className="space-y-2">
          {VARIABLE_OPTIONS.map((item) => {
            const isChecked = data.variables[item.key];
            return (
              <label
                key={item.key}
                id={`label-var-${item.key}`}
                className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                  isChecked
                    ? 'bg-amber-50/60 border-amber-300 shadow-xs'
                    : 'bg-slate-50/60 border-slate-200/70 hover:bg-slate-100/60'
                }`}
              >
                <input
                  id={`checkbox-${item.key}`}
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) =>
                    handleVariableChange(item.key, e.target.checked)
                  }
                  className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {item.effect}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* [시뮬레이션 돌리기] 대형 메인 버튼 */}
      <button
        type="submit"
        id="btn-run-simulation"
        disabled={isLoading}
        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-600 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white font-bold text-base shadow-lg shadow-rose-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        <Play className="w-5 h-5 fill-current" />
        <span>
          {isLoading
            ? '시뮬레이션 계산 중...'
            : '시뮬레이션 돌리기'}
        </span>
      </button>
    </form>
  );
};
