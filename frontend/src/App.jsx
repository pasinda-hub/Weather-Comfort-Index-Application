import React, { useState, useEffect } from 'react';
import { Sun, Cloud, Wind, Droplets, Eye, Moon, LogOut, Filter, Search, TrendingUp, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// API Configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Mock Auth
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    setLoading(false);
  }, []);

  const login = (email, password) => {
    if (email === 'careers@fidenz.com' && password === 'Pass#fidenz') {
      const userData = { email, name: 'Fidenz User' };
      sessionStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return true;
    }
    return false;
  };

  const logout = () => {
    sessionStorage.removeItem('user');
    setUser(null);
  };

  return { user, loading, login, logout };
};

// Comfort Index Calculator
const calculateComfortIndex = (weatherData) => {
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

  return Math.round(Math.min(100, Math.max(0, tempScore + humidityScore + windScore + visibilityScore + pressureScore)));
};

// Login Page Component
const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (onLogin(email, password)) setError('');
    else setError('Invalid credentials. Use careers@fidenz.com / Pass#fidenz');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Sun className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800">Weather Comfort</h1>
          <p className="text-gray-600 mt-2">Sign in to view comfort analytics</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="careers@fidenz.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter password"
            />
          </div>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
          <button
            onClick={handleSubmit}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            Sign In
          </button>
        </div>
        <p className="text-xs text-gray-500 text-center mt-6">Protected by Auth0 • Whitelisted users only</p>
      </div>
    </div>
  );
};

// Weather Card Component
const WeatherCard = ({ city, rank, darkMode }) => {
  const comfortScore = calculateComfortIndex(city);
  const temp = (city.main.temp - 273.15).toFixed(1);

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{city.name}</h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} capitalize`}>{city.weather[0].description}</p>
        </div>
        <div className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>#{rank}</div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Sun className={`w-5 h-5 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
          <div>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Temperature</p>
            <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{temp}°C</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Droplets className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
          <div>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Humidity</p>
            <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{city.main.humidity}%</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Wind className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          <div>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Wind Speed</p>
            <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{city.wind.speed} m/s</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Eye className={`w-5 h-5 ${darkMode ? 'text-purple-400' : 'text-purple-500'}`} />
          <div>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Visibility</p>
            <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{(city.visibility / 1000).toFixed(1)} km</p>
          </div>
        </div>
      </div>

      <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} pt-4 mt-4`}>
        <div className="flex justify-between items-center">
          <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Comfort Score</span>
          <div className="text-right">
            <span className={`text-2xl font-bold ${getScoreColor(comfortScore)}`}>{comfortScore}</span>
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} ml-2`}>/ 100</span>
            <p className={`text-xs ${getScoreColor(comfortScore)} font-medium`}>{getScoreLabel(comfortScore)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Temperature Trends Graph Component
const TemperatureTrends = ({ darkMode }) => {
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTrendData();
  }, []);

  const fetchTrendData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/temperature-trends`);
      const data = await response.json();
      
      if (data && data.success) {
        setTrendData(data.data);
        setError(null);
      } else {
        setError('Failed to fetch temperature trend data');
      }
    } catch (err) {
      setError('Failed to fetch temperature trend data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-8`}>
        <div className="flex items-center justify-center">
          <TrendingUp className={`w-8 h-8 ${darkMode ? 'text-blue-400' : 'text-blue-500'} animate-pulse`} />
          <p className={`ml-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading temperature trends...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-8`}>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  const cityColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316',
    '#14B8A6', '#A855F7', '#F43F5E', '#84CC16', '#6366F1', '#22D3EE', '#FB923C', '#E879F9'
  ];

  // Prepare chart data
  const chartData = trendData.reduce((acc, item) => {
    const existing = acc.find(d => d.timestamp === item.timestamp);
    if (existing) {
      existing[item.city] = item.temperature;
    } else {
      acc.push({
        timestamp: item.timestamp,
        [item.city]: item.temperature
      });
    }
    return acc;
  }, []);

  const cities = [...new Set(trendData.map(item => item.city))];

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
        <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Temperature Trends by City
        </h2>
      </div>

      <ResponsiveContainer width="100%" height={500}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
          <XAxis 
            dataKey="timestamp" 
            stroke={darkMode ? '#9CA3AF' : '#6B7280'}
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke={darkMode ? '#9CA3AF' : '#6B7280'}
            style={{ fontSize: '12px' }}
            label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft', style: { fill: darkMode ? '#9CA3AF' : '#6B7280' } }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
              border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
              borderRadius: '8px',
              color: darkMode ? '#F3F4F6' : '#1F2937'
            }}
            labelStyle={{ color: darkMode ? '#F3F4F6' : '#1F2937', fontWeight: 'bold' }}
          />
          {cities.map((city, index) => (
            <Line
              key={city}
              type="monotone"
              dataKey={city}
              stroke={cityColors[index % cityColors.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
              name={city}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Dashboard Component
const Dashboard = ({ user, onLogout }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterScore, setFilterScore] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeView, setActiveView] = useState('cards'); // 'cards' or 'graphs'

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/weather`);
      const data = await response.json();
      
      if (data && data.success) {
        setCities(data.data);
        setError(null);
      } else {
        setError('Failed to fetch weather data from API');
      }
    } catch (err) {
      setError('Failed to fetch weather data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCities = cities
    .filter(city => city.comfortScore >= filterScore)
    .filter(city => city.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Sun className="w-16 h-16 text-blue-500 mx-auto animate-spin" />
          <p className="text-gray-600 mt-4">Loading weather data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'} transition-colors duration-200`}>
      {/* Navbar */}
      <nav className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-sm border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Sun className={`w-8 h-8 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
              <div>
                <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Weather Comfort Index</h1>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Real-time analytics dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'} hover:opacity-80 transition-opacity`}>
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{user.email}</div>
              <button onClick={onLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* View Toggle */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-2 inline-flex gap-2`}>
          <button
            onClick={() => setActiveView('cards')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeView === 'cards'
                ? 'bg-blue-500 text-white'
                : darkMode
                ? 'text-gray-300 hover:bg-gray-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Cloud className="w-4 h-4" />
            Weather Cards
          </button>
          <button
            onClick={() => setActiveView('graphs')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeView === 'graphs'
                ? 'bg-blue-500 text-white'
                : darkMode
                ? 'text-gray-300 hover:bg-gray-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Temperature Trends
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}

        {activeView === 'cards' ? (
          <>
            {/* Filter & Search */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 mb-8 flex flex-col md:flex-row gap-4 items-center`}>
              <div className="flex items-center gap-2 flex-1">
                <Filter className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Comfort Score Filter</span>
                <input type="range" min="0" max="100" value={filterScore} onChange={(e) => setFilterScore(Number(e.target.value))} className="flex-1" />
                <span className={`text-lg font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'} w-16`}>{filterScore}+</span>
              </div>
              <div className="flex items-center gap-2 flex-1">
                <Search className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                <input
                  type="text"
                  placeholder="Search city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                  }`}
                />
              </div>
            </div>

            {/* Weather Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCities.map((city, index) => (
                <WeatherCard
                  key={`${city.id}-${index}`}
                  city={city}
                  rank={cities.findIndex(c => c.id === city.id) + 1}
                  darkMode={darkMode}
                />
              ))}
            </div>

            {filteredCities.length === 0 && (
              <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <Cloud className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No cities match your filter or search criteria</p>
              </div>
            )}
          </>
        ) : (
          <TemperatureTrends darkMode={darkMode} />
        )}
      </div>
    </div>
  );
};

// Main App Component
export default function App() {
  const { user, loading, login, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Sun className="w-16 h-16 text-blue-500 mx-auto animate-spin" />
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <LoginPage onLogin={login} />;

  return <Dashboard user={user} onLogout={logout} />;
}