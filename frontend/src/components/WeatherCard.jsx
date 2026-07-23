export default function WeatherCard({ weather }) {
  if (!weather) {
    return null;
  }

  return (
    <div className="weather-card">
      <h2>
        {weather.city}
        {weather.country ? `, ${weather.country}` : ''}
      </h2>
      <p className="temp">{Math.round(weather.temperature)}&deg;C</p>
      <p className="condition">{weather.condition}</p>
      <p>Feels like {Math.round(weather.feelsLike)}&deg;C</p>
      <p>Humidity: {weather.humidity}%</p>
      <p>Wind: {weather.windSpeed} m/s</p>
    </div>
  );
}
