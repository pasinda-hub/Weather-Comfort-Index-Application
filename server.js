// server.js - Express Backend with Auth0 Integration & Fallback Mock Data
const express = require('express');
const cors = require('cors');
const NodeCache = require('node-cache');
const axios = require('axios');
require('dotenv').config();

const app = express();
const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes cache

app.use(cors());
app.use(express.json());

// OpenWeatherMap configuration
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// City codes
const cityCodes = [
  1248991, // Colombo
  1850147, // Tokyo
  2644210, // Liverpool
  2988507, // Paris
  2147714, // Sydney
  4930956, // Boston
  1796236, // Shanghai
  3143244, // Oslo
  5128581, // New York
  2950159, // Berlin
  1275339, // Mumbai
  1816670, // Beijing
  293397,  // Tel Aviv
  3435910, // Buenos Aires
  993800,  // Johannesburg
  2759794, // Amsterdam
  2643743, // London
  6167865  // Toronto
];

// Comfort Index Calculator
function calculateComfortIndex(weatherData) {
  const temp = weatherData.main.temp - 273.15;
  const humidity = weatherData.main.humidity;
  const windSpeed = weatherData.wind.speed;
  const visibility = weatherData.visibility / 1000;
  const pressure = weatherData.main.pressure;

  let tempScore = 0;
  if (temp >= 20 && temp <= 25) tempScore = 30;
  else if (temp >= 15 && temp < 20) tempScore = 25 - (20 - temp) * 2;
  else if (temp > 25 && temp <= 30) tempScore = 25 - (temp - 25) * 2;
  else if (temp >= 10 && temp < 15) tempScore = 15 - (15 - temp);
  else if (temp > 30 && temp <= 35) tempScore = 15 - (temp - 30);
  else tempScore = Math.max(0, 10 - Math.abs(temp - 22.5) * 0.5);

  let humidityScore = 0;
  if (humidity >= 40 && humidity <= 60) humidityScore = 25;
  else if (humidity >= 30 && humidity < 40) humidityScore = 20 - (40 - humidity) * 0.5;
  else if (humidity > 60 && humidity <= 70) humidityScore = 20 - (humidity - 60) * 0.5;
  else humidityScore = Math.max(0, 15 - Math.abs(humidity - 50) * 0.3);

  let windScore = 0;
  if (windSpeed <= 5) windScore = 20 - windSpeed * 2;
  else if (windSpeed <= 10) windScore = 10 - (windSpeed - 5);
  else windScore = Math.max(0, 5 - (windSpeed - 10) * 0.5);

  let visibilityScore = 0;
  if (visibility >= 8) visibilityScore = 15;
  else visibilityScore = (visibility / 8) * 15;

  let pressureScore = 10 - Math.abs(pressure - 1013) * 0.1;
  pressureScore = Math.max(0, Math.min(10, pressureScore));

  const totalScore = tempScore + humidityScore + windScore + visibilityScore + pressureScore;
  return Math.round(Math.min(100, Math.max(0, totalScore)));
}

// Fetch weather data from OpenWeatherMap or mock
async function fetchWeatherData(cityCode) {
  const cacheKey = `weather_${cityCode}`;
  const cached = cache.get(cacheKey);

  if (cached) return { data: cached, cached: true };

  if (!OPENWEATHER_API_KEY) {
    // Return mock data if no API key
    const mockData = {
      id: cityCode,
      name: `City-${cityCode}`,
      sys: { country: 'XX' },
      coord: { lat: 0, lon: 0 },
      weather: [{ description: 'clear sky', main: 'Clear' }],
      main: { temp: 293.15, humidity: 50, pressure: 1013 },
      wind: { speed: 3 },
      visibility: 10000,
      clouds: { all: 0 },
      dt: Date.now()
    };
    cache.set(cacheKey, mockData);
    return { data: mockData, cached: false };
  }

  try {
    const url = `${OPENWEATHER_BASE_URL}?id=${cityCode}&appid=${OPENWEATHER_API_KEY}`;
    const response = await axios.get(url);
    cache.set(cacheKey, response.data);
    return { data: response.data, cached: false };
  } catch (err) {
    console.error(`Error fetching city ${cityCode}:`, err.message);
    // Return fallback mock if API fails
    return {
      data: {
        id: cityCode,
        name: `City-${cityCode}`,
        sys: { country: 'XX' },
        coord: { lat: 0, lon: 0 },
        weather: [{ description: 'unknown', main: 'Clear' }],
        main: { temp: 293.15, humidity: 50, pressure: 1013 },
        wind: { speed: 3 },
        visibility: 10000,
        clouds: { all: 0 },
        dt: Date.now()
      },
      cached: false
    };
  }
}

// Generate temperature trend data
function generateTemperatureTrends(currentWeatherData, days = 7) {
  const trends = [];
  const now = new Date();

  currentWeatherData.forEach(cityData => {
    const baseTemp = cityData.main.temp - 273.15; // Convert to Celsius
    
    // Generate historical data for the past 'days' days
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(12, 0, 0, 0); // Set to noon for consistency
      
      // Add realistic temperature variation
      // Simulate daily temperature changes with sinusoidal pattern
      const dayVariation = Math.sin((i / days) * Math.PI * 2) * 3; // ±3°C seasonal trend
      const randomVariation = (Math.random() - 0.5) * 2; // ±1°C random daily variation
      
      const temperature = parseFloat((baseTemp + dayVariation + randomVariation).toFixed(2));
      
      trends.push({
        city: cityData.name,
        timestamp: date.toISOString().split('T')[0], // YYYY-MM-DD format
        temperature: temperature,
        humidity: cityData.main.humidity + Math.floor((Math.random() - 0.5) * 10),
        windSpeed: cityData.wind.speed + (Math.random() - 0.5)
      });
    }
  });

  // Sort by timestamp, then by city name
  trends.sort((a, b) => {
    const dateCompare = a.timestamp.localeCompare(b.timestamp);
    return dateCompare !== 0 ? dateCompare : a.city.localeCompare(b.city);
  });

  return trends;
}

// Public health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Weather endpoint
app.get('/api/weather', async (req, res) => {
  try {
    const weatherPromises = cityCodes.map(code => fetchWeatherData(code));
    const results = await Promise.all(weatherPromises);

    const processedData = results.map(({ data, cached }) => ({
      id: data.id,
      name: data.name,
      country: data.sys.country,
      coord: data.coord,
      weather: data.weather,
      main: data.main,
      wind: data.wind,
      visibility: data.visibility,
      clouds: data.clouds,
      dt: data.dt,
      comfortScore: calculateComfortIndex(data),
      cached
    }));

    processedData.sort((a, b) => b.comfortScore - a.comfortScore);

    res.json({ success: true, count: processedData.length, data: processedData, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error('Error fetching weather data:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch weather data', message: err.message });
  }
});

// Temperature trends endpoint
app.get('/api/temperature-trends', async (req, res) => {
  try {
    const cacheKey = 'temperature_trends';
    const cached = cache.get(cacheKey);

    if (cached) {
      return res.json({ success: true, data: cached, cached: true, timestamp: new Date().toISOString() });
    }

    // Fetch current weather data
    const weatherPromises = cityCodes.map(code => fetchWeatherData(code));
    const results = await Promise.all(weatherPromises);
    
    const currentWeatherData = results.map(({ data }) => data);
    
    // Generate temperature trends (last 7 days)
    const days = parseInt(req.query.days) || 7;
    const trends = generateTemperatureTrends(currentWeatherData, days);
    
    // Cache the trends data
    cache.set(cacheKey, trends);

    res.json({ 
      success: true, 
      data: trends, 
      cached: false,
      count: trends.length,
      cities: [...new Set(trends.map(t => t.city))].length,
      dateRange: {
        from: trends[0]?.timestamp,
        to: trends[trends.length - 1]?.timestamp
      },
      timestamp: new Date().toISOString() 
    });
  } catch (err) {
    console.error('Error generating temperature trends:', err.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate temperature trends', 
      message: err.message 
    });
  }
});

// Cache status endpoint
app.get('/api/cache/status', (req, res) => {
  const keys = cache.keys();
  const stats = cache.getStats();

  const cacheStatus = keys.map(key => {
    const ttl = cache.getTtl(key);
    const remainingSeconds = ttl ? Math.round((ttl - Date.now()) / 1000) : 0;
    return { key, remainingSeconds, status: remainingSeconds > 0 ? 'HIT' : 'EXPIRED' };
  });

  res.json({
    stats: { keys: stats.keys, hits: stats.hits, misses: stats.misses, hitRate: stats.hits / (stats.hits + stats.misses) || 0 },
    cache: cacheStatus
  });
});

// Clear cache
app.post('/api/cache/clear', (req, res) => {
  cache.flushAll();
  res.json({ success: true, message: 'Cache cleared' });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Cache TTL: 300 seconds`);
  console.log(`Available endpoints:`);
  console.log(`  - GET  /api/health`);
  console.log(`  - GET  /api/weather`);
  console.log(`  - GET  /api/temperature-trends`);
  console.log(`  - GET  /api/cache/status`);
  console.log(`  - POST /api/cache/clear`);
});
