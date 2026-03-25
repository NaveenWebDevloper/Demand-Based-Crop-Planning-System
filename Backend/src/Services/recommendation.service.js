const axios = require('axios');
const UserModel = require('../Models/user.model');
const WeatherDataModel = require('../Models/WeatherData.model');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const calculateRecommendation = async (farmerId) => {
    try {
        const farmer = await UserModel.findById(farmerId);
        if (!farmer) throw new Error('Farmer not found');

        // Fetch recent weather for the region
        const weather = await WeatherDataModel.findOne({ region: farmer.district }).sort({ date: -1 });
        
        // Prepare input for AI service - now including Govt Data contextual fields
        const aiInput = {
            soil_type: farmer.soil_type || "alluvial",
            rainfall: weather?.rainfall || 800,
            temperature: weather?.temperature || 25,
            water_availability: farmer.water_availability || "medium",
            season: farmer.sowing_season || "kharif",
            previous_crop: farmer.previous_crop || "",
            irrigation_type: farmer.irrigation_type || "rainfed"
        };

        console.log(`🤖 Requesting AI Prediction for ${farmer.name} in ${farmer.district}, ${farmer.state}...`);
        
        try {
            // 1. Get Physical Suitability from AI Model
            const aiResponse = await axios.post(`${AI_SERVICE_URL}/predict-crop`, aiInput);
            const rawRecommendations = aiResponse.data.recommended_crops;

            // 2. Fetch "Govt Data" - What is actually selling in their State?
            const MarketPriceModel = require('../Models/MarketPrice.model');
            const localMarketCrops = await MarketPriceModel.distinct('crop_name', { 
                state: farmer.state,
                date: { $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) } // Last 60 days
            });

            console.log(`📈 Govt Data Context: Found ${localMarketCrops.length} active crops in ${farmer.state} markets.`);

            // 3. Process each suggestion with Market Demand logic
            const enhancedRecommendations = await Promise.all(rawRecommendations.map(async (rec, index) => {
                // Fetch recent historical records for the crop in their region/state
                const marketHistory = await MarketPriceModel.find({ 
                    crop_name: rec.crop_name,
                    state: farmer.state 
                }).sort({ date: -1 }).limit(20);

                const marketData = marketHistory.length > 0 ? marketHistory[0] : null;

                // Base score from AI
                let dynamicScore = rec.score || (85 - (index * 12)); 
                
                // --- SCORE ADJUSTMENT: GOVT DATA MATCH ---
                const isLocallyTraded = localMarketCrops.some(c => c.toLowerCase().includes(rec.crop_name.toLowerCase()));
                if (isLocallyTraded) {
                    dynamicScore += 10; // Boost if this crop has an active local market (Govt API verified)
                    console.log(`  ✨ [MARKET MATCH] ${rec.crop_name} is active in ${farmer.state} MANDIS.`);
                } else {
                    dynamicScore -= 5; // Slight penalty if no local market activity found in govt data
                }

                // --- SCORE ADJUSTMENT: OVERSUPPLY & PRICE TRENDS ---
                let oversupply_risk = "Medium";
                let oversupply_index = 0;

                if (marketHistory.length >= 6) {
                    const recentPhase = marketHistory.slice(0, 3);
                    const pastPhase = marketHistory.slice(3, 6);

                    const recentAvgPrice = recentPhase.reduce((s, d) => s + d.price_modal, 0) / recentPhase.length;
                    const pastAvgPrice = pastPhase.reduce((s, d) => s + d.price_modal, 0) / pastPhase.length;
                    
                    const recentArrivals = recentPhase.reduce((s, d) => s + d.arrival_quantity, 0) / recentPhase.length;
                    const pastArrivals = pastPhase.reduce((s, d) => s + d.arrival_quantity, 0) / pastPhase.length;

                    const priceTrend = ((recentAvgPrice - pastAvgPrice) / pastAvgPrice) * 100;
                    const arrivalTrend = ((recentArrivals - pastArrivals) / pastArrivals) * 100;

                    // Oversupply index: Rise in arrivals WITHOUT corresponding rise in price
                    oversupply_index = arrivalTrend - priceTrend;

                    if (oversupply_index > 35) {
                        oversupply_risk = "High";
                        dynamicScore -= 20;
                    } else if (oversupply_index < 10 && priceTrend > 0) {
                        oversupply_risk = "Low";
                        dynamicScore += 15; // High demand, low supply, rising price!
                    }
                }

                // Inject live data and final score
                return {
                    ...rec,
                    score: Math.max(Math.min(dynamicScore, 98), 15),
                    risk: oversupply_risk,
                    market_verified: isLocallyTraded,
                    live_market: marketData ? {
                        market_name: marketData.market_name,
                        modal_price: Math.round(marketData.price_modal),
                        arrival: Math.round(marketData.arrival_quantity),
                        state: marketData.state,
                        date: marketData.date,
                        dataSourceStatus: "Live Mandi Data"
                    } : null
                };
            }));

            // 4. Final Ranking based on Physical + Economic factors
            enhancedRecommendations.sort((a,b) => b.score - a.score);
            return enhancedRecommendations;

        } catch (aiError) {
            console.error('AI Service Error:', aiError.message);
            return [];
        }

    } catch (error) {
        console.error('Error in recommendation bridge:', error.message);
        return [];
    }
};

const getPriceForecast = async (cropName) => {
    try {
        console.log(`Fetching price forecast for crop: ${cropName}`);
        const response = await axios.post(`${AI_SERVICE_URL}/predict-price?crop_name=${encodeURIComponent(cropName)}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching price forecast from AI:', error.message);
        throw new Error('Failed to fetch price forecast');
    }
};

module.exports = { calculateRecommendation, getPriceForecast };
