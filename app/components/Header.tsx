'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { Alert } from '@/lib/types';
import { APP_CONFIG, RISK_LEVELS } from '@/lib/config';

interface HeaderProps {
  alerts: Alert[];
  isConnected: boolean;
  className?: string;
}

export function Header({ alerts, isConnected, className = '' }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Get the highest priority active alert
  const getSystemStatus = () => {
    const activeAlerts = alerts.filter(alert => alert.status === 'active');
    
    if (activeAlerts.length === 0) {
      return { level: 'normal', count: 0, color: RISK_LEVELS.normal.color };
    }

    // Sort by priority (warning > watch > advisory)
    const sortedAlerts = activeAlerts.sort((a, b) => 
      RISK_LEVELS[b.level].priority - RISK_LEVELS[a.level].priority
    );

    const highestAlert = sortedAlerts[0];
    return { 
      level: highestAlert.level, 
      count: activeAlerts.length, 
      color: RISK_LEVELS[highestAlert.level].color 
    };
  };

  const status = getSystemStatus();

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: APP_CONFIG.TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const getStatusText = (level: string) => {
    const texts = {
      normal: 'All Systems Normal',
      advisory: 'Advisory Conditions',
      watch: 'Watch Issued',
      warning: 'Warning Active'
    };
    return texts[level as keyof typeof texts] || 'Unknown Status';
  };

  return (
    <header className={`bg-white border-b border-slate-200 ${className}`}>
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Title and Location */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Icon icon="mdi:wave" className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">
                  Coastal Threat Alert System
                </h1>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Icon icon="mdi:map-marker" className="w-4 h-4" />
                  <span>{APP_CONFIG.REGION_NAME}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Status and Time */}
          <div className="flex items-center gap-6">
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs text-slate-600">
                {isConnected ? 'Live Data' : 'Disconnected'}
              </span>
            </div>

            {/* System Status */}
            <motion.div 
              className="flex items-center gap-3"
              animate={{ scale: status.level !== 'normal' ? [1, 1.02, 1] : 1 }}
              transition={{ duration: 2, repeat: status.level !== 'normal' ? Infinity : 0 }}
            >
              <div className="text-right">
                <div className="text-xs text-slate-500">System Status</div>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: status.color }}
                  ></div>
                  <span className="text-sm font-medium text-slate-800">
                    {getStatusText(status.level)}
                  </span>
                  {status.count > 0 && (
                    <div 
                      className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white rounded-full"
                      style={{ backgroundColor: status.color }}
                    >
                      {status.count}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Current Time */}
            <div className="text-right border-l border-slate-200 pl-6">
              <div className="text-xs text-slate-500">
                {APP_CONFIG.TIMEZONE.replace('/', ' / ')}
              </div>
              <div className="text-sm font-mono font-medium text-slate-800">
                {formatTime(currentTime)}
              </div>
            </div>
          </div>
        </div>

        {/* Alert Banner */}
        {status.level !== 'normal' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-3 rounded-lg border-l-4 ${
              status.level === 'warning' 
                ? 'bg-red-50 border-red-400 text-red-800'
                : status.level === 'watch'
                ? 'bg-orange-50 border-orange-400 text-orange-800'
                : 'bg-yellow-50 border-yellow-400 text-yellow-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <Icon 
                icon={status.level === 'warning' ? 'mdi:alert' : 'mdi:alert-outline'} 
                className="w-5 h-5" 
              />
              <div className="font-medium">
                {status.count} active alert{status.count !== 1 ? 's' : ''} require attention
              </div>
              <div className="ml-auto text-xs opacity-75">
                Check the alerts panel for details
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </header>
  );
}