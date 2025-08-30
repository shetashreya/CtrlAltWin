// API route for ingesting environmental data

import { NextResponse } from 'next/server';
import { db } from 'cosmic-database';
import { EnvironmentalReading, Alert } from '@/lib/types';
import { AnomalyDetector } from '@/lib/rules';
import { alertService } from '@/lib/alert-services';

const anomalyDetector = new AnomalyDetector();

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Handle single reading or batch
    const readings = Array.isArray(data) ? data : [data];
    const allAlerts: Alert[] = [];
    const savedReadings: string[] = [];

    for (const readingData of readings) {
      // Validate required fields
      const requiredFields = ['timestamp', 'lat', 'lng', 'tide_m', 'wind_kmh', 'temp_c', 'rain_mm'];
      for (const field of requiredFields) {
        if (!(field in readingData)) {
          return NextResponse.json({ 
            error: `Missing required field: ${field}` 
          }, { status: 400 });
        }
      }

      // Create reading document
      const reading: EnvironmentalReading = {
        ...readingData,
        createdAt: db.FieldValue.serverTimestamp(),
        updatedAt: db.FieldValue.serverTimestamp(),
      };

      // Save to database
      const docRef = await db.collection('readings').add(reading);
      savedReadings.push(docRef.id);

      // Run anomaly detection
      const alerts = anomalyDetector.analyzeReading(reading);
      
      if (alerts.length > 0) {
        // Save alerts to database and send notifications
        for (const alert of alerts) {
          const alertData = {
            ...alert,
            createdAt: db.FieldValue.serverTimestamp(),
            updatedAt: db.FieldValue.serverTimestamp(),
          };
          
          const alertRef = await db.collection('alerts').add(alertData);
          alertData.id = alertRef.id;
          allAlerts.push(alertData);

          // Send alert notifications
          await alertService.sendAlert(alertData);
        }
      }
    }

    // Log ingestion
    console.log(`📈 [DATA INGESTION] Processed ${readings.length} readings, Generated ${allAlerts.length} alerts`);

    return NextResponse.json({ 
      success: true,
      ingested: savedReadings.length,
      alerts: allAlerts,
      message: `Successfully processed ${readings.length} environmental readings`
    });

  } catch (error) {
    console.error('❌ [INGEST ERROR]:', error);
    return NextResponse.json({ 
      error: 'Failed to process environmental data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    
    // Get recent readings
    const snapshot = await db.collection('readings')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    const readings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ 
      readings,
      count: readings.length,
      message: `Retrieved ${readings.length} recent readings`
    });

  } catch (error) {
    console.error('❌ [READINGS FETCH ERROR]:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch readings',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}