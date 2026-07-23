export async function fetchWeather(city) {
  const response = await fetch(`/api/weather/${encodeURIComponent(city)}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch weather');
  }

  return data;
}
