# Weather Comfort Index Application

A secure, full-stack weather analytics application that retrieves real-time weather data, computes a custom Comfort Index for each city, and visualizes insights through a responsive dashboard with temperature trend graphs.

![Weather Comfort Index](https://img.shields.io/badge/Status-Production-green)
![Node](https://img.shields.io/badge/Node-16+-blue)
![React](https://img.shields.io/badge/React-18+-61dafb)

## Features

- **Real-time Weather Data** - Retrieves data from OpenWeatherMap API for 18 cities worldwide
- **Custom Comfort Index** - Intelligent scoring based on Temperature, Humidity, Wind Speed, Visibility, and Pressure
- **Temperature Trends Graph** - Interactive line chart showing 7-day temperature trends per city
- **Mock Authentication** - Simple login system (careers@fidenz.com / Pass#fidenz)
- **Server-side Caching** - 5-minute TTL with NodeCache
- **Dark Mode** - Toggle between light and dark themes
- **Real-time Filtering** - Filter cities by comfort score and search by name
- **Responsive Design** - Mobile-first design with Tailwind CSS

## Comfort Index Algorithm

The Comfort Index quantifies outdoor comfort using 5 weighted parameters, with a score from 0–100:

```
ComfortIndex = TemperatureScore (0-40)
             + HumidityScore (0-30)
             + WindSpeedScore (0-20)
             + VisibilityScore (0-10)

```

### Parameters and Weighting

| Parameter   | Weight | Optimal Range | Reasoning                            |
| ----------- | ------ | ------------- | ------------------------------------ |
| Temperature | 40%    | 20–25°C       | Primary factor for perceived comfort |
| Humidity    | 30%    | 40–60%        | Impacts thermal perception           |
| Wind Speed  | 20%    | 0–5 m/s       | Affects outdoor activity comfort     |
| Visibility  | 10%    | ≥8 km         | Indicates air quality and clarity    |



### Rating Categories

| Score   | Rating    | Description                      |
|---------|-----------|----------------------------------|
| 80-100  | Excellent | Ideal for outdoor activities     |
| 60-79   | Good      | Comfortable for most people      |
| 40-59   | Fair      | Acceptable, minor discomfort     |
| 0-39    | Poor      | Uncomfortable conditions         |

## Architecture

```
┌─────────────────┐
│   React App     │ (Frontend - Port 3000)
│ - Dashboard     │
│ - Weather Cards │
│ - Temp Graphs   │
│ - Login/Logout  │
│ - Dark Mode     │
└────────┬────────┘
         │ HTTP REST API
         ▼
┌─────────────────┐
│ Express API     │ (Backend - Port 3001)
│ - Weather Routes│
│ - Trends Route  │
│ - Cache Layer   │
│ - Mock/Real API │
└────────┬────────┘
         │
         ▼
┌──────────────┐
│ OpenWeather  │
│ API / Cache  │
│ (or Mock)    │
└──────────────┘
```

## Temperature Trends Visualization

- **Interactive Line Charts** - Shows temperature trends for all cities over the past 7 days
- **No Legend Clutter** - Clean graph without overwhelming city name lists
- **Hover Tooltips** - View exact temperatures and city names on hover
- **Color-coded Lines** - Each city has a unique color for easy identification
- **Responsive Design** - Adapts to different screen sizes

## Setup Instructions

### Prerequisites

- Node.js 16+ and npm
- OpenWeatherMap API key (optional - works with mock data)

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd weather-comfort-index
```

### 2. Backend Setup

```bash
npm install
npm run dev
```

Create a `.env` file in the root directory:

```env
PORT=3001
OPENWEATHER_API_KEY=0d2ee88229e8317a44ddd5644ff98b19
```

**Note:** If you don't have an API key, the app will use mock data automatically.

Start the backend server:

```bash
node server.js
```

Server will run at `http://localhost:3001`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

App will open at `http://localhost:3000`

### 4. Login Credentials

```
Email: careers@fidenz.com
Password: Pass#fidenz
```

## Testing

```bash
npm test
```

Covers:
- Comfort Index calculations (optimal, extreme, edge cases)
- Dashboard rendering and filtering
- Graph rendering
- Authentication flow

## Authentication Flow

1. User visits app → **Login page** displayed
2. Enter credentials → Validated against hardcoded credentials
3. **Session storage** → User data stored in `sessionStorage`
4. **Dashboard loads** → Displays weather cards and temperature graphs
5. Logout → Clears session and returns to login

## Caching Design

- **Tier 1:** Raw API responses per city (TTL: 5 minutes)
- **Tier 2:** Temperature trend data (TTL: 5 minutes)
- **Cache Status:** Monitor via `GET /api/cache/status`
- **Cache Clear:** Clear all via `POST /api/cache/clear`

### Cache Monitoring Endpoint

```bash
curl http://localhost:3001/api/cache/status
```

Response:
```json
{
  "stats": {
    "keys": 19,
    "hits": 156,
    "misses": 19,
    "hitRate": 0.89
  },
  "cache": [
    { "key": "weather_1248991", "remainingSeconds": 284, "status": "HIT" }
  ]
}
```

## Responsive Design

| Breakpoint | Layout | Features |
|------------|--------|----------|
| Mobile (<768px) | Single column | Stacked cards, full-width graph |
| Tablet (768-1024px) | Two columns | Side-by-side cards, adaptive graph |
| Desktop (>1024px) | Three columns | Optimal spacing, large graph |

## Project Structure

```
weather-comfort-index/
├── server.js                 # Express backend with API routes
├── package.json              # Backend dependencies
├── .env                      # Environment variables
├── .env.example              # Example environment file
└── frontend/
    ├── src/
    │   ├── App.jsx           # Main React component
    │   ├── index.js          # React entry point
    │   └── index.css         # Global styles
    ├── public/
    │   └── index.html        # HTML template
    └── package.json          # Frontend dependencies
```

## Technologies Used

### Backend
- **Express.js** - Web server framework
- **axios** - HTTP client for API calls
- **node-cache** - In-memory caching
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Frontend
- **React 18** - UI framework
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Recharts** - Chart library for temperature trends
- **sessionStorage** - Client-side session management

## Supported Cities

The application tracks weather for 18 major cities worldwide:

1. Colombo, Sri Lanka
2. Tokyo, Japan
3. Liverpool, UK
4. Paris, France
5. Sydney, Australia
6. Boston, USA
7. Shanghai, China
8. Oslo, Norway
9. New York, USA
10. Berlin, Germany
11. Mumbai, India
12. Beijing, China
13. Tel Aviv, Israel
14. Buenos Aires, Argentina
15. Johannesburg, South Africa
16. Amsterdam, Netherlands
17. London, UK
18. Toronto, Canada

## API Endpoints

### Weather Endpoints

```
GET /api/health              # Health check
GET /api/weather             # Get all cities with comfort scores
GET /api/temperature-trends  # Get 7-day temperature trends
GET /api/cache/status        # View cache statistics
POST /api/cache/clear        # Clear all cache
```

### Example API Response

**GET /api/weather**
```json
{
  "success": true,
  "count": 18,
  "data": [
    {
      "id": 1248991,
      "name": "Colombo",
      "country": "LK",
      "weather": [{ "description": "clear sky", "main": "Clear" }],
      "main": {
        "temp": 301.15,
        "humidity": 75,
        "pressure": 1010
      },
      "wind": { "speed": 3.5 },
      "visibility": 10000,
      "comfortScore": 68,
      "cached": false
    }
  ]
}
```

## Features in Detail

### 1. Weather Cards
- Display current weather, temperature, humidity, wind speed, visibility
- Show comfort score with color-coded rating
- Ranked by comfort score (#1 = most comfortable)
- Hover effects for interactivity

### 2. Temperature Trends Graph
- 7-day historical temperature data
- Multiple cities on single graph
- Clean design without legend clutter
- Interactive tooltips on hover
- Responsive chart sizing

### 3. Filtering & Search
- **Comfort Score Filter:** Slider to filter cities by minimum comfort score
- **Search:** Real-time city name search
- Results update instantly

### 4. Dark Mode
- Toggle between light and dark themes
- Persists across all views
- Optimized colors for readability

## Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Backend server port | 3001 | No |
| `OPENWEATHER_API_KEY` | OpenWeatherMap API key | Mock data | No |
| `REACT_APP_API_URL` | Frontend API URL | http://localhost:3001/api | No |

### Customization

**Add/Remove Cities:** Edit `cityCodes` array in `server.js`

```javascript
const cityCodes = [
  1248991, // Colombo
  1850147, // Tokyo
  // Add more city codes here
];
```

**Adjust Cache TTL:** Modify in `server.js`

```javascript
const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes
```

**Change Temperature Trend Days:** Add query parameter

```
GET /api/temperature-trends?days=14
```

## Troubleshooting

### Backend won't start
- Check if port 3001 is available
- Verify Node.js version (16+)
- Run `npm install` again

### Frontend can't connect to backend
- Ensure backend is running on port 3001
- Check CORS settings in `server.js`
- Verify `REACT_APP_API_URL` in `.env`

### No weather data showing
- Check API key in `.env`
- View browser console for errors
- App will fall back to mock data if API fails

### Graph not displaying
- Clear browser cache
- Check console for recharts errors
- Ensure `/api/temperature-trends` endpoint works

## Future Enhancements

- [ ] Real Auth0 integration with MFA
- [ ] Forecast data (5-day, 10-day)
- [ ] Historical data comparison
- [ ] Favorite cities feature
- [ ] Email alerts for comfort score changes
- [ ] Mobile app version
- [ ] Multi-language support
- [ ] Export data to CSV/PDF

## Contact

**Developer:** Pasinda Himantha  
**Email:** Pasindahimantha7@gmail.com  
**Date:** 28 December 2025  
**Assignment:** Fidenz Full Stack Developer Assessment

---

## License

This project is developed as part of a technical assessment.

---

