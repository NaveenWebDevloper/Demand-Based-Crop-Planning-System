const axios = require('axios');
const MarketPriceModel = require('../Models/MarketPrice.model');
const MarketDemandModel = require('../Models/MarketDemand.model');
const cron = require('node-cron');

// Agmarknet API example endpoint
const AGMARKNET_API_URL = 'https://api.data.gov.in/resource/9ef27c38-98df-4584-a57d-42c7a4d956ed'; 

const fetchMarketData = async () => {
    try {
        const apiKey = process.env.GOVT_MARKET_API_KEY;
        if (!apiKey) {
            console.error('GOVT_MARKET_API_KEY is missing');
            return;
        }

        const response = await axios.get(`${AGMARKNET_API_URL}?api-key=${apiKey}&format=json&limit=100`);
        const records = response.data.records;

        if (!records) return;

        for (const record of records) {
            // 1. Save to MarketPrice (Historical Data for AI)
            await MarketPriceModel.findOneAndUpdate(
                { 
                    crop_name: record.commodity, 
                    market_name: record.market,
                    state: record.state,
                    date: new Date(record.arrival_date) 
                },
                {
                    crop_name: record.commodity,
                    market_name: record.market,
                    region: record.district,
                    state: record.state,
                    date: new Date(record.arrival_date),
                    arrival_quantity: parseFloat(record.arrival_volume) || 0,
                    price_min: parseFloat(record.min_price) || 0,
                    price_max: parseFloat(record.max_price) || 0,
                    price_modal: parseFloat(record.modal_price) || 0
                },
                { upsert: true }
            );

            // 2. Keep legacy MarketDemand updated for heatmap
            await MarketDemandModel.findOneAndUpdate(
                { 
                    crop_name: record.commodity, 
                    region: record.district, 
                    market_name: record.market,
                    date: new Date(record.arrival_date) 
                },
                {
                    crop_name: record.commodity,
                    region: record.district,
                    market_name: record.market,
                    price: parseFloat(record.modal_price) / 100, 
                    quantity: parseFloat(record.arrival_volume) || 0,
                    quantityUnit: 'quintal',
                    demandLevel: 'medium',
                    arrival_volume: parseFloat(record.arrival_volume) || 0,
                    date: new Date(record.arrival_date)
                },
                { upsert: true }
            );
        }
        console.log('Market data updated successfully');
    } catch (error) {
        console.error('Error fetching market data:', error.message);
    }
};

// Schedule cron job to run daily at midnight
cron.schedule('0 0 * * *', () => {
    console.log('Running daily market data fetch...');
    fetchMarketData();
});

module.exports = { fetchMarketData };
