import React, { useState, useEffect } from 'react';

export const RecentHistoryBoard = () => {
  const [history, setHistory] = useState([]);

  // 컴포넌트가 화면에 나타날 때 로컬 스토리지에서 기록을 불러옵니다.
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('5min_history') || '[]');
    setHistory(stored);
  }, []);

  // 기록이 아예 없으면 렌더링하지 않음
  if (history.length === 0) return null;

  // 최근 5개만 잘라내기
  const recent5 = history.slice(0, 5);

  // 최근 5번 중 지각한 횟수 계산
  const lateCount = recent5.filter((record) => record.diff > 0).length;
  
  // 최근 5번의 실제 지각 확률 (지각 횟수 / 전체 횟수 * 100)
  const actualLateProb = Math.round((lateCount / recent5.length) * 100);

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 mb-6">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        📊 나의 최근 5번 약속 성적표
      </h3>

      {/* 평균 지각 확률 요약 박스 */}
      <div className={`p-4 rounded-lg mb-4 text-center font-bold ${
        actualLateProb >= 50 ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
      }`}>
        <p className="text-sm opacity-80 font-normal">최근 {recent5.length}번의 약속 중 실제 지각률</p>
        <p className="text-3xl mt-1">{actualLateProb}%</p>
      </div>

      {/* 한 줄 요약 리스트 */}
      <ul className="space-y-3">
        {recent5.map((record) => {
          const isLate = record.diff > 0;
          return (
            <li key={record.id} className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-lg">{isLate ? '⚠️' : '✅'}</span>
                <span className="font-semibold text-slate-700">{record.type}</span>
              </div>
              
              <div className={`font-bold ${isLate ? 'text-red-500' : 'text-emerald-500'}`}>
                {isLate 
                  ? `${record.diff}분 지각` 
                  : record.diff === 0 
                    ? `정확히 정시 도착` 
                    : `${Math.abs(record.diff)}분 일찍 도착`
                }
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};