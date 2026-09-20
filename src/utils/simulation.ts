import {
  UserProfile,
  AppointmentData,
  SimulationSummary,
  ContextDataJSON,
  SpeedOption,
} from '../types';

export const PRESET_VALUES: Record<
  keyof UserProfile,
  Record<SpeedOption, number>
> = {
  shower: { fast: 10, normal: 20, slow: 35 },
  dress: { fast: 5, normal: 15, slow: 25 },
  meal: { fast: 0, normal: 25, slow: 45 },
  walk: { fast: 10, normal: 15, slow: 25 },
};

export const PRESET_LABELS: Record<
  keyof UserProfile,
  Record<SpeedOption, string>
> = {
  shower: { fast: '빠름 (10분)', normal: '보통 (20분)', slow: '느림 (35분)' },
  dress: { fast: '빠름 (5분)', normal: '보통 (15분)', slow: '느림 (25분)' },
  meal: { fast: '빠름 (0분)', normal: '보통 (25분)', slow: '느림 (45분)' },
  walk: { fast: '빠름 (10분)', normal: '보통 (15분)', slow: '느림 (25분)' },
};

/**
 * Box-Muller transform to generate standard normally distributed random numbers
 */
export function randomGaussian(mean: number = 0, stdDev: number = 1): number {
  let u1 = 0;
  let u2 = 0;
  // Avoid 0 to prevent Math.log(0) resulting in -Infinity
  while (u1 === 0) u1 = Math.random();
  while (u2 === 0) u2 = Math.random();

  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return mean + z0 * stdDev;
}

export function getItemMinutes(
  item: UserProfile[keyof UserProfile],
  category: keyof UserProfile
): number {
  if (item.mode === 'custom') {
    return Math.max(1, Number(item.customMinutes) || 1);
  }
  return PRESET_VALUES[category][item.preset];
}

export function runMonteCarloSimulation(
  profile: UserProfile,
  appointment: AppointmentData,
  samplesCount: number = 3000
): { summary: SimulationSummary; contextData: ContextDataJSON } {
  const showerBase = getItemMinutes(profile.shower, 'shower');
  const dressBase = getItemMinutes(profile.dress, 'dress');
  const mealBase = getItemMinutes(profile.meal, 'meal');
  const walkBase = getItemMinutes(profile.walk, 'walk');
  const transitBase = Math.max(1, Number(appointment.transitTimeMinutes) || 1);

  // Variable multipliers
  const { rain, snow, event, rushHour, heavyLuggage } = appointment.variables;

  let walkMultiplier = 1.0;
  if (rain) walkMultiplier += 0.1;
  if (snow) walkMultiplier += 0.3;
  if (heavyLuggage) walkMultiplier += 0.05;

  let waitAdditional = 0;
  if (rain) waitAdditional += 3;
  if (snow) waitAdditional += 8;
  if (event) waitAdditional += 5;
  if (rushHour) waitAdditional += 3;

  const varianceMultiplier = event ? 1.5 : 1.0;

  // Base waiting / transfer time (mean 4 mins, stdDev 1.5)
  const baseWaitMean = 4 + waitAdditional;
  const baseWaitStdDev = Math.max(1, 1.8 * varianceMultiplier);

  // Standard deviations for prep components (proportional to base ~ 15-20%)
  const showerStdDev = Math.max(1, showerBase * 0.15 * varianceMultiplier);
  const dressStdDev = Math.max(0.8, dressBase * 0.15 * varianceMultiplier);
  const mealStdDev = Math.max(1, mealBase * 0.2 * varianceMultiplier);

  // Standard deviation for travel components
  const adjustedWalkMean = walkBase * walkMultiplier;
  const walkStdDev = Math.max(1, adjustedWalkMean * 0.12 * varianceMultiplier);

  const transitStdDev = Math.max(
    1.5,
    (transitBase * 0.12 + (rushHour ? 3 : 0)) * varianceMultiplier
  );

  const prepSamples: number[] = new Array(samplesCount);
  const travelSamples: number[] = new Array(samplesCount);
  const totalSamples: number[] = new Array(samplesCount);

  for (let i = 0; i < samplesCount; i++) {
    // Prep stage simulations (clamped so positive)
    const simShower = Math.max(2, randomGaussian(showerBase, showerStdDev));
    const simDress = Math.max(1, randomGaussian(dressBase, dressStdDev));
    const simMeal = Math.max(2, randomGaussian(mealBase, mealStdDev));
    const prepDuration = simShower + simDress + simMeal;
    prepSamples[i] = prepDuration;

    // Travel stage simulations
    const simWalk = Math.max(2, randomGaussian(adjustedWalkMean, walkStdDev));
    const simWait = Math.max(1, randomGaussian(baseWaitMean, baseWaitStdDev));
    const simTransit = Math.max(
      2,
      randomGaussian(transitBase, transitStdDev)
    );
    const travelDuration = simWalk + simWait + simTransit;
    travelSamples[i] = travelDuration;

    totalSamples[i] = prepDuration + travelDuration;
  }

  // Sort samples to determine percentiles
  prepSamples.sort((a, b) => a - b);
  travelSamples.sort((a, b) => a - b);
  totalSamples.sort((a, b) => a - b);

  const p90Index = Math.floor(samplesCount * 0.9);
  const p50Index = Math.floor(samplesCount * 0.5);

  const prepP90 = Math.round(prepSamples[p90Index]);
  const travelP90 = Math.round(travelSamples[p90Index]);
  const totalP90 = Math.round(totalSamples[p90Index]);
  const medianTotal = Math.round(totalSamples[p50Index]);
  const minTotal = Math.round(totalSamples[0]);
  const maxTotal = Math.round(totalSamples[samplesCount - 1]);

  // Reverse Calculation (Part A)
  const targetDate = new Date(appointment.targetDateTime);
  // Ensure valid date fallback
  const validTargetTime = isNaN(targetDate.getTime())
    ? new Date(Date.now() + 2 * 3600 * 1000)
    : targetDate;

  // departure time = targetTime - travelP90 minutes
  const mustDepartTimestamp =
    validTargetTime.getTime() - travelP90 * 60 * 1000;
  const mustDepartDate = new Date(mustDepartTimestamp);

  // shower/prep start time = departure time - prepP90 minutes
  const mustStartPrepTimestamp =
    mustDepartTimestamp - prepP90 * 60 * 1000;
  const mustStartPrepDate = new Date(mustStartPrepTimestamp);

  // Real-time Probability (Part B)
  const now = new Date();
  const nowMs = now.getTime();
  const targetMs = validTargetTime.getTime();

  let lateCountNow = 0;
  let lateCount5Min = 0;
  let lateCount10Min = 0;

  for (let i = 0; i < samplesCount; i++) {
    const durMs = totalSamples[i] * 60 * 1000;
    if (nowMs + durMs > targetMs) lateCountNow++;
    if (nowMs + 5 * 60 * 1000 + durMs > targetMs) lateCount5Min++;
    if (nowMs + 10 * 60 * 1000 + durMs > targetMs) lateCount10Min++;
  }

  const lateProbNow = Math.min(
    100,
    Math.round((lateCountNow / samplesCount) * 100)
  );
  const lateProb5Min = Math.min(
    100,
    Math.round((lateCount5Min / samplesCount) * 100)
  );
  const lateProb10Min = Math.min(
    100,
    Math.round((lateCount10Min / samplesCount) * 100)
  );

  // Fact bombing verdict generator
  const minutesUntilMustPrep = Math.round(
    (mustStartPrepTimestamp - nowMs) / (60 * 1000)
  );

  const verdict = getFactBombVerdict(
    lateProbNow,
    lateProb5Min,
    minutesUntilMustPrep,
    appointment
  );

  const summary: SimulationSummary = {
    sampleCount: samplesCount,
    prepP90,
    travelP90,
    totalP90,
    medianTotal,
    minTotal,
    maxTotal,
    mustStartPrepAt: mustStartPrepDate.toISOString(),
    mustDepartAt: mustDepartDate.toISOString(),
    targetTime: validTargetTime.toISOString(),
    currentTime: now.toISOString(),
    lateProbNow,
    lateProb5Min,
    lateProb10Min,
    verdict,
  };

  // Structured Context Data for AI logging
  const contextData: ContextDataJSON = {
    timestamp: now.toISOString(),
    userProfile: {
      showerMinutes: showerBase,
      dressMinutes: dressBase,
      mealMinutes: mealBase,
      walkMinutes: walkBase,
      totalBasePrepMinutes: showerBase + dressBase + mealBase,
      profileConfig: profile,
    },
    appointment,
    simulationResult: {
      samples: samplesCount,
      percentiles: {
        p50: medianTotal,
        p90Total: totalP90,
        p90Prep: prepP90,
        p90Travel: travelP90,
      },
      calculatedSchedule: {
        mustStartPrepTime: formatTimeKorean(mustStartPrepDate),
        mustDepartTime: formatTimeKorean(mustDepartDate),
        targetAppointmentTime: formatTimeKorean(validTargetTime),
      },
      lateRiskAnalysis: {
        ifStartNow: lateProbNow,
        ifStartIn5Min: lateProb5Min,
        ifStartIn10Min: lateProb10Min,
      },
      factBombVerdict: {
        badge: verdict.badge,
        title: verdict.title,
        message: verdict.message,
      },
    },
  };

  return { summary, contextData };
}

function getFactBombVerdict(
  lateProbNow: number,
  lateProb5Min: number,
  minutesUntilMustPrep: number,
  appointment: AppointmentData
) {
  const typeText =
    appointment.appointmentType === 'interview'
      ? '면접'
      : appointment.appointmentType === 'class'
      ? '수업/업무'
      : '친구 약속';

  if (lateProbNow >= 80) {
    return {
      badge: '🚨 팩폭: 이미 지각 확정 수준',
      title: '휴대폰 던지고 당장 화장실로 뛰어가세요!',
      message: `지금 출발해도 지각 확률이 ${lateProbNow}%입니다. 변명 준비할 시간도 없습니다. 샴푸칠 30초 컷으로 줄이고 신발부터 신으세요!`,
      level: 'critical' as const,
    };
  }

  if (lateProbNow >= 45 || lateProb5Min >= 70) {
    return {
      badge: '⚠️ 팩폭: "5분만 더..."의 대재앙',
      title: '지금 침대에서 뒤척이면 100% 택시행입니다',
      message: `지금은 지각 확률 ${lateProbNow}%지만, 딱 5분 뒹굴거리면 ${lateProb5Min}%로 치솟습니다. ${typeText} 자리에서 신뢰 잃기 싫으면 지금 기상!`,
      level: 'danger' as const,
    };
  }

  if (minutesUntilMustPrep <= 15 && minutesUntilMustPrep > 0) {
    return {
      badge: '⏳ 팩폭: 데드라인 초읽기',
      title: `준비 시작까지 딱 ${minutesUntilMustPrep}분 남았습니다`,
      message: `유튜브 쇼츠 3개 보면 그대로 골든타임 끝납니다. 화면 끄고 외출복부터 골라두세요.`,
      level: 'warning' as const,
    };
  }

  if (minutesUntilMustPrep <= 0 && lateProbNow < 45) {
    return {
      badge: '🚿 팩폭: 지금 안 씻으면 망함',
      title: '역산 데드라인이 이미 시작되었습니다!',
      message: `안전선(상위 90%) 기준 지금 씻기 시작해야 여유롭게 도착합니다. 여유 부릴 시간 0분!`,
      level: 'warning' as const,
    };
  }

  return {
    badge: '✨ 팩폭: 아직은 안전 지대',
    title: '아직 시간 있습니다. 단, 딴짓 금지!',
    message: `역산된 준비 시작 시각은 여유가 있지만, 돌발 변수(비·눈·혼잡)가 터지면 순식간에 깎여나갑니다. 알람 맞춰두세요.`,
    level: 'safe' as const,
  };
}

export function formatTimeKorean(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? '오후' : '오전';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const padMin = String(minutes).padStart(2, '0');

  return `${month}월 ${day}일 ${ampm} ${displayHours}:${padMin}`;
}

export function formatTimeShort(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? '오후' : '오전';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const padMin = String(minutes).padStart(2, '0');
  return `${ampm} ${displayHours}:${padMin}`;
}
