jest.mock('axios');
const axios = require('axios');
const request = require('supertest');
const app = require('../src/app');

describe('GET /api/weather/:city', () => {
  beforeEach(() => {
    process.env.OPENWEATHER_API_KEY = 'test-fake-key';
    jest.clearAllMocks();
  });

  test('returns formatted weather data for a valid city', async () => {
    axios.get.mockResolvedValue({
      data: {
        name: 'Colombo',
        sys: { country: 'LK' },
        main: { temp: 29.5, feels_like: 32.1, humidity: 78 },
        weather: [{ description: 'scattered clouds' }],
        wind: { speed: 3.2 }
      }
    });

    const res = await request(app).get('/api/weather/Colombo');

    expect(res.status).toBe(200);
    expect(res.body.city).toBe('Colombo');
    expect(res.body.condition).toBe('scattered clouds');
  });

  test('returns 400 when city param is blank', async () => {
    const res = await request(app).get('/api/weather/%20');
    expect(res.status).toBe(400);
  });

  test('returns 404 when city is not found', async () => {
    axios.get.mockRejectedValue({ response: { status: 404 } });
    const res = await request(app).get('/api/weather/Nowhereville');
    expect(res.status).toBe(404);
  });

  test('returns 500 when API key is missing', async () => {
    delete process.env.OPENWEATHER_API_KEY;
    const res = await request(app).get('/api/weather/Colombo');
    expect(res.status).toBe(500);
  });

  test('returns 502 when the upstream API fails unexpectedly', async () => {
    axios.get.mockRejectedValue(new Error('network down'));
    const res = await request(app).get('/api/weather/Colombo');
    expect(res.status).toBe(502);
  });
});
