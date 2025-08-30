// API route for managing alerts and scenarios

import { NextResponse } from 'next/server';
import { db } from 'cosmic-database';
import { AnomalyDetector } from '@/lib/rules';
import { alertService } from '@/lib/alert-services';

const anomalyDetector = new AnomalyDetector();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';
    const limit = parseInt(searchParams.get('limit') || '50');
    
    // Get all alerts and filter client-side to avoid composite index
    const snapshot = await db.collection('alerts')
      .orderBy('createdAt', 'desc')
      .limit(limit * 2) // Get more to account for filtering
      .get();

    // Filter by status client-side
    const alerts = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((alert: any) => alert.status === status)
      .slice(0, limit);

    return NextResponse.json({ 
      alerts,
      count: alerts.length,
      status,
      message: `Retrieved ${alerts.length} ${status} alerts`
    });

  } catch (error) {
    console.error('❌ [ALERTS FETCH ERROR]:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch alerts',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { scenario, action } = body;

    if (action === 'clear') {
      // Get all alerts and filter client-side to avoid composite index
      const allAlertsSnapshot = await db.collection('alerts')
        .orderBy('createdAt', 'desc')
        .limit(100)
        .get();

      // Filter active alerts client-side
      const activeAlerts = allAlertsSnapshot.docs.filter(doc => {
        const data = doc.data();
        return data.status === 'active';
      });

      if (activeAlerts.length > 0) {
        const batch = db.batch();
        activeAlerts.forEach(doc => {
          batch.update(doc.ref, { 
            status: 'cleared',
            updatedAt: db.FieldValue.serverTimestamp()
          });
        });
        await batch.commit();
      }

      console.log(`🧹 [ALERTS CLEARED] ${activeAlerts.length} alerts cleared`);
      
      return NextResponse.json({ 
        success: true,
        cleared: activeAlerts.length,
        message: `Cleared ${activeAlerts.length} active alerts`
      });
    }

    if (scenario && ['flood_watch', 'storm_surge'].includes(scenario)) {
      // Generate scenario alert
      const alert = anomalyDetector.generateScenarioAlert(scenario as 'flood_watch' | 'storm_surge');
      
      // Save to database
      const alertData = {
        ...alert,
        createdAt: db.FieldValue.serverTimestamp(),
        updatedAt: db.FieldValue.serverTimestamp(),
      };
      
      const docRef = await db.collection('alerts').add(alertData);
      alertData.id = docRef.id;

      // Send alert notifications
      await alertService.sendAlert(alertData);

      console.log(`🎭 [SCENARIO TRIGGERED] ${scenario} alert generated`);

      return NextResponse.json({ 
        success: true,
        alert: alertData,
        scenario,
        message: `${scenario} scenario triggered successfully`
      });
    }

    return NextResponse.json({ 
      error: 'Invalid request. Provide either scenario (flood_watch/storm_surge) or action (clear)' 
    }, { status: 400 });

  } catch (error) {
    console.error('❌ [ALERTS POST ERROR]:', error);
    return NextResponse.json({ 
      error: 'Failed to process alert request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const alertId = searchParams.get('id');
    
    if (!alertId) {
      return NextResponse.json({ error: 'Alert ID required' }, { status: 400 });
    }

    // Update alert status to cleared
    await db.collection('alerts').doc(alertId).update({
      status: 'cleared',
      updatedAt: db.FieldValue.serverTimestamp()
    });

    console.log(`🗑️ [ALERT CLEARED] Alert ${alertId} manually cleared`);

    return NextResponse.json({ 
      success: true,
      alertId,
      message: 'Alert cleared successfully'
    });

  } catch (error) {
    console.error('❌ [ALERT DELETE ERROR]:', error);
    return NextResponse.json({ 
      error: 'Failed to clear alert',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}