// Rule-based anomaly detection for Coastal Threat Alert System

import { EnvironmentalReading, Alert, ThresholdConfig, RiskLevel } from './types';
import { getThresholds, APP_CONFIG, RISK_LEVELS } from './config';

export class AnomalyDetector {
  private thresholds: ThresholdConfig;

  constructor() {
    this.thresholds = getThresholds();
  }

  // Analyze a reading and return alerts if thresholds are breached
  analyzeReading(reading: EnvironmentalReading): Alert[] {
    const alerts: Alert[] = [];
    const currentTime = new Date().toISOString();

    // Check for Flood Watch: High tide + High rainfall
    if (reading.tide_m >= this.thresholds.THRESHOLD_TIDE_WATCH && 
        reading.rain_mm >= this.thresholds.THRESHOLD_RAIN_WATCH) {
      alerts.push({
        created_at: currentTime,
        level: 'watch',
        type: 'flood_watch',
        message_en: `FLOOD WATCH: Elevated tide (${reading.tide_m}m) and rainfall (${reading.rain_mm}mm) detected. Prepare for potential flooding within 6-12 hours.`,
        message_hi: `बाढ़ चेतावनी: उच्च ज्वार (${reading.tide_m}m) और वर्षा (${reading.rain_mm}mm) देखी गई। 6-12 घंटों में संभावित बाढ़ के लिए तैयार रहें।`,
        location: {
          lat: reading.lat,
          lng: reading.lng,
        },
        status: 'active',
      });
    }

    // Check for Storm Surge Warning: Very high tide + High wind
    if (reading.tide_m >= this.thresholds.THRESHOLD_TIDE_WARNING && 
        reading.wind_kmh >= this.thresholds.THRESHOLD_WIND_WARNING) {
      alerts.push({
        created_at: currentTime,
        level: 'warning',
        type: 'storm_surge',
        message_en: `STORM SURGE WARNING: Critical tide levels (${reading.tide_m}m) with high winds (${reading.wind_kmh}km/h). Immediate action required!`,
        message_hi: `तूफानी लहर चेतावनी: गंभीर ज्वार स्तर (${reading.tide_m}m) और तेज हवाओं (${reading.wind_kmh}km/h) के साथ। तत्काल कार्रवाई आवश्यक!`,
        location: {
          lat: reading.lat,
          lng: reading.lng,
        },
        status: 'active',
      });
    }

    return alerts;
  }

  // Determine risk level based on current conditions
  getRiskLevel(reading: EnvironmentalReading): RiskLevel {
    // Warning level - highest priority
    if (reading.tide_m >= this.thresholds.THRESHOLD_TIDE_WARNING && 
        reading.wind_kmh >= this.thresholds.THRESHOLD_WIND_WARNING) {
      return RISK_LEVELS.warning;
    }

    // Watch level
    if (reading.tide_m >= this.thresholds.THRESHOLD_TIDE_WATCH && 
        reading.rain_mm >= this.thresholds.THRESHOLD_RAIN_WATCH) {
      return RISK_LEVELS.watch;
    }

    // Advisory level - any single threshold exceeded
    if (reading.tide_m >= this.thresholds.THRESHOLD_TIDE_WATCH ||
        reading.wind_kmh >= (this.thresholds.THRESHOLD_WIND_WARNING * 0.7) ||
        reading.rain_mm >= (this.thresholds.THRESHOLD_RAIN_WATCH * 0.7)) {
      return RISK_LEVELS.advisory;
    }

    return RISK_LEVELS.normal;
  }

  // Generate synthetic alerts for demo scenarios
  generateScenarioAlert(scenario: 'flood_watch' | 'storm_surge'): Alert {
    const currentTime = new Date().toISOString();
    const { lat, lng } = APP_CONFIG.MUMBAI_COORDS;

    if (scenario === 'flood_watch') {
      return {
        created_at: currentTime,
        level: 'watch',
        type: 'flood_watch',
        message_en: 'FLOOD WATCH: Simulated elevated tide and rainfall. Prepare for potential coastal flooding.',
        message_hi: 'बाढ़ चेतावनी: सिमुलेटेड उच्च ज्वार और वर्षा। तटीय बाढ़ की तैयारी करें।',
        location: { lat, lng },
        status: 'active',
      };
    } else {
      return {
        created_at: currentTime,
        level: 'warning',
        type: 'storm_surge',
        message_en: 'STORM SURGE WARNING: Simulated critical conditions with high winds and storm surge!',
        message_hi: 'तूफानी लहर चेतावनी: सिमुलेटेड गंभीर स्थिति तेज हवाओं के साथ!',
        location: { lat, lng },
        status: 'active',
      };
    }
  }
}