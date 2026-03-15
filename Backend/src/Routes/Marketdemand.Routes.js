const express = require('express');
const {
	MarketDemand,
	getMarketDemands,
	getGovernmentLiveMarketData,
	estimateCultivationCost,
	estimateRevenue,
	saveRevenueEstimate,
	getRevenueEstimateHistory,
	updateMarketDemand,
	deleteMarketDemand,
} = require('../Controllers/MarketDemand');
const { verifyToken, checkRole } = require('../Middleware/auth.middleware');

const router = express.Router();

router.get('/demand', getMarketDemands);
router.put('/demand/:id', verifyToken, checkRole('admin'), express.raw({ type: '*/*', limit: '1mb' }), updateMarketDemand);
router.delete('/demand/:id', verifyToken, checkRole('admin'), deleteMarketDemand);
router.get('/govt-live', getGovernmentLiveMarketData);
router.post('/revenue-estimate/cultivation-cost', verifyToken, checkRole('farmer'), estimateCultivationCost);
router.post('/revenue-estimate', verifyToken, checkRole('farmer'), estimateRevenue);
router.post('/revenue-estimate/save', verifyToken, checkRole('farmer'), saveRevenueEstimate);
router.get('/revenue-estimate/history', verifyToken, checkRole('farmer'), getRevenueEstimateHistory);
// Parse raw body as a safe fallback when clients send JSON without Content-Type.
router.post('/demand', verifyToken, checkRole('admin'), express.raw({ type: '*/*', limit: '1mb' }), MarketDemand);

module.exports = router;