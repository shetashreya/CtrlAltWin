// Configuration for the Coastal Threat Alert System

import { ThresholdConfig } from './types';

export const DEFAULT_THRESHOLDS: ThresholdConfig = {
  THRESHOLD_TIDE_WATCH: 2.5,
  THRESHOLD_TIDE_WARNING: 3.2,
  THRESHOLD_WIND_WARNING: 60,
  THRESHOLD_RAIN_WATCH: 50,
};

export const getThresholds = (): ThresholdConfig => {
  return {
    THRESHOLD_TIDE_WATCH: parseFloat(process.env.THRESHOLD_TIDE_WATCH || '2.5'),
    THRESHOLD_TIDE_WARNING: parseFloat(process.env.THRESHOLD_TIDE_WARNING || '3.2'),
    THRESHOLD_WIND_WARNING: parseFloat(process.env.THRESHOLD_WIND_WARNING || '60'),
    THRESHOLD_RAIN_WATCH: parseFloat(process.env.THRESHOLD_RAIN_WATCH || '50'),
  };
};

export const APP_CONFIG = {
  REGION_NAME: process.env.APP_REGION_NAME || 'Mumbai Coast',
  TIMEZONE: process.env.TIMEZONE || 'Asia/Kolkata',
  USE_TWILIO: process.env.USE_TWILIO === 'true',
  USE_FIREBASE: process.env.USE_FIREBASE === 'true',
  ALERT_TO_NUMBERS: process.env.ALERT_TO_NUMBERS?.split(',') || ['+911234567890'],
  MUMBAI_COORDS: { lat: 19.0760, lng: 72.8777 }, // Mumbai coordinates
};

export const RISK_LEVELS = {
  normal: { level: 'normal' as const, color: '#10B981', priority: 0 },
  advisory: { level: 'advisory' as const, color: '#F59E0B', priority: 1 },
  watch: { level: 'watch' as const, color: '#EF4444', priority: 2 },
  warning: { level: 'warning' as const, color: '#DC2626', priority: 3 },
};