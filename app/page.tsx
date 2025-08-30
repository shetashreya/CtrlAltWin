'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { Header } from './components/Header';
import { MapViewWrapper } from './components/MapViewWrapper';
import { MetricsChart } from './components/MetricsChart';
import { AlertsPanel } from './components/AlertsPanel';
import { EnvironmentalReading, Alert } from '@/lib/types';

function Dashboard() {
  const [readings, setReadings] = useState<EnvironmentalReading[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    loadInitialData();
    
    // Set up periodic refresh instead of SSE for now
    const interval = setInterval(() => {
      refreshData();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const loadInitialData = async () => {
    try {
      // Load recent readings
      const readingsResponse = await fetch('/api/ingest?limit=100');
      if (readingsResponse.ok) {
        const readingsData = await readingsResponse.json();
        setReadings(readingsData.readings || []);
      }

      // Load active alerts
      const alertsResponse = await fetch('/api/alerts?status=active');
      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        setAlerts(alertsData.alerts || []);
      }

      setIsConnected(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load initial data:', error);
      setIsConnected(false);
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      const [readingsResponse, alertsResponse] = await Promise.all([
        fetch('/api/ingest?limit=100'),
        fetch('/api/alerts?status=active')
      ]);

      if (readingsResponse.ok) {
        const readingsData = await readingsResponse.json();
        setReadings(readingsData.readings || []);
      }

      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        setAlerts(alertsData.alerts || []);
      }

      setIsConnected(true);
    } catch (error) {
      console.error('Failed to refresh data:', error);
      setIsConnected(false);
    }
  };

  const handleTriggerScenario = async (scenario: 'flood_watch' | 'storm_surge') => {
    try {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario }),
      });

      if (response.ok) {
        const data = await response.json();
        setAlerts(prev => [...prev, data.alert]);
      }
    } catch (error) {
      console.error(`Failed to trigger ${scenario}:`, error);
    }
  };

  const handleClearAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/alerts?id=${alertId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAlerts(prev => prev.map(alert => 
          alert.id === alertId ? { ...alert, status: 'cleared' as const } : alert
        ));
      }
    } catch (error) {
      console.error('Failed to clear alert:', error);
    }
  };

  const handleClearAllAlerts = async () => {
    try {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear' }),
      });

      if (response.ok) {
        setAlerts(prev => prev.map(alert => ({ ...alert, status: 'cleared' as const })));
      }
    } catch (error) {
      console.error('Failed to clear all alerts:', error);
    }
  };

  const handleGenerateTestData = async (scenario: 'normal' | 'flood_watch' | 'storm_surge') => {
    try {
      // Generate test data
      const simResponse = await fetch('/api/simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 10, scenario }),
      });

      if (simResponse.ok) {
        const simData = await simResponse.json();
        
        // Ingest the generated data
        const ingestResponse = await fetch('/api/ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(simData.readings),
        });

        if (ingestResponse.ok) {
          console.log(`✅ Generated and ingested test data for ${scenario} scenario`);
          // Refresh data
          setTimeout(() => refreshData(), 1000);
        }
      }
    } catch (error) {
      console.error('Failed to generate test data:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading Coastal Threat Alert System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header 
        alerts={alerts} 
        isConnected={isConnected} 
      />

      <main className="p-6 space-y-6">
        {/* Demo Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-4 shadow-sm border border-slate-200"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Icon icon="mdi:play-circle" className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-slate-800">Demo Controls</span>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handleGenerateTestData('normal')}
                className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
              >
                Generate Normal Data
              </button>
              
              <button
                onClick={() => handleTriggerScenario('flood_watch')}
                className="px-3 py-1 text-sm bg-orange-100 text-orange-800 rounded-lg hover:bg-orange-200 transition-colors"
              >
                Trigger Flood Watch
              </button>
              
              <button
                onClick={() => handleTriggerScenario('storm_surge')}
                className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
              >
                Trigger Storm Surge
              </button>
              
              <button
                onClick={() => handleGenerateTestData('storm_surge')}
                className="px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition-colors"
              >
                Generate Storm Data
              </button>
            </div>
          </div>
        </motion.div>

        {/* Main Dashboard Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Map and Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden"
            >
              <div className="p-4 border-b border-slate-200">
                <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                  <Icon icon="mdi:map" className="w-5 h-5" />
                  Environmental Monitoring Map
                </h2>
              </div>
              <div className="h-96">
                <MapViewWrapper 
                  readings={readings} 
                  alerts={alerts}
                  className="h-full w-full" 
                />
              </div>
            </motion.div>

            {/* Charts Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <MetricsChart
                  readings={readings}
                  metric="tide_m"
                  title="Tide Level"
                  unit="m"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <MetricsChart
                  readings={readings}
                  metric="wind_kmh"
                  title="Wind Speed"
                  unit="km/h"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <MetricsChart
                  readings={readings}
                  metric="temp_c"
                  title="Temperature"
                  unit="°C"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <MetricsChart
                  readings={readings}
                  metric="rain_mm"
                  title="Rainfall"
                  unit="mm"
                />
              </motion.div>
            </div>
          </div>

          {/* Right Column - Alerts Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-1"
          >
            <AlertsPanel
              alerts={alerts}
              onClearAlert={handleClearAlert}
              onClearAll={handleClearAllAlerts}
              className="sticky top-6"
            />
          </motion.div>
        </div>

        {/* System Status Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-lg p-4 shadow-sm border border-slate-200"
        >
          <div className="flex items-center justify-between text-sm text-slate-600">
            <div className="flex items-center gap-4">
              <div>Total Readings: {readings.length}</div>
              <div>Active Alerts: {alerts.filter(a => a.status === 'active').length}</div>
              <div className={`flex items-center gap-1 ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                {isConnected ? 'Connected' : 'Connecting...'}
              </div>
            </div>
            <div className="text-xs text-slate-500">
              Coastal Threat Alert System v1.0 - Hackathon MVP
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading Dashboard...</p>
        </div>
      </div>
    }>
      <Dashboard />
    </Suspense>
  );
}