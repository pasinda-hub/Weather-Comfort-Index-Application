// comfortIndex.test.js - Unit tests for Comfort Index calculation

/**
 * Comfort Index Algorithm (copied for testing)
 */
function calculateComfortIndex(weatherData) {
  const temp = weatherData.main.temp - 273.15;
  const humidity = weatherData.main.humidity;
  const windSpeed = weatherData.wind.speed;
  const visibility = weatherData.visibility / 1000;
  const pressure = weatherData.main.pressure;

  let tempScore = 0;
  if (temp >= 20 && temp <= 25) {
    tempScore = 30;
  } else if (temp >= 15 && temp < 20) {
    tempScore = 25 - (20 - temp) * 2;
  } else if (temp > 25 && temp <= 30) {
    tempScore = 25 - (temp - 25) * 2;
  } else if (temp >= 10 && temp < 15) {
    tempScore = 15 - (15 - temp);
  } else if (temp > 30 && temp <= 35) {
    tempScore = 15 - (temp - 30);
  } else {
    tempScore = Math.max(0, 10 - Math.abs(temp - 22.5) * 0.5);
  }

  let humidityScore = 0;
  if (humidity >= 40 && humidity <= 60) {
    humidityScore = 25;
  } else if (humidity >= 30 && humidity < 40) {
    humidityScore = 20 - (40 - humidity) * 0.5;
  } else if (humidity > 60 && humidity <= 70) {
    humidityScore = 20 - (humidity - 60) * 0.5;
  } else {
    humidityScore = Math.max(0, 15 - Math.abs(humidity - 50) * 0.3);
  }

  let windScore = 0;
  if (windSpeed <= 5) {
    windScore = 20 - windSpeed * 2;
  } else if (windSpeed <= 10) {
    windScore = 10 - (windSpeed - 5);
  } else {
    windScore = Math.max(0, 5 - (windSpeed - 10) * 0.5);
  }

  let visibilityScore = 0;
  if (visibility >= 8) {
    visibilityScore = 15;
  } else {
    visibilityScore = (visibility / 8) * 15;
  }

  let pressureScore = 10 - Math.abs(pressure - 1013) * 0.1;
  pressureScore = Math.max(0, Math.min(10, pressureScore));

  const totalScore = tempScore + humidityScore + windScore + visibilityScore + pressureScore;
  return Math.round(Math.min(100, Math.max(0, totalScore)));
}

describe('Comfort Index Calculator', () => {
  test('should return 100 for perfect conditions', () => {
    const perfectWeather = {
      main: {
        temp: 295.15, // 22°C
        humidity: 50,
        pressure: 1013
      },
      wind: { speed: 0 },
      visibility: 10000
    };
    
    const score = calculateComfortIndex(perfectWeather);
    expect(score).toBeGreaterThanOrEqual(95);
    expect(score).toBeLessThanOrEqual(100);
  });

  test('should return lower score for high temperature', () => {
    const hotWeather = {
      main: {
        temp: 308.15, // 35°C
        humidity: 80,
        pressure: 1010
      },
      wind: { speed: 1 },
      visibility: 8000
    };
    
    const score = calculateComfortIndex(hotWeather);
    expect(score).toBeLessThan(60);
  });

  test('should return lower score for high wind', () => {
    const windyWeather = {
      main: {
        temp: 293.15, // 20°C
        humidity: 50,
        pressure: 1013
      },
      wind: { speed: 15 },
      visibility: 10000
    };
    
    const score = calculateComfortIndex(windyWeather);
    expect(score).toBeLessThan(80);
  });

  test('should return lower score for poor visibility', () => {
    const foggyWeather = {
      main: {
        temp: 293.15, // 20°C
        humidity: 90,
        pressure: 1013
      },
      wind: { speed: 2 },
      visibility: 1000 // 1km
    };
    
    const score = calculateComfortIndex(foggyWeather);
    expect(score).toBeLessThan(70);
  });

  test('should return score between 0 and 100', () => {
    const extremeWeather = {
      main: {
        temp: 313.15, // 40°C
        humidity: 95,
        pressure: 950
      },
      wind: { speed: 25 },
      visibility: 500
    };
    
    const score = calculateComfortIndex(extremeWeather);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  test('should handle cold weather', () => {
    const coldWeather = {
      main: {
        temp: 273.15, // 0°C
        humidity: 40,
        pressure: 1020
      },
      wind: { speed: 8 },
      visibility: 10000
    };
    
    const score = calculateComfortIndex(coldWeather);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThan(50);
  });

  test('should prefer moderate conditions', () => {
    const moderateWeather = {
      main: {
        temp: 296.15, // 23°C
        humidity: 55,
        pressure: 1015
      },
      wind: { speed: 3 },
      visibility: 9000
    };
    
    const score = calculateComfortIndex(moderateWeather);
    expect(score).toBeGreaterThanOrEqual(80);
  });
});

module.exports = { calculateComfortIndex };