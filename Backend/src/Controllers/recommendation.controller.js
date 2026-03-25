const { calculateRecommendation } = require('../Services/recommendation.service');

const getRecommendation = async (req, res) => {
    try {
        const { farmerId } = req.params;
        if (!farmerId) {
            return res.status(400).json({ success: false, message: 'Farmer ID is required' });
        }

        const suggestions = await calculateRecommendation(farmerId);
        
        res.json({
            success: true,
            recommendations: suggestions,
            top_suggestion: suggestions[0] || null
        });

    } catch (error) {
        console.error('Recommendation API error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to get crop recommendations' });
    }
};

const getForecast = async (req, res) => {
    try {
        const { crop_name } = req.query;
        if (!crop_name) {
            return res.status(400).json({ success: false, message: 'Crop name is required' });
        }

        const { getPriceForecast } = require('../Services/recommendation.service');
        const forecastData = await getPriceForecast(crop_name);

        res.json({
            success: true,
            data: forecastData
        });
    } catch (error) {
        console.error('Price Forecast API error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to get price forecast' });
    }
};

module.exports = { getRecommendation, getForecast };
