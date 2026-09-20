import React, { useState } from 'react';
import { UserProfile, SpeedOption } from '../types';
import { PRESET_VALUES, PRESET_LABELS, getItemMinutes } from '../utils/simulation';
import { ChevronDown, ChevronUp, Clock, User, Sparkles, Check } from 'lucide-react';

interface ProfileSettingsProps {
  profile: UserProfile;
  onChange: (newProfile: UserProfile) => void;
}

interface ItemConfig {
  key: keyof UserProfile;
  label: string;
  icon: string;
  desc: string;
}

const ITEMS: ItemConfig[] = [
  { key: 'shower', label: '씻는 시간', icon: '🚿', desc: '세안, 샤워 및 머리 말리기' },
  { key: 'dress', label: '옷 입는 시간', icon: '👕', desc: '옷 고르기, 착용 및 외출 매무새' },
  { key: 'meal', label: '식사 시간', icon: '🍚', desc: '식사 및 정리' },
  { key: 'walk', label: '기본 도보 시간', icon: '🚶', desc: '집-정류장 & 역-목적지 총 도보' },
];

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  profile,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const handlePresetChange = (key: keyof UserProfile, preset: SpeedOption) => {
    onChange({
      ...profile,
      [key]: {
        ...profile[key],
        preset,
      },
    });
  };

  const handleModeToggle = (key: keyof UserProfile) => {
    const current = profile[key];
    const newMode = current.mode === 'preset' ? 'custom' : 'preset';
    const fallbackMinutes = PRESET_VALUES[key][current.preset];

    onChange({
      ...profile,
      [key]: {
        ...current,
        mode: newMode,
        customMinutes: current.customMinutes || fallbackMinutes,
      },
    });
  };

  const handleCustomMinutesChange = (
    key: keyof UserProfile,
    minutes: number
  ) => {
    const val = Math.max(1, Math.min(180, Math.round(minutes)));
    onChange({
      ...profile,
      [key]: {
        ...profile[key],
        customMinutes: val,
      },
    });
  };

  const totalBasePrepMinutes =
    getItemMinutes(profile.shower, 'shower') +
    getItemMinutes(profile.dress, 'dress') +
    getItemMinutes(profile.meal, 'meal');

  const walkMinutes = getItemMinutes(profile.walk, 'walk');

  return (
    <div
      id="profile-settings-card"
      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-200"
    >
      {/* Header / Accordion trigger */}
      <button
        type="button"
        id="toggle-profile-accordion"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between bg-slate-50/70 hover:bg-slate-100/70 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              1. 기본 외출 준비 프로필
              <span className="text-xs font-normal text-slate-500 hidden sm:inline">
                (개인 습관 설정)
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              기본 준비 {totalBasePrepMinutes}분 + 기본 도보 {walkMinutes}분
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
            총 {totalBasePrepMinutes + walkMinutes}분
          </span>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </button>

      {/* Accordion body */}
      {isOpen && (
        <div className="p-5 space-y-4 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            평소 본인의 준비 성향을 선택하거나 <strong className="text-slate-700">[직접 입력]</strong>으로 분 단위 시간을 지정하세요. 브라우저에 자동 저장됩니다.
          </p>

          <div className="space-y-3.5">
            {ITEMS.map((item) => {
              const current = profile[item.key];
              const isCustom = current.mode === 'custom';
              const currentMin = getItemMinutes(current, item.key);

              return (
                <div
                  key={item.key}
                  id={`profile-row-${item.key}`}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl" role="img" aria-label={item.label}>
                      {item.icon}
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                        {item.label}
                        <span className="text-xs font-medium text-indigo-600 bg-white px-2 py-0.5 rounded border border-indigo-100">
                          {currentMin}분
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">{item.desc}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {isCustom ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          id={`input-custom-${item.key}`}
                          type="number"
                          min={1}
                          max={180}
                          value={current.customMinutes}
                          onChange={(e) =>
                            handleCustomMinutesChange(
                              item.key,
                              Number(e.target.value)
                            )
                          }
                          className="w-20 px-2.5 py-1.5 text-sm font-semibold text-slate-900 bg-white border border-slate-300 rounded-lg text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        />
                        <span className="text-xs text-slate-600 font-medium">
                          분
                        </span>
                      </div>
                    ) : (
                      <select
                        id={`select-preset-${item.key}`}
                        value={current.preset}
                        onChange={(e) =>
                          handlePresetChange(
                            item.key,
                            e.target.value as SpeedOption
                          )
                        }
                        className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded-lg text-slate-800 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none cursor-pointer"
                      >
                        <option value="fast">
                          {PRESET_LABELS[item.key].fast}
                        </option>
                        <option value="normal">
                          {PRESET_LABELS[item.key].normal}
                        </option>
                        <option value="slow">
                          {PRESET_LABELS[item.key].slow}
                        </option>
                      </select>
                    )}

                    {/* 직접 입력 토글 버튼 */}
                    <button
                      type="button"
                      id={`btn-toggle-custom-${item.key}`}
                      onClick={() => handleModeToggle(item.key)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
                        isCustom
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-100/70'
                      }`}
                    >
                      {isCustom ? '✓ 직접 입력' : '직접 입력'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
