import { useState } from 'react';
import { fetchWeather } from './api';
import WeatherCard from './components/WeatherCard';
import './App.css';

export default function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSearch(event) {
    event.preventDefault();

    if (!city.trim()) {
      return;
    }

    setLoading(true);
    setError('');
    setWeather(null);

    try {
      const data = await fetchWeather(city.trim());
      setWeather(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <h1>Weather Dashboard</h1>

      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={city}
          onChange={(event) => setCity(event.target.value)}
          placeholder="Enter city name"
        />
        <button type="submit">Search</button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      <WeatherCard weather={weather} />
    </div>
  );
}
