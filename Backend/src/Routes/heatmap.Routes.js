const express = require('express');
const router = express.Router();
const { getRegionalDemand } = require('../Controllers/heatmap.controller');

router.get('/regional-demand', getRegionalDemand);

module.exports = router;
