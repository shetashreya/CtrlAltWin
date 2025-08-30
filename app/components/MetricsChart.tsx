'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { EnvironmentalReading } from '@/lib/types';
import { getThresholds } from '@/lib/config';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler
);

interface MetricsChartProps {
  readings: EnvironmentalReading[];
  metric: 'tide_m' | 'wind_kmh' | 'temp_c' | 'rain_mm';
  title: string;
  unit: string;
  className?: string;
}

export function MetricsChart({ readings, metric, title, unit, className = '' }: MetricsChartProps) {
  const thresholds = getThresholds();

  // Sort readings by timestamp
  const sortedReadings = [...readings].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Take only the last 60 readings for performance
  const recentReadings = sortedReadings.slice(-60);

  // Prepare chart data
  const chartData = {
    labels: recentReadings.map(reading => new Date(reading.timestamp)),
    datasets: [
      {
        label: title,
        data: recentReadings.map(reading => reading[metric]),
        borderColor: getMetricColor(metric),
        backgroundColor: getMetricColor(metric, 0.1),
        borderWidth: 2,
        fill: true,
        tension: 0.2,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: getMetricColor(metric),
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
      },
      // Add threshold line if applicable
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...getThresholdDataset(metric, recentReadings.length, thresholds as any),
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: '#475569',
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: title,
        color: '#1e293b',
        font: {
          size: 14,
          weight: '600' as const,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: getMetricColor(metric),
        borderWidth: 1,
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: function(context: any) {
            return `${context.dataset.label}: ${context.formattedValue}${unit}`;
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          afterLabel: function(context: any) {
            // Add threshold information in tooltip
            if (context.datasetIndex === 0) { // Only for main data line
              const value = context.parsed.y;
              const warning = getThresholdWarning(metric, value, thresholds);
              return warning ? [`⚠️ ${warning}`] : [];
            }
            return [];
          }
        },
      },
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          displayFormats: {
            minute: 'HH:mm',
            hour: 'HH:mm',
          },
        },
        title: {
          display: true,
          text: 'Time (IST)',
          color: '#64748b',
        },
        grid: {
          color: '#e2e8f0',
        },
        ticks: {
          color: '#64748b',
          maxTicksLimit: 8,
        },
      },
      y: {
        beginAtZero: metric !== 'temp_c', // Temperature can be negative
        title: {
          display: true,
          text: `${title} (${unit})`,
          color: '#64748b',
        },
        grid: {
          color: '#e2e8f0',
        },
        ticks: {
          color: '#64748b',
        },
      },
    },
    elements: {
      point: {
        hoverBackgroundColor: '#ffffff',
      },
    },
  };

  return (
    <div className={`bg-white rounded-lg p-4 shadow-sm border border-slate-200 ${className}`}>
      <div className="h-64">
        <Line data={chartData} options={options} />
      </div>
      
      {/* Current value display */}
      {recentReadings.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">Current</div>
            <div className="flex items-center gap-2">
              <div className="text-lg font-semibold text-slate-800">
                {recentReadings[recentReadings.length - 1][metric].toFixed(1)}{unit}
              </div>
              {getStatusIndicator(metric, recentReadings[recentReadings.length - 1][metric], thresholds)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Get color for each metric
function getMetricColor(metric: string, alpha = 1): string {
  const colors = {
    tide_m: `rgba(59, 130, 246, ${alpha})`,     // Blue
    wind_kmh: `rgba(16, 185, 129, ${alpha})`,   // Green
    temp_c: `rgba(245, 158, 11, ${alpha})`,     // Yellow/Orange
    rain_mm: `rgba(139, 92, 246, ${alpha})`,    // Purple
  };
  return colors[metric as keyof typeof colors] || `rgba(107, 114, 128, ${alpha})`;
}

// Get threshold datasets for overlay
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getThresholdDataset(metric: string, dataLength: number, thresholds: any): any[] {
  const datasets = [];
  
  if (metric === 'tide_m') {
    // Tide watch threshold
    datasets.push({
      label: 'Watch Threshold',
      data: Array(dataLength).fill(thresholds.THRESHOLD_TIDE_WATCH),
      borderColor: '#F59E0B',
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderDash: [5, 5],
      pointRadius: 0,
      fill: false,
    });
    
    // Tide warning threshold
    datasets.push({
      label: 'Warning Threshold',
      data: Array(dataLength).fill(thresholds.THRESHOLD_TIDE_WARNING),
      borderColor: '#EF4444',
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderDash: [10, 5],
      pointRadius: 0,
      fill: false,
    });
  }
  
  if (metric === 'wind_kmh') {
    datasets.push({
      label: 'Warning Threshold',
      data: Array(dataLength).fill(thresholds.THRESHOLD_WIND_WARNING),
      borderColor: '#EF4444',
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderDash: [10, 5],
      pointRadius: 0,
      fill: false,
    });
  }
  
  if (metric === 'rain_mm') {
    datasets.push({
      label: 'Watch Threshold',
      data: Array(dataLength).fill(thresholds.THRESHOLD_RAIN_WATCH),
      borderColor: '#F59E0B',
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderDash: [5, 5],
      pointRadius: 0,
      fill: false,
    });
  }
  
  return datasets;
}

// Get threshold warning message
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getThresholdWarning(metric: string, value: number, thresholds: any): string | null {
  if (metric === 'tide_m') {
    if (value >= thresholds.THRESHOLD_TIDE_WARNING) return 'Above Warning Level';
    if (value >= thresholds.THRESHOLD_TIDE_WATCH) return 'Above Watch Level';
  }
  
  if (metric === 'wind_kmh' && value >= thresholds.THRESHOLD_WIND_WARNING) {
    return 'Above Warning Level';
  }
  
  if (metric === 'rain_mm' && value >= thresholds.THRESHOLD_RAIN_WATCH) {
    return 'Above Watch Level';
  }
  
  return null;
}

// Get status indicator for current value
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getStatusIndicator(metric: string, value: number, thresholds: any) {
  const warning = getThresholdWarning(metric, value, thresholds);
  
  if (!warning) return null;
  
  const isWarning = warning.includes('Warning');
  
  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
      isWarning ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
    }`}>
      {isWarning ? '⚠️' : '⚡'} {warning}
    </div>
  );
}