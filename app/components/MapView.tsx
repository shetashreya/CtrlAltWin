'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { EnvironmentalReading, Alert, RiskLevel } from '@/lib/types';
import { RISK_LEVELS, APP_CONFIG } from '@/lib/config';
import { AnomalyDetector } from '@/lib/rules';

// Fix for default markers in Leaflet
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  readings: EnvironmentalReading[];
  alerts: Alert[];
  className?: string;
}

interface MapControllerProps {
  center: [number, number];
}

// Component to control map programmatically
function MapController({ center }: MapControllerProps) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [map, center]);
  
  return null;
}

export function MapView({ readings, alerts, className = '' }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const [mapCenter] = useState<[number, number]>([APP_CONFIG.MUMBAI_COORDS.lat, APP_CONFIG.MUMBAI_COORDS.lng]);
  const anomalyDetector = useRef(new AnomalyDetector()).current;

  // Get risk level for a reading
  const getRiskLevel = (reading: EnvironmentalReading): RiskLevel => {
    return anomalyDetector.getRiskLevel(reading);
  };

  // Get color based on risk level
  const getMarkerColor = (reading: EnvironmentalReading): string => {
    const risk = getRiskLevel(reading);
    return risk.color;
  };

  // Format timestamp for display
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: APP_CONFIG.TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  return (
    <div className={`relative ${className}`}>
      <MapContainer
        center={mapCenter}
        zoom={11}
        className="h-full w-full rounded-lg"
        zoomControl={true}
        scrollWheelZoom={true}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref={mapRef as any}
      >
        <MapController center={mapCenter} />
        
        {/* Base tile layer */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Environmental readings markers */}
        {readings.slice(0, 50).map((reading) => (
          <CircleMarker
            key={`reading-${reading.id || reading.timestamp}`}
            center={[reading.lat, reading.lng]}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            radius={8 as any}
            fillColor={getMarkerColor(reading)}
            color="white"
            weight={2}
            opacity={0.9}
            fillOpacity={0.7}
          >
            <Popup>
              <div className="p-2 min-w-48">
                <div className="font-semibold text-slate-800 mb-2">
                  Environmental Reading
                </div>
                <div className="space-y-1 text-sm">
                  <div><span className="font-medium">Time:</span> {formatTime(reading.timestamp)}</div>
                  <div><span className="font-medium">Tide:</span> {reading.tide_m.toFixed(2)}m</div>
                  <div><span className="font-medium">Wind:</span> {reading.wind_kmh.toFixed(1)} km/h</div>
                  <div><span className="font-medium">Temperature:</span> {reading.temp_c.toFixed(1)}°C</div>
                  <div><span className="font-medium">Rainfall:</span> {reading.rain_mm.toFixed(1)}mm</div>
                  <div className="pt-2">
                    <div 
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: getMarkerColor(reading) }}
                    >
                      {getRiskLevel(reading).level.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
        
        {/* Active alerts markers */}
        {alerts.filter(alert => alert.status === 'active').map((alert) => (
          <CircleMarker
            key={`alert-${alert.id}`}
            center={[alert.location.lat, alert.location.lng]}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            radius={15 as any}
            fillColor={RISK_LEVELS[alert.level].color}
            color="white"
            weight={3}
            opacity={1}
            fillOpacity={0.8}
            className="animate-pulse"
          >
            <Popup>
              <div className="p-3 min-w-56">
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: RISK_LEVELS[alert.level].color }}
                  ></div>
                  <div className="font-semibold text-slate-800 uppercase">
                    {alert.level} Alert
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="font-medium text-slate-700">{alert.type.replace('_', ' ').toUpperCase()}</div>
                  <div className="text-slate-600">{alert.message_en}</div>
                  <div className="text-xs text-slate-500">
                    {formatTime(alert.created_at)}
                  </div>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
      
      {/* Map legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className="text-sm font-medium text-slate-800 mb-2">Risk Levels</div>
        <div className="space-y-1">
          {Object.values(RISK_LEVELS).map((risk) => (
            <div key={risk.level} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: risk.color }}
              ></div>
              <div className="text-xs text-slate-700 capitalize">{risk.level}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}