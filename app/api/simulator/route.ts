// Data simulator for generating sample environmental readings

import { NextResponse } from 'next/server';
import { EnvironmentalReading } from '@/lib/types';
import { APP_CONFIG } from '@/lib/config';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      count = 10, 
      scenario = 'normal',
      interval = 60, // seconds between readings
    } = body;

    const readings: EnvironmentalReading[] = [];
    const baseTime = new Date();
    const { lat, lng } = APP_CONFIG.MUMBAI_COORDS;

    // Add some geographical variance around Mumbai
    const latVariance = 0.1;  // ~11km variance
    const lngVariance = 0.1;  // ~11km variance

    for (let i = 0; i < count; i++) {
      const timestamp = new Date(baseTime.getTime() - (i * interval * 1000));
      
      // Generate reading based on scenario
      let reading: EnvironmentalReading;

      if (scenario === 'flood_watch') {
        // Generate data that will trigger flood watch alerts
        reading = generateFloodWatchData(timestamp, lat, lng, latVariance, lngVariance);
      } else if (scenario === 'storm_surge') {
        // Generate data that will trigger storm surge warnings
        reading = generateStormSurgeData(timestamp, lat, lng, latVariance, lngVariance);
      } else {
        // Generate normal environmental data
        reading = generateNormalData(timestamp, lat, lng, latVariance, lngVariance);
      }

      readings.push(reading);
    }

    // Reverse to chronological order (oldest first)
    readings.reverse();

    console.log(`🎲 [SIMULATOR] Generated ${count} readings for scenario: ${scenario}`);

    return NextResponse.json({ 
      success: true,
      readings,
      scenario,
      count: readings.length,
      message: `Generated ${readings.length} sample readings for ${scenario} scenario`
    });

  } catch (error) {
    console.error('❌ [SIMULATOR ERROR]:', error);
    return NextResponse.json({ 
      error: 'Failed to generate sample data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function generateNormalData(timestamp: Date, lat: number, lng: number, latVar: number, lngVar: number): EnvironmentalReading {
  return {
    timestamp: timestamp.toISOString(),
    lat: lat + (Math.random() - 0.5) * latVar,
    lng: lng + (Math.random() - 0.5) * lngVar,
    tide_m: 1.2 + Math.random() * 1.0,  // Normal tide: 1.2-2.2m
    wind_kmh: 15 + Math.random() * 25,  // Normal wind: 15-40 km/h
    temp_c: 26 + Math.random() * 6,     // Normal temp: 26-32°C
    rain_mm: Math.random() * 20,        // Light rain: 0-20mm
  };
}

function generateFloodWatchData(timestamp: Date, lat: number, lng: number, latVar: number, lngVar: number): EnvironmentalReading {
  return {
    timestamp: timestamp.toISOString(),
    lat: lat + (Math.random() - 0.5) * latVar,
    lng: lng + (Math.random() - 0.5) * lngVar,
    tide_m: 2.5 + Math.random() * 0.8,  // High tide: 2.5-3.3m (triggers watch)
    wind_kmh: 20 + Math.random() * 30,  // Moderate wind: 20-50 km/h
    temp_c: 27 + Math.random() * 4,     // Temp: 27-31°C
    rain_mm: 50 + Math.random() * 40,   // Heavy rain: 50-90mm (triggers watch)
  };
}

function generateStormSurgeData(timestamp: Date, lat: number, lng: number, latVar: number, lngVar: number): EnvironmentalReading {
  return {
    timestamp: timestamp.toISOString(),
    lat: lat + (Math.random() - 0.5) * latVar,
    lng: lng + (Math.random() - 0.5) * lngVar,
    tide_m: 3.2 + Math.random() * 0.8,  // Very high tide: 3.2-4.0m (triggers warning)
    wind_kmh: 60 + Math.random() * 40,  // High wind: 60-100 km/h (triggers warning)
    temp_c: 24 + Math.random() * 5,     // Storm temp: 24-29°C
    rain_mm: 30 + Math.random() * 60,   // Heavy rain: 30-90mm
  };
}

export async function GET() {
  return NextResponse.json({
    message: 'Data Simulator API - Use POST to generate sample data',
    parameters: {
      count: 'Number of readings to generate (default: 10)',
      scenario: 'Data scenario: normal, flood_watch, storm_surge (default: normal)',
      interval: 'Seconds between readings (default: 60)',
    },
    examples: {
      normal: 'POST /api/simulator with {"count": 20, "scenario": "normal"}',
      flood_watch: 'POST /api/simulator with {"scenario": "flood_watch", "count": 15}',
      storm_surge: 'POST /api/simulator with {"scenario": "storm_surge", "count": 10}',
    }
  });
}