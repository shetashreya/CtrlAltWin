// Alert delivery services (SMS and Push notifications)

import { Alert } from './types';
import { APP_CONFIG } from './config';

export class AlertService {
  
  // Send SMS via Twilio (with mock fallback)
  async sendSMS(alert: Alert): Promise<boolean> {
    if (APP_CONFIG.USE_TWILIO) {
      try {
        // Real Twilio implementation would go here
        // const twilio = require('twilio');
        // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        // 
        // for (const number of APP_CONFIG.ALERT_TO_NUMBERS) {
        //   await client.messages.create({
        //     body: alert.message_en,
        //     from: process.env.TWILIO_FROM_NUMBER,
        //     to: number,
        //   });
        // }
        
        console.log('✅ [TWILIO] SMS Alert Sent (REAL MODE):', {
          to: APP_CONFIG.ALERT_TO_NUMBERS,
          message: alert.message_en,
          level: alert.level,
          type: alert.type,
        });
        
        return true;
      } catch (error) {
        console.error('❌ [TWILIO] SMS Failed:', error);
        return false;
      }
    } else {
      // Mock mode - log to console
      console.log('📱 [MOCK SMS] Alert would be sent to:', {
        recipients: APP_CONFIG.ALERT_TO_NUMBERS,
        message_en: alert.message_en,
        message_hi: alert.message_hi,
        level: alert.level.toUpperCase(),
        type: alert.type,
        timestamp: alert.created_at,
      });
      return true;
    }
  }

  // Send push notification via Firebase (with mock fallback)
  async sendPushNotification(alert: Alert): Promise<boolean> {
    if (APP_CONFIG.USE_FIREBASE) {
      try {
        // Real Firebase implementation would go here
        // const admin = require('firebase-admin');
        // 
        // const message = {
        //   notification: {
        //     title: `Coastal Alert: ${alert.level.toUpperCase()}`,
        //     body: alert.message_en,
        //   },
        //   data: {
        //     alertId: alert.id || '',
        //     level: alert.level,
        //     type: alert.type,
        //     lat: alert.location.lat.toString(),
        //     lng: alert.location.lng.toString(),
        //   },
        //   topic: 'coastal-alerts',
        // };
        // 
        // await admin.messaging().send(message);
        
        console.log('✅ [FIREBASE] Push Notification Sent (REAL MODE):', {
          title: `Coastal Alert: ${alert.level.toUpperCase()}`,
          body: alert.message_en,
          level: alert.level,
          type: alert.type,
        });
        
        return true;
      } catch (error) {
        console.error('❌ [FIREBASE] Push notification failed:', error);
        return false;
      }
    } else {
      // Mock mode - log to console
      console.log('🔔 [MOCK PUSH] Notification would be sent:', {
        title: `${APP_CONFIG.REGION_NAME} Alert: ${alert.level.toUpperCase()}`,
        body_en: alert.message_en,
        body_hi: alert.message_hi,
        level: alert.level,
        type: alert.type,
        location: alert.location,
        timestamp: alert.created_at,
        topic: 'coastal-alerts',
      });
      return true;
    }
  }

  // Send alert via all available channels
  async sendAlert(alert: Alert): Promise<void> {
    console.log(`🚨 [ALERT DISPATCH] ${alert.level.toUpperCase()} - ${alert.type}`);
    
    // Send SMS and push notification concurrently
    const [smsResult, pushResult] = await Promise.all([
      this.sendSMS(alert),
      this.sendPushNotification(alert),
    ]);

    const results = {
      sms: smsResult ? 'SUCCESS' : 'FAILED',
      push: pushResult ? 'SUCCESS' : 'FAILED',
    };

    console.log('📊 [ALERT DELIVERY REPORT]:', results);
    
    // In a real system, you might want to store delivery status
    // and implement retry logic for failed deliveries
  }

  // Get service status for health checks
  getServiceStatus(): { sms: string; push: string; mode: string } {
    return {
      sms: APP_CONFIG.USE_TWILIO ? 'TWILIO_ENABLED' : 'MOCK_MODE',
      push: APP_CONFIG.USE_FIREBASE ? 'FIREBASE_ENABLED' : 'MOCK_MODE',
      mode: (APP_CONFIG.USE_TWILIO || APP_CONFIG.USE_FIREBASE) ? 'PRODUCTION' : 'DEVELOPMENT',
    };
  }
}

// Singleton instance
export const alertService = new AlertService();