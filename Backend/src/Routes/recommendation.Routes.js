const express = require('express');
const router = express.Router();
const { getRecommendation, getForecast } = require('../Controllers/recommendation.controller');

router.get('/forecast', getForecast);
router.get('/:farmerId', getRecommendation);

module.exports = router;
