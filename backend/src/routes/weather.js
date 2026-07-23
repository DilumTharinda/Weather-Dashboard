const express = require('express');
const { getWeatherByCity } = require('../services/weatherService');

const router = express.Router();

router.get('/:city', async (req, res) => {
  const { city } = req.params;

  if (!city || city.trim().length === 0) {
    return res.status(400).json({ error: 'City name is required' });
  }

  try {
    const weather = await getWeatherByCity(city.trim());
    res.status(200).json(weather);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

module.exports = router;
