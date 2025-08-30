// Server-Sent Events stream for real-time updates

import { NextResponse } from 'next/server';
import { db } from 'cosmic-database';
import { EnvironmentalReading, Alert, StreamData } from '@/lib/types';

export async function GET() {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      console.log('📡 [STREAM] Client connected to real-time feed');
      
      // Send initial connection message
      const initialData: StreamData = {
        timestamp: new Date().toISOString(),
      };
      
      const data = `data: ${JSON.stringify(initialData)}\n\n`;
      controller.enqueue(encoder.encode(data));

      // Set up polling for updates every 3 seconds
      const interval = setInterval(async () => {
        try {
          // Check if controller is still open
          if (!controller.desiredSize || controller.desiredSize <= 0) {
            clearInterval(interval);
            return;
          }

          // Get latest reading
          const readingsSnapshot = await db.collection('readings')
            .orderBy('createdAt', 'desc')
            .limit(1)
            .get();

          // Get all alerts and filter client-side to avoid composite index
          const allAlertsSnapshot = await db.collection('alerts')
            .orderBy('createdAt', 'desc')
            .limit(20)
            .get();

          // Filter active alerts client-side
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const activeAlerts = allAlertsSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter((alert: any) => alert.status === 'active')
            .slice(0, 5);

          const streamData: StreamData = {
            timestamp: new Date().toISOString(),
          };

          if (!readingsSnapshot.empty) {
            const latestReading = readingsSnapshot.docs[0];
            streamData.reading = {
              id: latestReading.id,
              ...latestReading.data()
            } as EnvironmentalReading;
          }

          if (activeAlerts.length > 0) {
            streamData.new_alerts = activeAlerts as Alert[];
          }

          const message = `data: ${JSON.stringify(streamData)}\n\n`;
          controller.enqueue(encoder.encode(message));
          
        } catch (error) {
          console.error('❌ [STREAM ERROR]:', error);
          
          // Only send error if controller is still open
          try {
            if (controller.desiredSize && controller.desiredSize > 0) {
              const errorData = {
                error: 'Stream error occurred',
                timestamp: new Date().toISOString(),
              };
              const errorMessage = `data: ${JSON.stringify(errorData)}\n\n`;
              controller.enqueue(encoder.encode(errorMessage));
            }
          } catch {
            // Controller is already closed, clear interval and exit
            clearInterval(interval);
          }
        }
      }, 3000); // Poll every 3 seconds

      // Clean up on disconnect
      const cleanup = () => {
        clearInterval(interval);
        console.log('📡 [STREAM] Client disconnected');
      };

      // Store cleanup function for potential use
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (cleanup as any).interval = interval;
    },
    
    cancel() {
      console.log('📡 [STREAM] Stream cancelled by client');
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}