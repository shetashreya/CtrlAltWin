// Types for the Coastal Threat Alert System

export interface EnvironmentalReading {
  id?: string;
  timestamp: string;
  lat: number;
  lng: number;
  tide_m: number;
  wind_kmh: number;
  temp_c: number;
  rain_mm: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createdAt?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updatedAt?: any;
}

export interface Alert {
  id?: string;
  created_at: string;
  level: 'advisory' | 'watch' | 'warning';
  type: 'flood_watch' | 'storm_surge' | 'normal';
  message_en: string;
  message_hi: string; // Hindi as second language
  location: {
    lat: number;
    lng: number;
  };
  status: 'active' | 'cleared';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createdAt?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updatedAt?: any;
}

export interface ThresholdConfig {
  THRESHOLD_TIDE_WATCH: number;
  THRESHOLD_TIDE_WARNING: number;
  THRESHOLD_WIND_WARNING: number;
  THRESHOLD_RAIN_WATCH: number;
}

export interface StreamData {
  reading?: EnvironmentalReading;
  new_alerts?: Alert[];
  timestamp: string;
}

export interface RiskLevel {
  level: 'normal' | 'advisory' | 'watch' | 'warning';
  color: string;
  priority: number;
}