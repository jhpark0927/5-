export type SpeedOption = 'fast' | 'normal' | 'slow';

export interface ProfileSettingItem {
  mode: 'preset' | 'custom';
  preset: SpeedOption;
  customMinutes: number;
}

export interface UserProfile {
  shower: ProfileSettingItem;
  dress: ProfileSettingItem;
  meal: ProfileSettingItem;
  walk: ProfileSettingItem;
}

export type AppointmentType = 'interview' | 'class' | 'friend';

export interface AppointmentVariables {
  rain: boolean;
  snow: boolean;
  event: boolean;
  rushHour: boolean;
  heavyLuggage: boolean;
}

export interface AppointmentData {
  location: string;
  targetDateTime: string; // ISO string for datetime-local
  appointmentType: AppointmentType;
  transitTimeMinutes: number;
  variables: AppointmentVariables;
}

export interface SimulationSummary {
  sampleCount: number;
  prepP90: number; // 90th percentile prep time in minutes
  travelP90: number; // 90th percentile travel time in minutes
  totalP90: number; // 90th percentile total duration in minutes
  medianTotal: number;
  minTotal: number;
  maxTotal: number;
  
  // Part A: Reverse calculated timestamps
  mustStartPrepAt: string; // ISO or formatted
  mustDepartAt: string;    // ISO or formatted
  targetTime: string;

  // Part B: Real-time late probability from now
  currentTime: string;
  lateProbNow: number;     // 0 ~ 100%
  lateProb5Min: number;    // 0 ~ 100%
  lateProb10Min: number;   // 0 ~ 100%

  // Fact bombing witty verdict
  verdict: {
    badge: string;
    title: string;
    message: string;
    level: 'safe' | 'warning' | 'danger' | 'critical';
  };
}

export interface ContextDataJSON {
  timestamp: string;
  userProfile: {
    showerMinutes: number;
    dressMinutes: number;
    mealMinutes: number;
    walkMinutes: number;
    totalBasePrepMinutes: number;
    profileConfig: UserProfile;
  };
  appointment: AppointmentData;
  simulationResult: {
    samples: number;
    percentiles: {
      p50: number;
      p90Total: number;
      p90Prep: number;
      p90Travel: number;
    };
    calculatedSchedule: {
      mustStartPrepTime: string;
      mustDepartTime: string;
      targetAppointmentTime: string;
    };
    lateRiskAnalysis: {
      ifStartNow: number;
      ifStartIn5Min: number;
      ifStartIn10Min: number;
    };
    factBombVerdict: {
      badge: string;
      title: string;
      message: string;
    };
  };
}
