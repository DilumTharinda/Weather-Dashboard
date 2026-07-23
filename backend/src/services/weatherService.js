const axios = require('axios');

const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

async function getWeatherByCity(city) {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    const err = new Error('Weather API key not configured');
    err.status = 500;
    throw err;
  }

  try {
    const response = await axios.get(BASE_URL, {
      params: {
        q: city,
        appid: apiKey,
        units: 'metric'
      }
    });

    const data = response.data;

    return {
      city: data.name,
      country: data.sys && data.sys.country,
      temperature: data.main && data.main.temp,
      feelsLike: data.main && data.main.feels_like,
      condition: data.weather && data.weather[0] && data.weather[0].description,
      humidity: data.main && data.main.humidity,
      windSpeed: data.wind && data.wind.speed
    };
  } catch (error) {
    if (error.response && error.response.status === 404) {
      const err = new Error(`City not found: ${city}`);
      err.status = 404;
      throw err;
    }

    const apiMessage = error.response && error.response.data && error.response.data.message;
    const errorMessage = apiMessage || 'Failed to fetch weather data';
    const err = new Error(errorMessage);
    err.status = 502;
    throw err;
  }
}

module.exports = { getWeatherByCity };
