'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { Alert } from '@/lib/types';
import { RISK_LEVELS, APP_CONFIG } from '@/lib/config';

interface AlertsPanelProps {
  alerts: Alert[];
  onClearAlert?: (alertId: string) => void;
  onClearAll?: () => void;
  className?: string;
}

export function AlertsPanel({ alerts, onClearAlert, onClearAll, className = '' }: AlertsPanelProps) {
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  
  // Filter active alerts and sort by priority/timestamp
  const activeAlerts = alerts
    .filter(alert => alert.status === 'active')
    .sort((a, b) => {
      const aPriority = RISK_LEVELS[a.level].priority;
      const bPriority = RISK_LEVELS[b.level].priority;
      if (aPriority !== bPriority) return bPriority - aPriority; // Higher priority first
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); // Newer first
    });

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat(language === 'hi' ? 'hi-IN' : 'en-IN', {
      timeZone: APP_CONFIG.TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short',
    }).format(date);
  };

  const getAlertIcon = (type: string, level: string) => {
    if (type === 'flood_watch') return 'mdi:water-alert';
    if (type === 'storm_surge') return 'mdi:weather-hurricane';
    return level === 'warning' ? 'mdi:alert' : 'mdi:alert-outline';
  };

  const getLevelBadgeColor = (level: string) => {
    const colors = {
      advisory: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      watch: 'bg-orange-100 text-orange-800 border-orange-200',
      warning: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-slate-200 ${className}`}>
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon icon="mdi:alert-circle" className="w-5 h-5 text-slate-600" />
            <h3 className="font-semibold text-slate-800">
              Active Alerts ({activeAlerts.length})
            </h3>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  language === 'en' 
                    ? 'bg-white text-slate-800 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  language === 'hi' 
                    ? 'bg-white text-slate-800 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                हिंदी
              </button>
            </div>
            
            {/* Clear All Button */}
            {activeAlerts.length > 0 && onClearAll && (
              <button
                onClick={onClearAll}
                className="px-3 py-1 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        <AnimatePresence>
          {activeAlerts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6 text-center"
            >
              <Icon icon="mdi:shield-check" className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <p className="text-slate-600 font-medium">
                {language === 'en' ? 'All Clear' : 'सब साफ'}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {language === 'en' 
                  ? 'No active threats detected' 
                  : 'कोई सक्रिय खतरा नहीं मिला'
                }
              </p>
            </motion.div>
          ) : (
            activeAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 border-b border-slate-100 last:border-b-0"
              >
                <div className="flex items-start gap-3">
                  {/* Alert Icon */}
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: RISK_LEVELS[alert.level].color }}
                  >
                    <Icon 
                      icon={getAlertIcon(alert.type, alert.level)} 
                      className="w-4 h-4 text-white" 
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Alert Header */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getLevelBadgeColor(alert.level)}`}>
                        {alert.level.toUpperCase()}
                      </div>
                      <div className="text-xs text-slate-500">
                        {formatTime(alert.created_at)}
                      </div>
                    </div>

                    {/* Alert Message */}
                    <p className="text-sm text-slate-800 leading-relaxed mb-2">
                      {language === 'en' ? alert.message_en : alert.message_hi}
                    </p>

                    {/* Alert Type */}
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-slate-500 uppercase tracking-wide">
                        {alert.type.replace('_', ' ')}
                      </div>
                      
                      {/* Clear Button */}
                      {onClearAlert && (
                        <button
                          onClick={() => onClearAlert(alert.id!)}
                          className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                          title={language === 'en' ? 'Clear Alert' : 'अलर्ट साफ करें'}
                        >
                          <Icon icon="mdi:close" className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Alert Summary Footer */}
      {activeAlerts.length > 0 && (
        <div className="p-3 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <div>
              {language === 'en' 
                ? `${activeAlerts.filter(a => a.level === 'warning').length} Warnings, ${activeAlerts.filter(a => a.level === 'watch').length} Watches`
                : `${activeAlerts.filter(a => a.level === 'warning').length} चेतावनियां, ${activeAlerts.filter(a => a.level === 'watch').length} निगरानी`
              }
            </div>
            <div>
              {language === 'en' ? 'Stay alert and follow safety protocols' : 'सतर्क रहें और सुरक्षा नियमों का पालन करें'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}