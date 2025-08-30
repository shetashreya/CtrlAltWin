# Coastal Threat Alert System 🌊

**AI-powered early warning platform for coastal communities & ecosystems**

A hackathon-ready MVP that ingests environmental data, detects anomalies with rule-based logic, and disseminates alerts via multiple channels with a real-time monitoring dashboard.

## 🎯 Project Overview

This system demonstrates end-to-end flow: **Data → Anomaly Detection → Alert Generation → Delivery → Dashboard Updates**

### Core Features

- **Real-time Environmental Monitoring**: Tide levels, wind speed, temperature, rainfall
- **Rule-based Anomaly Detection**: Configurable thresholds for flood watch and storm surge warnings  
- **Multi-level Alert System**: Advisory, Watch, Warning severity levels
- **Interactive Dashboard**: Leaflet map with risk zones, Chart.js metrics, active alerts panel
- **Bilingual Support**: English + Hindi alert messages
- **Mock Alert Delivery**: SMS (Twilio) and Push notifications (Firebase) with console logging
- **Live Data Streaming**: Server-Sent Events for real-time updates
- **Demo Scenarios**: Pre-built flood watch and storm surge triggers

### Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Framer Motion
- **Maps**: Leaflet with react-leaflet 5.0
- **Charts**: Chart.js with react-chartjs-2
- **Database**: Cosmic Database (Firestore abstraction)
- **Real-time**: Server-Sent Events (SSE)
- **Icons**: Iconify React

## 🚀 Quick Start (5 Minutes)

### Prerequisites

- Node.js 18+ 
- Access to Cosmic platform (database auto-configured)

### Setup & Run

```bash
# Clone and setup (already done in Cosmic environment)
# Dependencies are pre-installed

# Start the development server
npm run dev

# Open browser to: http://localhost:3000
```

### Demo Flow

1. **Dashboard Overview** (30s)
   - View the clean dashboard with map, charts, and alerts panel
   - Notice "All Clear" status and green indicators

2. **Generate Normal Data** (60s)
   - Click "Generate Normal Data" button
   - Watch charts animate with realistic environmental readings
   - Map markers appear showing normal (green) risk levels

3. **Trigger Flood Watch** (90s)
   - Click "Trigger Flood Watch" button  
   - Observe orange alert appear in alerts panel
   - Toggle between English/Hindi language
   - Check console for mock SMS/push notifications

4. **Storm Surge Warning** (90s)
   - Click "Trigger Storm Surge" button
   - See red warning alert with highest priority
   - Notice header status changes to "Warning Active"
   - Map shows alert markers with pulsing animation

5. **Generate Storm Data** (60s)
   - Click "Generate Storm Data" to trigger threshold breaches
   - Watch charts show dangerous levels with threshold lines
   - See automatic alert generation from rule engine
   - View real-time updates via SSE connection

## 🏗️ Architecture

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ingest` | POST | Ingest environmental readings, run anomaly detection |
| `/api/ingest` | GET | Retrieve recent readings (limit parameter) |
| `/api/alerts` | GET | Get alerts by status (active/cleared) |
| `/api/alerts` | POST | Trigger scenarios or clear all alerts |
| `/api/alerts` | DELETE | Clear specific alert by ID |
| `/api/stream` | GET | Server-Sent Events stream for real-time updates |
| `/api/simulator` | POST | Generate synthetic data for testing |

### Data Models

**Environmental Reading**:
```typescript
{
  id: string,
  timestamp: string,
  lat: number, lng: number,
  tide_m: number,      // Meters
  wind_kmh: number,    // km/h
  temp_c: number,      // Celsius  
  rain_mm: number,     // Millimeters
}
```

**Alert**:
```typescript
{
  id: string,
  created_at: string,
  level: 'advisory' | 'watch' | 'warning',
  type: 'flood_watch' | 'storm_surge',
  message_en: string,
  message_hi: string,
  location: { lat: number, lng: number },
  status: 'active' | 'cleared'
}
```

### Rule Engine Thresholds

These can be configured via environment variables:

```bash
THRESHOLD_TIDE_WATCH=2.5      # Flood watch tide level (meters)
THRESHOLD_TIDE_WARNING=3.2    # Storm surge tide level (meters)  
THRESHOLD_WIND_WARNING=60     # High wind speed (km/h)
THRESHOLD_RAIN_WATCH=50       # Heavy rainfall (mm)
```

**Alert Logic**:
- **Flood Watch**: `tide_m >= 2.5 AND rain_mm >= 50`
- **Storm Surge Warning**: `tide_m >= 3.2 AND wind_kmh >= 60`

## 🎮 Interactive Features

### Dashboard Controls

- **Language Toggle**: Switch between English/Hindi alerts
- **Scenario Triggers**: Generate flood watch or storm surge alerts instantly  
- **Data Generation**: Create realistic environmental data sets
- **Alert Management**: Clear individual alerts or all active alerts
- **Real-time Streaming**: Live updates every 3 seconds via SSE

### Map Features

- **Risk-based Color Coding**: Green (normal) → Yellow (advisory) → Orange (watch) → Red (warning)
- **Interactive Markers**: Click readings/alerts for detailed popups
- **Alert Animations**: Pulsing markers for active threats
- **Risk Level Legend**: Visual guide for threat assessment

### Chart Features

- **Time-series Visualization**: Last 60 readings per metric
- **Threshold Overlay**: Dashed lines showing watch/warning levels
- **Hover Tooltips**: Detailed values with threshold status
- **Current Value Display**: Latest reading with status indicator

## 🔧 Configuration

### Environment Variables

```bash
# Region Settings
APP_REGION_NAME="Mumbai Coast"
TIMEZONE="Asia/Kolkata"

# Detection Thresholds  
THRESHOLD_TIDE_WATCH=2.5
THRESHOLD_TIDE_WARNING=3.2
THRESHOLD_WIND_WARNING=60
THRESHOLD_RAIN_WATCH=50

# Alert Services (Mock Mode by default)
USE_TWILIO=false
USE_FIREBASE=false
ALERT_TO_NUMBERS="+911234567890,+911112223334"

# Twilio Configuration (when USE_TWILIO=true)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token  
TWILIO_FROM_NUMBER=+10000000000

# Firebase Configuration (when USE_FIREBASE=true)
FIREBASE_SERVER_KEY=your_server_key
```

### Switching to Real Alert Services

1. **Enable Twilio SMS**:
   ```bash
   USE_TWILIO=true
   TWILIO_ACCOUNT_SID=your_actual_sid
   TWILIO_AUTH_TOKEN=your_actual_token
   TWILIO_FROM_NUMBER=your_twilio_number
   ```

2. **Enable Firebase Push**:
   ```bash
   USE_FIREBASE=true  
   FIREBASE_SERVER_KEY=your_actual_server_key
   ```

## 🧪 Testing Scenarios

### API Testing

```bash
# Generate test data
curl -X POST http://localhost:3000/api/simulator \
  -H "Content-Type: application/json" \
  -d '{"count": 20, "scenario": "storm_surge"}'

# Ingest readings  
curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json"
  -d '[{"timestamp":"2024-01-01T12:00:00Z","lat":19.0760,"lng":72.8777,"tide_m":3.5,"wind_kmh":65,"temp_c":28,"rain_mm":30}]'

# Trigger scenario alert
curl -X POST http://localhost:3000/api/alerts \
  -H "Content-Type: application/json" \
  -d '{"scenario": "flood_watch"}'
```

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-optimized layout
- **Smooth Animations**: Framer Motion transitions and micro-interactions  
- **Accessibility**: Proper contrast ratios and semantic HTML
- **Performance**: Efficient data loading and chart rendering
- **Professional Aesthetics**: Clean, modern dashboard design
- **Real-time Feedback**: Connection status and live data indicators

## 🔒 Production Considerations

### Security
- API rate limiting (not implemented in MVP)
- Input validation and sanitization  
- Environment variable protection
- CORS configuration for production domains

### Scalability  
- Database indexing for large datasets
- Chart data windowing (currently last 60 readings)
- Connection pooling for SSE streams
- Caching for frequently accessed data

### Monitoring
- Error tracking and logging
- Performance metrics
- Alert delivery success rates
- Database query optimization

## 🐛 Known Limitations (MVP)

- **No Live Sensors**: Uses simulated data only
- **Basic ML**: Rule-based detection (no machine learning yet)
- **Single Region**: Hardcoded to Mumbai coordinates  
- **No User Auth**: Public dashboard (no RBAC)
- **Memory Storage**: SSE connections not persisted
- **No Historical Analysis**: Limited data retention
- **Mock Services**: Alert delivery is console-only by default

## 🚢 Deployment Ready

This MVP is ready for local demo and can be deployed to:

- **Cosmic Platform**: Already configured and optimized
- **Vercel**: Next.js-optimized deployment
- **Netlify**: Static export support
- **Docker**: Container-ready architecture

## 🤝 Contributing

Built for hackathons with extensible architecture:

1. **Add ML Models**: Replace rule engine with trained models
2. **Integrate Real Sensors**: Connect to IoT/satellite data feeds
3. **Multi-region Support**: Dynamic coordinate configuration
4. **Advanced Alerting**: Email, WhatsApp, voice calls
5. **Historical Analytics**: Trend analysis and predictions
6. **User Management**: Authentication and personalized alerts

## 📜 License

Hackathon MVP - Free to use and modify

---

**Built with ❤️ for coastal safety and community resilience**

*Demo ready in 5 minutes • Production ready with configuration • Hackathon winner ready with features*