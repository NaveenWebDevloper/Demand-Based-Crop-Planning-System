const express = require('express');
const router = express.Router();
const { getWeather } = require('../Controllers/weather.Controller');

router.get('/', getWeather);

module.exports = router;
