'use client';

import dynamic from 'next/dynamic';
import { EnvironmentalReading, Alert } from '@/lib/types';

interface MapViewWrapperProps {
  readings: EnvironmentalReading[];
  alerts: Alert[];
  className?: string;
}

const MapView = dynamic(() => import('./MapView').then(mod => ({ default: mod.MapView })), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-blue-600 font-medium">Loading Map...</p>
      </div>
    </div>
  ),
});

export function MapViewWrapper({ readings, alerts, className }: MapViewWrapperProps) {
  return <MapView readings={readings} alerts={alerts} className={className} />;
}